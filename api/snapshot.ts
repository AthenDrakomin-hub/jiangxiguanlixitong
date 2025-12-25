
import { dbManager } from '../lib/database.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // CORS 头设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    if (req.method === 'POST') {
      const body = await req.json();
      const { snapshot, action, snapshotId, compareWith } = body;
      
      // 对于敏感操作（restore）添加权限校验
      if (action === 'restore') {
        const authHeader = req.headers.get('Authorization');
        const adminUser = process.env.VITE_ADMIN_USER || 'admin';
        const adminPass = process.env.VITE_ADMIN_PASS || 'admin123';
        
        // 验证Basic认证头
        if (!authHeader || !authHeader.startsWith('Basic ')) {
          return new Response(
            JSON.stringify({
              success: false,
              message: '恢复操作需要管理员权限',
            }),
            {
              status: 401,
              headers: corsHeaders,
            }
          );
        }
        
        // 解码Base64认证信息
        try {
          const base64Credentials = authHeader.split(' ')[1];
          const credentials = atob(base64Credentials);
          const [username, password] = credentials.split(':');
          
          if (username !== adminUser || password !== adminPass) {
            return new Response(
              JSON.stringify({
                success: false,
                message: '恢复操作需要管理员权限',
              }),
              {
                status: 401,
                headers: corsHeaders,
              }
            );
          }
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              message: '恢复操作需要管理员权限',
            }),
            {
              status: 401,
              headers: corsHeaders,
            }
          );
        }
      }

      // 根据操作类型执行不同的快照操作
      switch (action) {
        case 'create':
          if (!snapshot) {
            return new Response(
              JSON.stringify({
                success: false,
                message: '快照数据是必需的',
              }),
              {
                status: 400,
                headers: corsHeaders,
              }
            );
          }
          
          // 获取Git Commit信息（如果可用）
          const gitCommitHash = process.env.VERCEL_GIT_COMMIT_SHA || 
                               process.env.GITHUB_SHA || 
                               process.env.CI_COMMIT_SHA || 
                               'unknown';
          const gitCommitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE || 'unknown';
          const gitCommitAuthor = process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME || 'unknown';
          const gitRepositoryUrl = process.env.VERCEL_GIT_REPO_URL || 'unknown';
          
          // 保存快照到数据库
          const db = dbManager.getDatabase();
          const snapshotKey = `snapshot:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          await db.set(snapshotKey, {
            ...snapshot,
            id: snapshotKey,
            createdAt: new Date().toISOString(),
            gitCommitHash, // 关联Git Commit Hash
            gitCommitMessage, // 关联Git Commit Message
            gitCommitAuthor, // 关联Git Commit Author
            gitRepositoryUrl, // 关联Git Repository URL
            description: body.description || '数据快照',
          });
          
          return new Response(
            JSON.stringify({
              success: true,
              message: '快照已创建',
              id: snapshotKey,
            }),
            {
              status: 200,
              headers: corsHeaders,
            }
          );
          
        case 'list':
          // 返回所有可用的快照列表
          const dbList = dbManager.getDatabase();
          const snapshots = await dbList.getAll<any>('snapshot:');
          
          return new Response(
            JSON.stringify({
              success: true,
              snapshots: snapshots.map(s => ({
                id: s.id,
                createdAt: s.createdAt,
                description: s.description || '数据快照',
              })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            }),
            {
              status: 200,
              headers: corsHeaders,
            }
          );
          
        case 'restore':
          if (!snapshotId) {
            return new Response(
              JSON.stringify({
                success: false,
                message: '快照ID是必需的',
              }),
              {
                status: 400,
                headers: corsHeaders,
              }
            );
          }
          
          // 从快照恢复数据
          const dbRestore = dbManager.getDatabase();
          const snapshotToRestore = await dbRestore.get<any>(snapshotId);
          
          if (!snapshotToRestore) {
            return new Response(
              JSON.stringify({
                success: false,
                message: '快照不存在',
              }),
              {
                status: 404,
                headers: corsHeaders,
              }
            );
          }
          
          // 恢复数据
          for (const [collection, items] of Object.entries(snapshotToRestore.data || {})) {
            if (Array.isArray(items)) {
              for (const item of items) {
                await dbRestore.set(`${collection}:${item.id}`, item);
              }
            }
          }
          
          // 记录审计日志
          try {
            const auditLog = {
              action: 'snapshot_restore',
              userId: 'system', // 在API中可能无法获取用户ID，这里使用system
              snapshotId: snapshotId,
              details: {
                snapshotId: snapshotId,
                restoredAt: new Date().toISOString(),
                restoredBy: 'API',
              },
              timestamp: new Date().toISOString(),
            };
            
            // 尝试记录审计日志，但不阻塞恢复操作
            const auditResponse = await fetch(`${req.url.replace(/\/snapshot$/, '/audit-log')}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(auditLog),
            });
          } catch (auditError) {
            // 在生产环境中避免输出可能包含敏感信息的错误详情
            const isProduction = process.env.NODE_ENV === 'production';
            if (!isProduction) {
              console.error('记录审计日志失败:', auditError);
            } else {
              console.error('记录审计日志失败:', auditError instanceof Error ? auditError.message : '未知错误');
            }
            // 不抛出错误，继续执行
          }
          
          return new Response(
            JSON.stringify({
              success: true,
              message: '快照已恢复',
              id: snapshotId,
            }),
            {
              status: 200,
              headers: corsHeaders,
            }
          );
          
        case 'compare':
          if (!snapshotId || !compareWith) {
            return new Response(
              JSON.stringify({
                success: false,
                message: '需要提供两个快照ID进行比较',
              }),
              {
                status: 400,
                headers: corsHeaders,
              }
            );
          }
          
          // 比较两个快照
          const dbCompare = dbManager.getDatabase();
          const snapshot1 = await dbCompare.get<any>(snapshotId);
          const snapshot2 = await dbCompare.get<any>(compareWith);
          
          if (!snapshot1 || !snapshot2) {
            return new Response(
              JSON.stringify({
                success: false,
                message: '快照不存在',
              }),
              {
                status: 404,
                headers: corsHeaders,
              }
            );
          }
          
          // 计算差异
          const differences = calculateSnapshotDifferences(snapshot1, snapshot2);
          
          return new Response(
            JSON.stringify({
              success: true,
              differences,
            }),
            {
              status: 200,
              headers: corsHeaders,
            }
          );
          
        default:
          return new Response(
            JSON.stringify({
              success: false,
              message: `不支持的快照操作: ${action}`,
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
      }
    }

    // GET 请求：返回所有快照
    if (req.method === 'GET') {
      const dbGet = dbManager.getDatabase();
      const allSnapshots = await dbGet.getAll<any>('snapshot:');
      
      return new Response(
        JSON.stringify({
          success: true,
          snapshots: allSnapshots.map(s => ({
            id: s.id,
            createdAt: s.createdAt,
            description: s.description || '数据快照',
          })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          Allow: 'GET, POST, OPTIONS',
        },
      }
    );
  } catch (error) {
    // 在生产环境中避免输出可能包含敏感信息的错误详情
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.error('快照API错误:', error);
    } else {
      console.error('快照API错误:', error instanceof Error ? error.message : '未知错误');
    }
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 计算两个快照之间的差异
function calculateSnapshotDifferences(snapshot1: any, snapshot2: any): any {
  const differences: any = {};
  
  // 比较所有数据集合
  const allCollections = new Set([
    ...Object.keys(snapshot1.data || {}), 
    ...Object.keys(snapshot2.data || {})
  ]);
  
  for (const collection of allCollections) {
    const data1 = snapshot1.data?.[collection] || [];
    const data2 = snapshot2.data?.[collection] || [];
    
    // 创建ID到对象的映射
    const map1 = new Map(data1.map((item: any) => [item.id, item]));
    const map2 = new Map(data2.map((item: any) => [item.id, item]));
    
    // 找出新增、删除和修改的项目
    const added: any[] = [];
    const removed: any[] = [];
    const modified: any[] = [];
    
    // 检查在snapshot2中新增的项目
    for (const item of data2) {
      if (!map1.has(item.id)) {
        added.push(item);
      }
    }
    
    // 检查在snapshot1中删除的项目
    for (const item of data1) {
      if (!map2.has(item.id)) {
        removed.push(item);
      }
    }
    
    // 检查修改的项目
    for (const item of data1) {
      if (map2.has(item.id)) {
        const item2 = map2.get(item.id);
        // 比较对象属性
        const diff = getObjectDifferences(item, item2);
        if (Object.keys(diff).length > 0) {
          modified.push({
            id: item.id,
            before: item,
            after: item2,
            changes: diff,
          });
        }
      }
    }
    
    if (added.length > 0 || removed.length > 0 || modified.length > 0) {
      differences[collection] = {
        added: added.length,
        removed: removed.length,
        modified: modified.length,
        details: {
          added: added,
          removed: removed,
          modified: modified,
        }
      };
    }
  }
  
  return differences;
}

// 比较两个对象的差异
function getObjectDifferences(obj1: any, obj2: any): any {
  const diff: any = {};
  
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
  
  for (const key of allKeys) {
    if (key === 'updatedAt' || key === 'createdAt') continue; // 忽略时间戳字段
    
    if (obj1?.[key] !== obj2?.[key]) {
      diff[key] = {
        from: obj1?.[key],
        to: obj2?.[key]
      };
    }
  }
  
  return diff;
}