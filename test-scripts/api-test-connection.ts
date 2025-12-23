/**
 * 数据库连接测试端点
 * 
 * 用于全面测试 Upstash Redis 连接状态
 * 包括连接验证、读写测试和错误诊断
 */

import { getRedisClient, getConnectionStatus, testRedisConnection } from '../lib/redis';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { method } = request;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only allow GET requests
  if (method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 1. 检查环境变量配置
    const envVars = {
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    };

    // 2. 检查连接状态
    const connectionStatus = getConnectionStatus();
    
    // 3. 执行连接测试
    const connectionTest = await testRedisConnection();
    
    // 4. 如果连接失败，返回详细错误信息
    if (!connectionTest.connected) {
      const errorResponse = {
        success: false,
        message: 'Database connection failed',
        connectionStatus,
        connectionTest,
        environment: {
          hasUrl: !!envVars.KV_REST_API_URL,
          hasToken: !!envVars.KV_REST_API_TOKEN,
          urlSet: !!envVars.KV_REST_API_URL,
        },
        timestamp: new Date().toISOString(),
      };
      
      return new Response(JSON.stringify(errorResponse), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 5. 如果连接成功，进行读写测试
    const redis = getRedisClient();
    
    // 6. 设置测试数据
    const testKey = `test:connection:${Date.now()}`;
    const testValue = {
      timestamp: new Date().toISOString(),
      message: 'Connection test successful',
      endpoint: process.env.KV_REST_API_URL,
    };
    
    // 7. 执行写操作
    await redis.set(testKey, testValue, { ex: 300 }); // 5分钟过期
    
    // 8. 执行读操作
    const retrievedValue = await redis.get(testKey);
    
    // 9. 验证读写操作
    const readWriteTest = {
      writeSuccess: true,
      readSuccess: !!retrievedValue,
      dataMatches: JSON.stringify(retrievedValue) === JSON.stringify(testValue),
    };
    
    // 10. 返回完整的连接测试结果
    const successResponse = {
      success: true,
      message: 'Database connection and operations successful',
      connectionStatus,
      connectionTest,
      readWriteTest,
      testData: retrievedValue,
      environment: {
        hasUrl: !!envVars.KV_REST_API_URL,
        hasToken: !!envVars.KV_REST_API_TOKEN,
      },
      timestamp: new Date().toISOString(),
    };
    
    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}