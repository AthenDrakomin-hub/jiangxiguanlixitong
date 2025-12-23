/**
 * 重建菜品索引
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

async function rebuildDishIndexes() {
  console.log('🔄 开始重建菜品索引...\n');

  try {
    const redis = getRedisClient();
    
    // 获取所有菜品键（排除索引）
    const dishKeys = await redis.keys('dishes:*');
    const dishDataKeys = dishKeys.filter(key => !key.includes(':index'));
    
    console.log(`🍽️ 发现 ${dishDataKeys.length} 个菜品\n`);
    
    // 获取所有菜品数据
    const dishes: Dish[] = [];
    for (const key of dishDataKeys) {
      const dishRaw = await redis.get(key);
      if (dishRaw && typeof dishRaw === 'object') {
        const dish = dishRaw as Dish;
        dishes.push(dish);
      }
    }
    
    // 按分类重建索引
    const dishesByCategory = new Map<string, string[]>();
    for (const dish of dishes) {
      const category = dish.category || '未分类';
      if (!dishesByCategory.has(category)) {
        dishesByCategory.set(category, []);
      }
      dishesByCategory.get(category)!.push(dish.id);
    }
    
    // 更新各类别索引
    console.log('🏗️ 更新各类别索引...');
    for (const [category, dishIds] of dishesByCategory) {
      const indexKey = `dishes:${category}:index`;
      await redis.set(indexKey, dishIds);
      console.log(`   更新索引 ${indexKey}: ${dishIds.length} 个菜品`);
    }
    
    // 更新总菜品索引
    const allDishIds = dishes.map(dish => dish.id);
    await redis.set('dishes:index', allDishIds);
    console.log(`   更新总索引 dishes:index: ${allDishIds.length} 个菜品\n`);
    
    console.log('✅ 索引重建完成！');
    console.log(`\n📊 重建统计:`);
    console.log(`- 总菜品数: ${dishes.length}`);
    console.log(`- 分类数: ${dishesByCategory.size}`);
    console.log(`- 索引更新: ${dishesByCategory.size + 1} 个`);
    
  } catch (error) {
    console.error('❌ 索引重建过程中发生错误:', error instanceof Error ? error.message : String(error));
  }
}

rebuildDishIndexes().catch(console.error);