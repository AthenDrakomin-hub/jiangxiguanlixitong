/**
 * 检查数据实际结构
 */

import 'dotenv/config';
import { getRedisClient } from './lib/redis';

async function checkDataStructure() {
  console.log('🔍 检查数据实际结构...\n');

  try {
    const redis = getRedisClient();
    
    // 检查一个订单的实际结构
    const orderKeys = await redis.keys('orders:*');
    const orderDataKeys = orderKeys.filter(key => !key.includes(':index'));
    
    if (orderDataKeys.length > 0) {
      console.log('📝 检查订单结构...');
      const firstOrderKey = orderDataKeys[0];
      const orderData = await redis.get(firstOrderKey);
      
      console.log(`   订单键: ${firstOrderKey}`);
      console.log(`   订单数据类型: ${typeof orderData}`);
      console.log(`   订单数据:`, orderData);
      console.log(`   订单属性:`, Object.keys(orderData || {}));
      console.log('');
    }
    
    // 检查一个支付方式的实际结构
    const paymentKeys = await redis.keys('payment_methods:*');
    const paymentDataKeys = paymentKeys.filter(key => !key.includes(':index'));
    
    if (paymentDataKeys.length > 0) {
      console.log('💳 检查支付方式结构...');
      const firstPaymentKey = paymentDataKeys[0];
      const paymentData = await redis.get(firstPaymentKey);
      
      console.log(`   支付方式键: ${firstPaymentKey}`);
      console.log(`   支付方式数据类型: ${typeof paymentData}`);
      console.log(`   支付方式数据:`, paymentData);
      console.log(`   支付方式属性:`, Object.keys(paymentData || {}));
      console.log('');
    }
    
    // 检查一个菜品的实际结构
    const dishKeys = await redis.keys('dishes:*');
    const dishDataKeys = dishKeys.filter(key => !key.includes(':index'));
    
    if (dishDataKeys.length > 0) {
      console.log('🍽️ 检查菜品结构...');
      const firstDishKey = dishDataKeys[0];
      const dishData = await redis.get(firstDishKey);
      
      console.log(`   菜品键: ${firstDishKey}`);
      console.log(`   菜品数据类型: ${typeof dishData}`);
      console.log(`   菜品数据:`, dishData);
      console.log(`   菜品属性:`, Object.keys(dishData || {}));
      console.log('');
    }
    
    console.log('✅ 数据结构检查完成！');
    
  } catch (error) {
    console.error('❌ 数据结构检查失败:', error instanceof Error ? error.message : String(error));
  }
}

checkDataStructure().catch(console.error);