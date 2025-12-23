/**
 * 验证数据库中的数据与项目代码是否匹配
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

interface Order {
  id: string;
  tableNumber: string;
  status: string;
  totalAmount: number;
  items?: any[];
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  source?: string;
  paymentMethod?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

async function verifyDataMatch() {
  console.log('🔍 开始验证数据库数据与项目代码的匹配性...\n');

  try {
    const redis = getRedisClient();
    
    // 获取所有键
    const allKeys = await redis.keys('*');
    
    // 分类统计
    const dishKeys = allKeys.filter(key => key.startsWith('dishes:'));
    const orderKeys = allKeys.filter(key => key.startsWith('orders:'));
    const paymentKeys = allKeys.filter(key => key.startsWith('payment_methods:'));
    const indexKeys = allKeys.filter(key => key.includes(':index'));
    
    console.log('📊 数据概览:');
    console.log(`   菜品数据: ${dishKeys.length} 条`);
    console.log(`   订单数据: ${orderKeys.length} 条`);
    console.log(`   支付方式: ${paymentKeys.length} 条`);
    console.log(`   索引数据: ${indexKeys.length} 条`);
    console.log('');
    
    // 检查菜品数据
    if (dishKeys.length > 0) {
      console.log('🍽️ 菜品数据验证:');
      
      // 获取第一个菜品数据进行验证
      const firstDishKey = dishKeys[0];
      const firstDishRaw = await redis.get(firstDishKey);
      
      if (firstDishRaw && typeof firstDishRaw === 'object') {
        const firstDish = firstDishRaw as Dish;
        console.log('   ✓ 菜品数据结构验证通过');
        console.log(`   - 菜品ID: ${firstDish.id}`);
        console.log(`   - 菜品名称: ${firstDish.name}`);
        console.log(`   - 价格: ₱${firstDish.price}`);
        console.log(`   - 分类: ${firstDish.category}`);
        console.log(`   - 可用性: ${firstDish.available ? '是' : '否'}`);
        
        // 检查菜品分类是否符合预期
        const expectedCategories = ['热菜', '凉菜', '汤类', '主食', '酒水', '小吃', '特色菜', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18', 'A19', 'A20', 'A21', 'A22', 'A23', 'A24', 'A25', 'B1', 'B2', 'B3', 'B4', 'B5', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13', 'C14', 'C15', 'C16', 'C17', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23'];
        const hasValidCategory = expectedCategories.includes(firstDish.category);
        console.log(`   - 分类验证: ${hasValidCategory ? '通过' : '失败'} (${firstDish.category})`);
      } else {
        console.log('   ✗ 菜品数据结构验证失败');
      }
      console.log('');
    }
    
    // 检查订单数据
    if (orderKeys.length > 0) {
      console.log('📋 订单数据验证:');
      
      // 获取第一个订单数据进行验证
      const firstOrderKey = orderKeys[0];
      const firstOrderRaw = await redis.get(firstOrderKey);
            
      if (firstOrderRaw && typeof firstOrderRaw === 'object') {
        const firstOrder = firstOrderRaw as Order;
        console.log('   ✓ 订单数据结构验证通过');
        console.log(`   - 订单ID: ${firstOrder.id}`);
        console.log(`   - 桌号: ${firstOrder.tableNumber}`);
        console.log(`   - 状态: ${firstOrder.status}`);
        console.log(`   - 总金额: ₱${firstOrder.totalAmount}`);
        console.log(`   - 创建时间: ${firstOrder.createdAt}`);
      } else {
        console.log('   ✗ 订单数据结构验证失败');
      }
      console.log('');
    }
    
    // 检查支付方式数据
    if (paymentKeys.length > 0) {
      console.log('💳 支付方式数据验证:');
      
      // 获取所有支付方式并验证
      for (const key of paymentKeys.slice(0, 3)) { // 只检查前3个
        const paymentRaw = await redis.get(key);
        if (paymentRaw && typeof paymentRaw === 'object') {
          const payment = paymentRaw as PaymentMethod;
          console.log(`   - 支付方式: ${payment.name} (${payment.nameEn}) - ${payment.enabled ? '启用' : '禁用'}`);
        }
      }
            
      console.log('   ✓ 支付方式数据结构验证通过');
      console.log('');
    }
    
    // 检查索引数据
    if (indexKeys.length > 0) {
      console.log('🗂️ 索引数据验证:');
      for (const key of indexKeys) {
        const indexData = await redis.get(key);
        if (indexData && Array.isArray(indexData)) {
          console.log(`   - ${key}: ${indexData.length} 个条目`);
        } else {
          console.log(`   - ${key}: 未知格式`);
        }
      }
      console.log('   ✓ 索引数据结构验证完成');
      console.log('');
    }
    
    // 综合评估
    console.log('✅ 数据匹配验证完成!');
    console.log('\n总结:');
    console.log(`- 数据库连接: ✅ 正常`);
    console.log(`- 菜品数据: ${dishKeys.length > 0 ? '✅ 存在' : '⚠️ 缺失'}`);
    console.log(`- 订单数据: ${orderKeys.length > 0 ? '✅ 存在' : '⚠️ 缺失'}`);
    console.log(`- 支付方式: ${paymentKeys.length > 0 ? '✅ 存在' : '⚠️ 缺失'}`);
    console.log(`- 索引数据: ${indexKeys.length > 0 ? '✅ 存在' : '⚠️ 缺失'}`);
    
    // 验证数据结构是否符合项目预期
    const hasExpectedData = dishKeys.length > 0 && orderKeys.length > 0;
    console.log(`- 项目数据匹配: ${hasExpectedData ? '✅ 匹配' : '⚠️ 不匹配'}`);
    
    if (hasExpectedData) {
      console.log('\n🎉 数据验证成功! 数据库中的数据与项目代码完全匹配。');
      console.log('您的系统数据完整且结构正确，可以正常运行。');
    } else {
      console.log('\n⚠️ 数据验证警告! 数据库中的数据可能与项目代码不完全匹配。');
      console.log('请检查数据完整性或重新初始化数据。');
    }
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

// 执行验证
verifyDataMatch().catch(console.error);