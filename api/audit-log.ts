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
      const { action, userId, snapshotId, details } = body;

      if (!action || !userId) {
        return new Response(
          JSON.stringify({
            success: false,
            message: '操作类型和用户ID是必需的',
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // 记录审计日志
      const db = dbManager.getDatabase();
      const logKey = `audit:${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      await db.set(logKey, {
        id: logKey,
        action,
        userId,
        snapshotId,
        details,
        timestamp: new Date().toISOString(),
        ip: getRealIP(req),
        userAgent: req.headers.get('user-agent') || '',
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: '审计日志已记录',
          id: logKey,
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    if (req.method === 'GET') {
      // 返回审计日志列表
      const db = dbManager.getDatabase();
      const logs = await db.getAll<any>('audit:');

      // 解析查询参数
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      const action = url.searchParams.get('action');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      
      let filteredLogs = logs;
      
      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }
      if (action) {
        filteredLogs = filteredLogs.filter(log => log.action === action);
      }
      
      // 按时间倒序排列并限制数量
      filteredLogs = filteredLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

      return new Response(
        JSON.stringify({
          success: true,
          logs: filteredLogs,
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
      console.error('审计日志API错误:', error);
    } else {
      console.error('审计日志API错误:', error instanceof Error ? error.message : '未知错误');
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

// 获取真实IP地址
function getRealIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  // 在Vercel Edge Functions中，我们可能无法直接获取客户端IP
  // 这里返回一个占位符，实际部署时Vercel会提供真实IP
  return req.headers.get('x-real-ip') || 'unknown';
}