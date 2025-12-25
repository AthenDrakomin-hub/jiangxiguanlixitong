// api/roles.ts
// 角色管理 API（Edge Runtime）

import { dbManager } from '../lib/database.js';
import { Role } from '../types.js';

export const config = {
  runtime: 'edge',
};

// CORS 头设置
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理预检请求
function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// 获取角色列表
async function getRoles() {
  try {
    const dbManagerInstance = dbManager;
    if (!dbManagerInstance.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManagerInstance.initialize({ type: dbType as any });
    }
    
    const db = dbManagerInstance.getDatabase();
    const roles = await db.getAll<Role>('roles:');
    
    return new Response(
      JSON.stringify({
        success: true,
        data: roles,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('获取角色列表失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取角色列表失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 根据ID获取单个角色
async function getRoleById(id: string) {
  try {
    const dbManagerInstance = dbManager;
    if (!dbManagerInstance.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManagerInstance.initialize({ type: dbType as any });
    }
    
    const db = dbManagerInstance.getDatabase();
    const role = await db.get<Role>(`roles:${id}`);
    
    if (!role) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '角色不存在',
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: role,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('获取角色失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取角色失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 创建新角色
async function createRole(roleData: any) {
  try {
    // 验证必需字段
    if (!roleData.name || !roleData.permissions) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '缺少必需字段：name, permissions',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const dbManagerInstance = dbManager;
    if (!dbManagerInstance.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManagerInstance.initialize({ type: dbType as any });
    }
    
    const db = dbManagerInstance.getDatabase();
    
    // 检查角色名称是否已存在
    const existingRoles = await db.getAll<Role>('roles:');
    const existingRole = existingRoles.find(r => r.name === roleData.name);
    if (existingRole) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '角色名称已存在',
        }),
        {
          status: 409,
          headers: corsHeaders,
        }
      );
    }
    
    // 创建角色对象
    const newRole: Role = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      name: roleData.name,
      description: roleData.description || '',
      permissions: Array.isArray(roleData.permissions) ? roleData.permissions : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 保存到数据库
    await db.create('roles', newRole);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: newRole,
        message: '角色创建成功',
      }),
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('创建角色失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '创建角色失败',
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 更新角色
async function updateRole(id: string, roleData: any) {
  try {
    const dbManagerInstance = dbManager;
    if (!dbManagerInstance.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManagerInstance.initialize({ type: dbType as any });
    }
    
    const db = dbManagerInstance.getDatabase();
    const existingRole = await db.get<Role>(`roles:${id}`);
    
    if (!existingRole) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '角色不存在',
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    // 準備更新數據
    const updateData: Partial<Role> = {
      ...roleData,
      updatedAt: new Date().toISOString(),
    };
    
    // 移除不允許更新的字段
    delete (updateData as any).id;
    delete (updateData as any).createdAt;
    
    // 執行更新
    const updatedRole = await db.update('roles', id, updateData as Partial<Role>);
    
    if (!updatedRole) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '更新角色失敗',
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: updatedRole,
        message: '角色更新成功',
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('更新角色失敗:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '更新角色失敗',
        error: error instanceof Error ? error.message : '未知錯誤',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 刪除角色
async function deleteRole(id: string) {
  try {
    const dbManagerInstance = dbManager;
    if (!dbManagerInstance.isInitialized()) {
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManagerInstance.initialize({ type: dbType as any });
    }
    
    const db = dbManagerInstance.getDatabase();
    const existingRole = await db.get<Role>(`roles:${id}`);
    
    if (!existingRole) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '角色不存在',
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    // 防止刪除系統關鍵角色
    if (existingRole.name === 'admin' || existingRole.name === 'superadmin') {
      return new Response(
        JSON.stringify({
          success: false,
          message: '無法刪除系統關鍵角色',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    const success = await db.remove('roles', id);
    
    if (success) {
      return new Response(
        JSON.stringify({
          success: true,
          message: '角色刪除成功',
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: '角色刪除失敗',
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
    console.error('刪除角色失敗:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '刪除角色失敗',
        error: error instanceof Error ? error.message : '未知錯誤',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export default async function handler(req: Request) {
  // 處理預檢請求
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const roleId = pathParts[pathParts.length - 1]; // 獲取路徑中的角色ID（如果存在）
    
    // 對於敏感操作（POST, PUT, DELETE）添加認證保護
    if (req.method !== 'GET') {
      const authHeader = req.headers.get('Authorization');
      const adminKey = process.env.ADMIN_KEY || process.env.VITE_ADMIN_KEY;
      
      // 驗證Bearer認證頭
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({
            success: false,
            message: '認證失敗：缺少 Bearer Token',
          }),
          {
            status: 401,
            headers: corsHeaders,
          }
        );
      }
      
      const providedKey = authHeader.substring(7); // 移除 "Bearer " 前綴
      
      if (!adminKey || providedKey !== adminKey) {
        return new Response(
          JSON.stringify({
            success: false,
            message: '認證失敗：密鑰不匹配',
          }),
          {
            status: 401,
            headers: corsHeaders,
          }
        );
      }
    }
    
    // 檢查是否是獲取特定角色信息的請求
    const isSpecificRole = req.method === 'GET' && roleId && (/^[0-9]+$/.test(roleId) || /^[a-zA-Z0-9]+$/.test(roleId));
    
    switch (req.method) {
      case 'GET':
        if (isSpecificRole) {
          return await getRoleById(roleId);
        } else {
          return await getRoles();
        }
      case 'POST':
        const createData = await req.json();
        return await createRole(createData);
      case 'PUT':
        if (!roleId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: '缺少角色ID',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        const updateData = await req.json();
        return await updateRole(roleId, updateData);
      case 'DELETE':
        if (!roleId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: '缺少角色ID',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        return await deleteRole(roleId);
      default:
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Method not allowed',
          }),
          {
            status: 405,
            headers: corsHeaders,
          }
        );
    }
  } catch (error) {
    console.error('處理請求失敗:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '內部服務器錯誤',
        error: error instanceof Error ? error.message : '未知錯誤',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}