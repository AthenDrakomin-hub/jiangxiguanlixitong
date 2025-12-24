import { kvClient } from '../lib/kv-client.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const method = req.method;
  
  // CORS 头设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (method !== 'GET') {
    return new Response(
      JSON.stringify({
        success: false,
        message: '仅支持 GET 请求',
      }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  try {
    const connectionStatus = kvClient.getConnectionStatus();
    
    // 如果不是真实连接，提供更明确的提示
    if (!connectionStatus.isRealConnection) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '未连接到真实的Vercel KV数据库',
          connectionStatus,
          hint: '请在Vercel控制台连接KV数据库后重试',
        }),
        {
          status: 200, // 使用200状态码，但success为false
          headers: corsHeaders,
        }
      );
    }

    // 如果是真实连接，检查是否可以访问
    if (!kvClient.isConnected()) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '数据库连接不可用',
          connectionStatus,
        }),
        {
          status: 503,
          headers: corsHeaders,
        }
      );
    }

    // 尝试获取一些统计信息
    const collections = [
      'dishes',
      'orders',
      'expenses',
      'inventory',
      'ktv_rooms',
      'sign_bill_accounts',
      'hotel_rooms',
      'payment_methods',
      'system_settings',
    ];

    const stats = {};
    for (const collection of collections) {
      try {
        const items = await kvClient.getAll(collection);
        stats[collection] = Array.isArray(items) ? items.length : 0;
      } catch (error) {
        stats[collection] = 'error';
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '数据库连接正常',
        connectionStatus,
        stats,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('DB Status error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '检查数据库状态时出错',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}