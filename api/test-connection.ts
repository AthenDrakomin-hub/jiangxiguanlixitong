/**
 * 数据库连接测试端点
 * 
 * 用于测试数据库连接状态
 * 使用 Edge Runtime 运行
 */

import { dbManager } from '../lib/database.js';
import { DatabaseConfig, StorageType } from '../types.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://www.jiangxijiudian.store',
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
    // 检查数据库初始化状态，如果没有初始化，则先初始化
    if (!dbManager.isInitialized()) {
      console.log('Database not initialized, initializing now...');
      const dbType = (process.env.DB_TYPE || 'memory') as StorageType;
      const config: DatabaseConfig = {
        type: dbType,
        settings: dbType === 'neon' ? { 
          connectionString: process.env.NEON_CONNECTION_STRING || '' 
        } : null
      };
      
      try {
        await dbManager.initialize(config);
        console.log(`Database initialized with type: ${dbType}`);
      } catch (initError) {
        console.error('Failed to initialize database:', initError);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to initialize database',
            details: initError instanceof Error ? initError.message : 'Unknown initialization error',
          }),
          { status: 503, headers: corsHeaders }
        );
      }
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
        connection: { 
          connected: true, 
          type: process.env.DB_TYPE || 'memory',
          isRealConnection: (process.env.DB_TYPE && process.env.DB_TYPE !== 'memory') || false
        },
        testData: retrievedValue,
        dataMatches,
        testWrite: !!retrievedValue,
        testRead: dataMatches,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Database connection test failed:', error);
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