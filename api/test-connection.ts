/**
 * 数据库连接测试端点
 * 
 * 用于测试数据库连接状态
 * 使用 Edge Runtime 运行
 */

import { dbManager } from '../lib/database.js';

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
    // 检查数据库初始化状态
    if (!dbManager.isInitialized()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database not initialized',
          details: 'Database manager not initialized',
        }),
        { status: 503, headers: corsHeaders }
      );
    }

    // 获取数据库实例
    const database = dbManager.getDatabase();
    
    // 设置测试数据
    const testKey = `test:connection:${Date.now()}`;
    const testValue = {
      timestamp: new Date().toISOString(),
      message: 'Connection test successful',
      testId: testKey
    };
    
    // 写入测试数据
    await database.set(testKey, testValue);
    
    // 读取测试数据
    const retrievedValue = await database.get(testKey);
    
    // 删除测试数据
    await database.delete(testKey);
    
    const dataMatches = JSON.stringify(retrievedValue) === JSON.stringify(testValue);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database connection and operations successful',
        connection: { connected: true, type: 'database' },
        testData: retrievedValue,
        dataMatches,
        testWrite: !!retrievedValue,
        testRead: dataMatches,
        timestamp: new Date().toISOString(),
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