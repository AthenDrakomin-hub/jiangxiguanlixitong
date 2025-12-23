/**
 * 列出数据库中的所有键值对
 * 
 * 用于查看当前数据库中存储的数据
 */

// 加载环境变量
import 'dotenv/config';

import { getRedisClient } from './lib/redis';

async function listAllKeys() {
  console.log('🔍 开始列出数据库中的所有键值对...\n');

  try {
    const redis = getRedisClient();
    
    // 获取所有键（使用通配符 *）
    const allKeys = await redis.keys('*');
    
    if (allKeys.length === 0) {
      console.log('📋 数据库中没有找到任何键值对');
      return;
    }

    console.log(`📋 找到 ${allKeys.length} 个键:\n`);
    
    // 逐个获取每个键的值
    for (const key of allKeys) {
      try {
        // 尝试获取值
        const value = await redis.get(key);
        
        // 输出键和值
        console.log(`🔑 键: ${key}`);
        console.log(`📦 值:`, value);
        console.log('---');
      } catch (err) {
        console.log(`🔑 键: ${key}`);
        console.log(`❌ 读取值时出错:`, err instanceof Error ? err.message : String(err));
        console.log('---');
      }
    }
    
    // 特别查看与订单、菜品等相关的键
    console.log('\n🔍 搜索特定类型的数据...');
    const orderKeys = allKeys.filter(key => key.includes('order'));
    const dishKeys = allKeys.filter(key => key.includes('dish'));
    const indexKeys = allKeys.filter(key => key.includes('index'));
    
    if (orderKeys.length > 0) {
      console.log(`\n📋 订单相关键 (${orderKeys.length} 个):`);
      for (const key of orderKeys) {
        console.log(`  - ${key}`);
      }
    }
    
    if (dishKeys.length > 0) {
      console.log(`\n📋 菜品相关键 (${dishKeys.length} 个):`);
      for (const key of dishKeys) {
        console.log(`  - ${key}`);
      }
    }
    
    if (indexKeys.length > 0) {
      console.log(`\n📋 索引相关键 (${indexKeys.length} 个):`);
      for (const key of indexKeys) {
        console.log(`  - ${key}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 列出键值对时发生错误:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 执行测试
listAllKeys().catch(console.error);