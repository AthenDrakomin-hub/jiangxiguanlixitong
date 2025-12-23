/**
 * 验证清理后的菜品数据
 */

import 'dotenv/config';
import { getRedisClient } from '../lib/redis.js';

// 定义数据类型接口
interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  spiciness: number;
  createdAt?: string;
  updatedAt?: string;
}

async function verifyCleanedData() {
  console.log('🔍 开始验证清理后的菜品数据...\n');

  try {
    const redis = getRedisClient();
    
    // 获取所有菜品键（排除索引）
    const dishKeys = await redis.keys('dishes:*');
    const dishDataKeys = dishKeys.filter(key => !key.includes(':index'));
    
    console.log(`🍽️ 剩余菜品数量: ${dishDataKeys.length}\n`);
    
    // 获取所有菜品数据
    const dishes: Dish[] = [];
    for (const key of dishDataKeys) {
      const dishRaw = await redis.get(key);
      if (dishRaw && typeof dishRaw === 'object') {
        const dish = dishRaw as Dish;
        dishes.push(dish);
      }
    }
    
    // 按名称分组，检查是否还有重复
    const dishesByName = new Map<string, Dish[]>();
    for (const dish of dishes) {
      const name = dish.name;
      if (!dishesByName.has(name)) {
        dishesByName.set(name, []);
      }
      dishesByName.get(name)!.push(dish);
    }
    
    // 检查重复项
    let duplicateCount = 0;
    for (const [name, dishList] of dishesByName) {
      if (dishList.length > 1) {
        console.log(`⚠️ 仍然存在重复菜品: ${name} (${dishList.length} 个)`);
        duplicateCount++;
      }
    }
    
    if (duplicateCount === 0) {
      console.log('✅ 没有发现重复菜品\n');
    } else {
      console.log(`⚠️ 仍存在 ${duplicateCount} 个重复菜品名称\n`);
    }
    
    // 按分类统计
    const dishesByCategory = new Map<string, number>();
    for (const dish of dishes) {
      const category = dish.category || '未分类';
      dishesByCategory.set(category, (dishesByCategory.get(category) || 0) + 1);
    }
    
    console.log('📊 按分类统计:');
    for (const [category, count] of dishesByCategory) {
      console.log(`   ${category}: ${count} 个`);
    }
    
    // 检查主要分类
    const mainCategories = ['主食', '小炒', '汤类', '饮料', '特色菜', '套餐'];
    console.log('\n📋 主要分类检查:');
    for (const category of mainCategories) {
      const count = dishesByCategory.get(category) || 0;
      console.log(`   ${category}: ${count} 个`);
    }
    
    console.log(`\n✅ 验证完成！`);
    console.log(`总菜品数: ${dishes.length}`);
    console.log(`分类数: ${dishesByCategory.size}`);
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error instanceof Error ? error.message : String(error));
  }
}

verifyCleanedData().catch(console.error);