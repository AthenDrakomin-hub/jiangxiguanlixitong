// test-scripts/test-list-keys.ts
// 测试列出所有KV存储中的键

import { kvClient } from '../lib/kv-client.js';

async function testListKeys() {
  console.log('🔍 测试列出KV存储中的键...');

  if (!kvClient.isConnected()) {
    console.log('❌ KV客户端未连接');
    return;
  }

  try {
    // 获取所有集合的索引键
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

    console.log('\n📋 集合数据统计:');
    for (const collection of collections) {
      try {
        const items = await kvClient.getAll(collection);
        const count = Array.isArray(items) ? items.length : 0;
        console.log(`  ${collection}: ${count} 条记录`);
      } catch (error) {
        console.log(`  ${collection}: 读取失败 - ${(error as Error).message}`);
      }
    }

    console.log('\n✅ 键列表测试完成');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testListKeys().catch(console.error);