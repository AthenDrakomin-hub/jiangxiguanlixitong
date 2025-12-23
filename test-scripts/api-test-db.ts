/**
 * 数据库连接测试端点
 * 
 * 用于测试 Upstash Redis 连接状态
 * 使用 Edge Runtime 运行
 */

import { getRedisClient, testRedisConnection } from '../lib/redis.js';

export const config = {
  runtime: 'edge',
};

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
        error: 'Method not allowed. Use GET',
      }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // 测试连接
    const connectionTest = await testRedisConnection();
    
    if (!connectionTest.connected) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database connection failed',
          details: connectionTest.error,
        }),
        { status: 503, headers: corsHeaders }
      );
    }

    // 获取 Redis 客户端
    const redis = getRedisClient();
    
    // 设置测试数据
    const testKey = 'test:connection';
    const testValue = {
      timestamp: new Date().toISOString(),
      message: 'Connection successful',
      endpoint: 'https://suited-bream-41078.upstash.io'
    };
    
    await redis.set(testKey, testValue, { ex: 60 }); // 60秒过期
    
    // 读取测试数据
    const storedValue = await redis.get(testKey);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database connection and operations successful',
        connection: connectionTest,
        testWrite: !!storedValue,
        testData: storedValue,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}