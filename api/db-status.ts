import { kvClient } from '../lib/kv-client.js';

// Edge Runtime 配置
export const config = {
  runtime: 'edge',
};

/**
 * 数据库状态诊断端点
 * GET /api/db-status - 返回连接状态和键名列表
 */
export default async function handler(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // 获取连接状态
    const connectionStatus = kvClient.getConnectionStatus();

    if (!connectionStatus.connected) {
      return new Response(
        JSON.stringify({
          success: false,
          connected: false,
          message: 'KV client not connected',
          status: connectionStatus,
        }),
        { status: 503, headers: corsHeaders }
      );
    }

    // 获取所有集合的索引键名（前10个）
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

    const keysInfo: Record<string, { indexKeys: string[]; sampleKeys: string[] }> = {};

    for (const collection of collections) {
      try {
        // 获取索引中的前10个ID
        const indexKey = `${collection}:index`;
        const ids = await kvClient.getIndex(collection);
        const sampleIds = Array.isArray(ids) ? ids.slice(0, 10) : [];
        
        // 生成实际的键名
        const sampleKeys = sampleIds.map(id => `${collection}:${id}`);
        
        keysInfo[collection] = {
          indexKeys: [indexKey],
          sampleKeys: sampleKeys,
        };
      } catch (error) {
        keysInfo[collection] = {
          indexKeys: [],
          sampleKeys: [],
        };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        connected: true,
        status: connectionStatus,
        keys: keysInfo,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('DB Status Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
