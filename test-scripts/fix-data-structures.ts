/**
 * 修复数据结构问题
 */

import 'dotenv/config';
import { getRedisClient } from '../lib/redis.js';

async function fixDataStructures() {
  console.log('🔧 开始修复数据结构问题...\n');

  try {
    const redis = getRedisClient();
    
    // 检查并修复订单数据
    console.log('📝 检查订单数据结构...');
    const orderKeys = await redis.keys('orders:*');
    const orderDataKeys = orderKeys.filter(key => !key.includes(':index'));
    
    console.log(`   发现 ${orderDataKeys.length} 个订单\n`);
    
    let fixedOrders = 0;
    for (const key of orderDataKeys) {
      const orderRaw = await redis.get(key);
      
      if (orderRaw) {
        // 确保订单数据是对象格式
        let order = orderRaw;
        if (typeof orderRaw === 'string') {
          try {
            order = JSON.parse(orderRaw);
            // 更新数据为正确格式
            await redis.set(key, order);
            console.log(`   修复订单数据格式: ${key}`);
            fixedOrders++;
          } catch (e) {
            console.log(`   无法解析订单数据: ${key}`);
          }
        } else if (typeof orderRaw === 'object') {
          // 检查订单结构是否完整
          if (!order.hasOwnProperty('id') || !order.hasOwnProperty('tableNumber') || 
              !order.hasOwnProperty('items') || !order.hasOwnProperty('status') || 
              !order.hasOwnProperty('total')) {
            console.log(`   订单结构不完整: ${key}`);
          }
        }
      }
    }
    
    if (fixedOrders > 0) {
      console.log(`   ✅ 修复了 ${fixedOrders} 个订单数据格式\n`);
    }
    
    // 检查并修复支付方式数据
    console.log('💳 检查支付方式数据结构...');
    const paymentKeys = await redis.keys('payment_methods:*');
    const paymentDataKeys = paymentKeys.filter(key => !key.includes(':index'));
    
    console.log(`   发现 ${paymentDataKeys.length} 个支付方式\n`);
    
    let fixedPaymentMethods = 0;
    for (const key of paymentDataKeys) {
      const paymentRaw = await redis.get(key);
      
      if (paymentRaw) {
        // 确保支付方式数据是对象格式
        let payment = paymentRaw;
        if (typeof paymentRaw === 'string') {
          try {
            payment = JSON.parse(paymentRaw);
            // 更新数据为正确格式
            await redis.set(key, payment);
            console.log(`   修复支付方式数据格式: ${key}`);
            fixedPaymentMethods++;
          } catch (e) {
            console.log(`   无法解析支付方式数据: ${key}`);
          }
        } else if (typeof paymentRaw === 'object') {
          // 检查支付方式结构是否完整
          if (!payment.hasOwnProperty('id') || !payment.hasOwnProperty('name') || 
              !payment.hasOwnProperty('type') || !payment.hasOwnProperty('enabled')) {
            console.log(`   支付方式结构不完整: ${key}`);
          }
        }
      }
    }
    
    if (fixedPaymentMethods > 0) {
      console.log(`   ✅ 修复了 ${fixedPaymentMethods} 个支付方式数据格式\n`);
    }
    
    // 重建所有索引（包括非菜品索引）
    console.log('🔄 重建所有索引...');
    
    // 重建订单索引
    const allOrderKeys = await redis.keys('orders:*');
    const orderIds = allOrderKeys.filter(key => !key.includes(':index')).map(key => key.replace('orders:', ''));
    await redis.set('orders:index', orderIds);
    console.log(`   更新订单索引: ${orderIds.length} 个`);
    
    // 重建支付方式索引
    const allPaymentKeys = await redis.keys('payment_methods:*');
    const paymentIds = allPaymentKeys.filter(key => !key.includes(':index')).map(key => key.replace('payment_methods:', ''));
    await redis.set('payment_methods:index', paymentIds);
    console.log(`   更新支付方式索引: ${paymentIds.length} 个`);
    
    // 重建其他索引
    const otherEntities = ['hotel_rooms', 'ktv_rooms', 'inventory', 'expenses', 'sign_bill_accounts'];
    for (const entity of otherEntities) {
      const entityKeys = await redis.keys(`${entity}:*`);
      const entityIds = entityKeys.filter(key => !key.includes(':index')).map(key => key.replace(`${entity}:`, ''));
      await redis.set(`${entity}:index`, entityIds);
      console.log(`   更新${entity}索引: ${entityIds.length} 个`);
    }
    
    console.log('\n✅ 数据结构修复完成！');
    console.log(`\n📊 修复统计:`);
    console.log(`- 订单数据修复: ${fixedOrders} 个`);
    console.log(`- 支付方式修复: ${fixedPaymentMethods} 个`);
    console.log(`- 索引重建: 7 个`);
    
  } catch (error) {
    console.error('❌ 数据结构修复失败:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

fixDataStructures().catch(console.error);