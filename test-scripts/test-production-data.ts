// test-production-data.ts
// 测试生产环境数据获取功能

import { apiClient } from './services/apiClient';

// 重写API_BASE_URL以使用生产环境URL
(Object(apiClient) as any).API_BASE_URL = 'https://www.jiangxijiudian.store/api';

async function testProductionData() {
  console.log('开始测试生产环境数据获取...');

  try {
    // 测试连接状态
    console.log('1. 测试连接状态...');
    const response = await fetch('https://www.jiangxijiudian.store/api/test-connection');
    const connectionStatus = await response.json();
    console.log('连接状态:', connectionStatus);

    // 测试获取菜品数据
    console.log('2. 测试获取菜品数据...');
    const dishes = await fetch('https://www.jiangxijiudian.store/api/dishes');
    console.log('菜品数据获取状态:', dishes.status);

    if (dishes.status === 200) {
      const dishesData = await dishes.json();
      console.log('菜品数据:', dishesData);
    } else {
      console.log('菜品数据获取失败，状态码:', dishes.status);
    }

    // 测试获取订单数据
    console.log('3. 测试获取订单数据...');
    const orders = await fetch('https://www.jiangxijiudian.store/api/orders');
    console.log('订单数据获取状态:', orders.status);

    if (orders.status === 200) {
      const ordersData = await orders.json();
      console.log('订单数据:', ordersData);
    } else {
      console.log('订单数据获取失败，状态码:', orders.status);
    }

    console.log('✅ 生产环境测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testProductionData();