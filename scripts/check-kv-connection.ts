import 'dotenv/config';
import { testRedisConnection, getConnectionStatus } from '../lib/redis.js';

async function checkConnection() {
  console.log('🔍 检查KV数据库连接状态...');
  
  // 检查连接状态
  const status = getConnectionStatus();
  console.log('\n📋 连接状态详情:');
  console.log(`  已初始化: ${status.initialized}`);
  console.log(`  URL配置: ${status.hasUrl ? '✅' : '❌'}`);
  console.log(`  Token配置: ${status.hasToken ? '✅' : '❌'}`);
  console.log(`  准备就绪: ${status.ready ? '✅' : '❌'}`);
  
  if (!status.hasUrl || !status.hasToken) {
    console.log('\n❌ 缺少必要的环境变量:');
    console.log('   请确保设置了以下环境变量:');
    console.log('   - KV_REST_API_URL');
    console.log('   - KV_REST_API_TOKEN');
    console.log('\n   在Vercel项目中链接KV服务后会自动生成这些变量');
    return;
  }
  
  console.log('\n📡 测试Redis连接...');
  const result = await testRedisConnection();
  
  if (result.connected) {
    console.log('✅ Redis连接测试成功!');
    console.log('   服务器响应:', result.info?.ping);
  } else {
    console.log('❌ Redis连接测试失败:');
    console.log('   错误信息:', result.error);
  }
}

// 执行检查
checkConnection().catch(console.error);
