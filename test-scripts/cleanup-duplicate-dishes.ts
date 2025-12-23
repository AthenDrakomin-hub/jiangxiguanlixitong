/**
 * 清理重复菜品并修复索引数据类型错误
 */

// 加载环境变量
import 'dotenv/config';

import { getRedisClient } from './lib/redis';

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

interface DishWithKey {
  key: string;
  data: Dish;
}

async function cleanupDuplicateDishes() {
  console.log('🧹 开始清理重复菜品并修复索引数据...\n');

  try {
    const redis = getRedisClient();
    
    // 获取所有菜品键
    const dishKeys = await redis.keys('dishes:*');
    console.log(`📋 发现 ${dishKeys.length} 个菜品项\n`);
    
    // 获取所有菜品数据
    const dishes: DishWithKey[] = [];
    for (const key of dishKeys) {
      if (!key.includes(':index')) { // 排除索引键
        const dishRaw = await redis.get(key);
        if (dishRaw && typeof dishRaw === 'object') {
          const dish = dishRaw as Dish;
          dishes.push({ key, data: dish });
        }
      }
    }
    
    console.log(`🍽️ 有效菜品数据: ${dishes.length} 条\n`);
    
    // 按名称分组，找出重复项
    const dishesByName = new Map<string, DishWithKey[]>();
    for (const dish of dishes) {
      const name = dish.data.name;
      if (!dishesByName.has(name)) {
        dishesByName.set(name, []);
      }
      dishesByName.get(name)!.push(dish);
    }
    
    // 识别重复菜品
    let duplicateCount = 0;
    const duplicates: string[] = [];
    
    for (const [name, dishList] of dishesByName) {
      if (dishList.length > 1) {
        console.log(`⚠️ 发现重复菜品: ${name} (${dishList.length} 个)`);
        for (let i = 0; i < dishList.length; i++) {
          console.log(`   - ${dishList[i].key} (价格: ₱${dishList[i].data.price})`);
        }
        console.log('');
        
        // 保留第一个，标记其余为删除
        for (let i = 1; i < dishList.length; i++) {
          duplicates.push(dishList[i].key);
        }
        duplicateCount += dishList.length - 1;
      }
    }
    
    console.log(`📊 重复菜品统计: ${duplicateCount} 个重复项\n`);
    
    // 删除重复菜品
    if (duplicates.length > 0) {
      console.log('🗑️ 开始删除重复菜品...');
      for (const key of duplicates) {
        await redis.del(key);
        console.log(`   已删除: ${key}`);
      }
      console.log(`✅ 成功删除 ${duplicates.length} 个重复菜品\n`);
    } else {
      console.log('✅ 没有发现重复菜品\n');
    }
    
    // 修复索引数据
    console.log('🔧 开始修复索引数据...');
    const indexKeys = await redis.keys('*:index');
    
    for (const indexKey of indexKeys) {
      try {
        // 检查索引键的类型
        const indexValue = await redis.get(indexKey);
        
        if (Array.isArray(indexValue)) {
          console.log(`   索引 ${indexKey}: ${indexValue.length} 个条目 (正常)`);
        } else if (typeof indexValue === 'string') {
          // 如果是字符串，尝试解析为数组
          try {
            const parsedArray = JSON.parse(indexValue);
            if (Array.isArray(parsedArray)) {
              console.log(`   修复索引 ${indexKey}: 从字符串转换为数组 (${parsedArray.length} 个条目)`);
              await redis.set(indexKey, parsedArray);
            }
          } catch (e) {
            console.log(`   索引 ${indexKey}: 非数组格式，跳过`);
          }
        } else {
          console.log(`   索引 ${indexKey}: 未知格式，跳过`);
        }
      } catch (error) {
        console.log(`   读取索引 ${indexKey} 时出错:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    // 重建菜品索引
    console.log('\n🔄 重建菜品索引...');
    const allDishesAfterCleanup: Dish[] = [];
    for (const key of dishKeys) {
      if (!key.includes(':index')) {
        const dishRaw = await redis.get(key);
        if (dishRaw && typeof dishRaw === 'object') {
          const dish = dishRaw as Dish;
          // 只添加未删除的菜品
          if (!duplicates.includes(key)) {
            allDishesAfterCleanup.push(dish);
          }
        }
      }
    }
    
    // 按分类重建索引
    const dishesByCategory = new Map<string, string[]>();
    for (const dish of allDishesAfterCleanup) {
      const category = dish.category || '未分类';
      if (!dishesByCategory.has(category)) {
        dishesByCategory.set(category, []);
      }
      dishesByCategory.get(category)!.push(dish.id);
    }
    
    // 更新各类别索引
    for (const [category, dishIds] of dishesByCategory) {
      const indexKey = `dishes:${category}:index`;
      await redis.set(indexKey, dishIds);
      console.log(`   更新索引 ${indexKey}: ${dishIds.length} 个菜品`);
    }
    
    // 更新总菜品索引
    const allDishIds = allDishesAfterCleanup.map(dish => dish.id);
    await redis.set('dishes:index', allDishIds);
    console.log(`   更新总索引 dishes:index: ${allDishIds.length} 个菜品\n`);
    
    // 验证清理结果
    const remainingDishKeys = await redis.keys('dishes:*');
    const remainingDishes = remainingDishKeys.filter(key => !key.includes(':index'));
    const remainingIndexKeys = remainingDishKeys.filter(key => key.includes(':index'));
    
    console.log('✅ 清理完成!');
    console.log(`\n📊 清理后统计:`);
    console.log(`- 剩余菜品: ${remainingDishes.length} 个`);
    console.log(`- 索引数量: ${remainingIndexKeys.length} 个`);
    console.log(`- 删除重复项: ${duplicates.length} 个`);
    
    console.log('\n🎉 菜品数据清理和索引修复完成！');
    
  } catch (error) {
    console.error('❌ 清理过程中发生错误:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 执行清理
cleanupDuplicateDishes().catch(console.error);
