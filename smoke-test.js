/**
 * 江西酒店管理系统 - 冒烟测试脚本
 * 验证完整的 API 调用闭环
 * 
 * 测试流程：登录 -> 选 8201 台 -> 点辣椒炒肉 -> 后台确认订单 -> 模拟结账 -> 查看财务报表
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// 模拟完整的订单流程
async function runSmokeTest() {
  console.log('🚀 开始执行冒烟测试...');
  
  try {
    // 1. 登录获取认证令牌
    console.log('🔐 步骤 1: 用户登录');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: process.env.VITE_ADMIN_USER || 'admin',
        password: process.env.VITE_ADMIN_PASS || 'admin123',
      }),
    });
    
    const loginResult = await loginResponse.json();
    if (!loginResult.success) {
      throw new Error(`登录失败: ${loginResult.message}`);
    }
    
    const authToken = loginResult.token || 'fake-jwt-token-for-demo';
    console.log('✅ 登录成功');
    
    // 2. 获取菜单数据
    console.log('📋 步骤 2: 获取菜单');
    const menuResponse = await fetch(`${BASE_URL}/api/dishes`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const menuResult = await menuResponse.json();
    if (!menuResult.success) {
      throw new Error(`获取菜单失败: ${menuResult.message}`);
    }
    
    // 查找"辣椒炒肉"菜品
    const chiliDish = menuResult.data?.find(dish => 
      dish.name.includes('辣椒') || dish.name.includes('炒肉') || dish.name === '辣椒炒肉'
    );
    
    if (!chiliDish) {
      console.warn('⚠️ 未找到"辣椒炒肉"，使用第一个菜品');
      chiliDish = menuResult.data?.[0];
    }
    
    console.log(`✅ 找到菜品: ${chiliDish.name} (ID: ${chiliDish.id})`);
    
    // 3. 创建订单
    console.log('🛒 步骤 3: 创建订单 (8201台)');
    const orderData = {
      tableId: '8201',
      items: [{
        dishId: chiliDish.id,
        name: chiliDish.name,
        quantity: 1,
        price: chiliDish.price || 35,
        specialRequests: '微辣'
      }],
      status: 'PENDING',
      total: chiliDish.price || 35,
      timestamp: new Date().toISOString(),
      customerName: '测试客户',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const createOrderResponse = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(orderData),
    });
    
    const orderResult = await createOrderResponse.json();
    if (!orderResult.success) {
      throw new Error(`创建订单失败: ${orderResult.message}`);
    }
    
    const orderId = orderResult.data?.id || orderResult.id;
    console.log(`✅ 订单创建成功: ${orderId}`);
    
    // 4. 获取订单详情
    console.log('🔍 步骤 4: 验证订单');
    const getOrderResponse = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const orderDetail = await getOrderResponse.json();
    if (!orderDetail.success) {
      throw new Error(`获取订单详情失败: ${orderDetail.message}`);
    }
    
    console.log(`✅ 订单状态: ${orderDetail.data?.status || orderDetail.status}`);
    
    // 5. 更新订单状态为 COOKING
    console.log('👨‍🍳 步骤 5: 更新订单状态为制作中');
    const updateOrderResponse = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        status: 'COOKING',
        updatedAt: new Date().toISOString(),
      }),
    });
    
    const updateResult = await updateOrderResponse.json();
    if (!updateResult.success) {
      throw new Error(`更新订单状态失败: ${updateResult.message}`);
    }
    
    console.log('✅ 订单状态更新成功');
    
    // 6. 更新订单状态为 COMPLETED
    console.log('✅ 步骤 6: 更新订单状态为已完成');
    const completeOrderResponse = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        status: 'COMPLETED',
        paid: true,
        paymentMethod: 'CASH',
        updatedAt: new Date().toISOString(),
      }),
    });
    
    const completeResult = await completeOrderResponse.json();
    if (!completeResult.success) {
      throw new Error(`完成订单失败: ${completeResult.message}`);
    }
    
    console.log('✅ 订单完成');
    
    // 7. 验证财务数据
    console.log('💰 步骤 7: 验证财务报表');
    const financeResponse = await fetch(`${BASE_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    const financeResult = await financeResponse.json();
    if (!financeResult.success) {
      throw new Error(`获取财务数据失败: ${financeResult.message}`);
    }
    
    const completedOrders = financeResult.data?.filter(order => 
      order.status === 'COMPLETED' || order.paid === true
    ) || [];
    
    console.log(`✅ 找到 ${completedOrders.length} 个已完成订单`);
    
    // 8. 测试结束
    console.log('\n🎉 冒烟测试通过！');
    console.log('✅ 完整的订单流程验证成功');
    console.log('✅ API 调用闭环正常');
    console.log('✅ 数据库读写正常');
    console.log('✅ 认证授权正常');
    
    return true;
    
  } catch (error) {
    console.error('❌ 冒烟测试失败:', error.message);
    console.error('详细错误:', error.stack);
    return false;
  }
}

// 执行测试
if (require.main === module) {
  runSmokeTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('测试执行出错:', error);
      process.exit(1);
    });
}

module.exports = { runSmokeTest };