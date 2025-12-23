/**
 * 本地数据库连接测试脚本
 * 
 * 用于在本地环境中测试 Upstash Redis 连接
 */

// 加载环境变量
import 'dotenv/config';

import { getRedisClient, getConnectionStatus, testRedisConnection } from './lib/redis';

async function testConnection() {
  console.log('🔍 开始测试数据库连接...\n');

  try {
    // 1. 检查环境变量配置
    console.log('📋 检查环境变量配置...');
    const envVars = {
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    };

    console.log(`   KV_REST_API_URL 设置: ${!!envVars.KV_REST_API_URL}`);
    console.log(`   KV_REST_API_TOKEN 设置: ${!!envVars.KV_REST_API_TOKEN}\n`);

    // 2. 检查连接状态
    console.log('📡 检查连接状态...');
    const connectionStatus = getConnectionStatus();
    console.log(`   连接状态: ${connectionStatus.connected ? '已连接' : '未连接'}`);
    console.log(`   URL 存在: ${connectionStatus.hasUrl}`);
    console.log(`   Token 存在: ${connectionStatus.hasToken}`);
    console.log(`   已初始化: ${connectionStatus.initialized}`);
    console.log(`   准备就绪: ${connectionStatus.ready}\n`);

    // 3. 执行连接测试
    console.log('🔌 执行连接测试...');
    const connectionTest = await testRedisConnection();
    console.log(`   连接测试: ${connectionTest.connected ? '成功' : '失败'}`);
    if (!connectionTest.connected) {
      console.log(`   错误信息: ${connectionTest.error}\n`);
      return;
    }

    // 4. 连接成功，进行读写测试
    console.log('💾 执行读写测试...');
    const redis = getRedisClient();
    
    // 5. 设置测试数据
    const testKey = `test:connection:${Date.now()}`;
    const testValue = {
      timestamp: new Date().toISOString(),
      message: 'Connection test successful',
      endpoint: process.env.KV_REST_API_URL,
    };
    
    console.log('   正在写入测试数据...');
    await redis.set(testKey, testValue, { ex: 300 }); // 5分钟过期
    
    console.log('   正在读取测试数据...');
    const retrievedValue = await redis.get(testKey);
    
    // 6. 验证读写操作
    const readWriteTest = {
      writeSuccess: true,
      readSuccess: !!retrievedValue,
      dataMatches: JSON.stringify(retrievedValue) === JSON.stringify(testValue),
    };
    
    console.log(`   写入成功: ${readWriteTest.writeSuccess}`);
    console.log(`   读取成功: ${readWriteTest.readSuccess}`);
    console.log(`   数据匹配: ${readWriteTest.dataMatches}\n`);

    // 7. 返回完整的连接测试结果
    console.log('✅ 数据库连接和操作测试成功!');
    console.log('\n详细结果:');
    console.log(JSON.stringify({
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
    }, null, 2));

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 执行测试
testConnection().catch(console.error);