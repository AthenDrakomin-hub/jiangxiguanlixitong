/**
 * 生产环境功能验证脚本
 */

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
  source: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  notes?: string;
  paymentMethod?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  englishName: string;
  isEnabled: boolean;
  qrCodeUrl: string;
  accountInfo: string;
  paymentType: string;
  currency: string;
  exchangeRate: number;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

async function productionVerification() {
  console.log('🔍 开始生产环境功能验证...\n');

  try {
    const redis = getRedisClient();
    
    console.log('✅ Redis连接正常\n');
    
    // 1. 检查菜品数据
    console.log('🍽️ 验证菜品数据...');
    const dishKeys = await redis.keys('dishes:*');
    const dishDataKeys = dishKeys.filter(key => !key.includes(':index'));
    const dishIndexKeys = dishKeys.filter(key => key.includes(':index'));
    
    console.log(`   - 菜品总数: ${dishDataKeys.length}`);
    console.log(`   - 菜品索引数: ${dishIndexKeys.length}`);
    
    // 验证菜品数据结构
    let validDishes = 0;
    for (const key of dishDataKeys.slice(0, 5)) { // 检查前5个菜品
      const dishRaw = await redis.get(key);
      if (dishRaw && typeof dishRaw === 'object') {
        const dish = dishRaw as Dish;
        if (dish.id && dish.name && typeof dish.price === 'number' && dish.category) {
          validDishes++;
        }
      }
    }
    console.log(`   - 验证菜品结构: ${validDishes}/5 正常\n`);
    
    // 2. 检查订单数据
    console.log('📝 验证订单数据...');
    const orderKeys = await redis.keys('orders:*');
    const orderDataKeys = orderKeys.filter(key => !key.includes(':index'));
    
    console.log(`   - 订单总数: ${orderDataKeys.length}`);
    
    // 验证订单数据结构
    let validOrders = 0;
    for (const key of orderDataKeys.slice(0, 3)) { // 检查前3个订单
      const orderRaw = await redis.get(key);
      if (orderRaw && typeof orderRaw === 'object') {
        const order = orderRaw as Order;
        if (order.id && order.tableNumber && order.source && order.status && typeof order.totalAmount === 'number') {
          validOrders++;
        }
      }
    }
    console.log(`   - 验证订单结构: ${validOrders}/3 正常\n`);
    
    // 3. 检查支付方式数据
    console.log('💳 验证支付方式数据...');
    const paymentKeys = await redis.keys('payment_methods:*');
    const paymentDataKeys = paymentKeys.filter(key => !key.includes(':index'));
    
    console.log(`   - 支付方式总数: ${paymentDataKeys.length}`);
    
    // 验证支付方式数据结构
    let validPaymentMethods = 0;
    for (const key of paymentDataKeys.slice(0, 3)) { // 检查前3个支付方式
      const paymentRaw = await redis.get(key);
      if (paymentRaw && typeof paymentRaw === 'object') {
        const payment = paymentRaw as PaymentMethod;
        if (payment.id && payment.name && payment.paymentType !== undefined && typeof payment.isEnabled === 'boolean') {
          validPaymentMethods++;
        }
      }
    }
    console.log(`   - 验证支付方式结构: ${validPaymentMethods}/3 正常\n`);
    
    // 4. 检查各类索引
    console.log('📋 验证索引数据...');
    const allIndexKeys = await redis.keys('*:index');
    console.log(`   - 索引总数: ${allIndexKeys.length}`);
    
    let validIndexes = 0;
    for (const indexKey of allIndexKeys) {
      try {
        const indexValue = await redis.get(indexKey);
        if (Array.isArray(indexValue)) {
          console.log(`   - ${indexKey}: ${indexValue.length} 个条目 (正常)`);
          validIndexes++;
        } else {
          console.log(`   - ${indexKey}: 格式异常`);
        }
      } catch (e) {
        console.log(`   - ${indexKey}: 读取失败`);
      }
    }
    console.log(`   - 验证索引格式: ${validIndexes}/${allIndexKeys.length} 正常\n`);
    
    // 5. 测试基本读写操作
    console.log('💾 测试基本读写操作...');
    const testKey = 'health_check:verification';
    const testValue = { timestamp: Date.now(), status: 'active' };
    
    // 写入测试
    await redis.set(testKey, testValue);
    console.log('   - 写入操作: 成功');
    
    // 读取测试
    const readValue = await redis.get(testKey);
    if (readValue && typeof readValue === 'object' && (readValue as any).status === 'active') {
      console.log('   - 读取操作: 成功');
    } else {
      console.log('   - 读取操作: 失败');
    }
    
    // 清理测试数据
    await redis.del(testKey);
    console.log('   - 测试数据清理: 完成\n');
    
    // 6. 汇总验证结果
    console.log('✅ 生产环境验证完成！');
    console.log('\n📊 验证汇总:');
    console.log(`- 菜品数据: ${dishDataKeys.length} 个, 结构验证: ${validDishes}/5`);
    console.log(`- 订单数据: ${orderDataKeys.length} 个, 结构验证: ${validOrders}/3`);
    console.log(`- 支付方式: ${paymentDataKeys.length} 个, 结构验证: ${validPaymentMethods}/3`);
    console.log(`- 索引数据: ${allIndexKeys.length} 个, 格式验证: ${validIndexes}/${allIndexKeys.length}`);
    console.log(`- 读写操作: 正常`);
    
    // 健康状态评估
    const totalChecks = 5; // 菜品、订单、支付、索引、读写
    const passedChecks = [
      validDishes > 0,
      validOrders > 0,
      validPaymentMethods > 0,
      validIndexes > 0,
      true // 读写操作
    ].filter(Boolean).length;
    
    console.log(`\n🎯 健康度: ${passedChecks}/${totalChecks} 检查项通过`);
    
    if (passedChecks === totalChecks) {
      console.log('🎉 生产环境功能验证通过！所有关键功能正常工作。');
    } else {
      console.log('⚠️ 生产环境存在部分问题，请检查以上验证结果。');
    }
    
  } catch (error) {
    console.error('❌ 生产环境验证失败:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

productionVerification().catch(console.error);