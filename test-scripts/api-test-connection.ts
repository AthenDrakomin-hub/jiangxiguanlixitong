// test-scripts/api-test-connection.ts
// 测试API连接和基本功能

import { kvClient } from '../lib/kv-client.js';

async function testConnection() {
  console.log('🔍 测试KV客户端连接...');

  // 检查连接状态
  const status = kvClient.getConnectionStatus();
  console.log('📋 连接状态:', status);

  if (!status.connected) {
    console.log('❌ KV客户端未连接');
    return;
  }

  console.log('✅ KV客户端连接正常');

  // 测试基本操作
  try {
    // 测试获取所有集合数据
    console.log('\n🧪 测试数据操作...');
    
    // 测试获取房间数据
    const rooms = await kvClient.getAll('hotel_rooms');
    console.log(`✅ 成功获取 ${rooms.length} 个房间数据`);

    // 测试获取菜品数据
    const dishes = await kvClient.getAll('dishes');
    console.log(`✅ 成功获取 ${dishes.length} 个菜品数据`);

    console.log('\n🎉 所有API连接测试通过！');
  } catch (error) {
    console.error('❌ API操作测试失败:', error);
  }
}

testConnection().catch(console.error);