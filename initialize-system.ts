/**
 * 系统初始化脚本
 * 用于初始化酒店管理系统的基础数据
 */

import { dbManager } from './lib/database.js';
import { DatabaseConfig } from './types.js';

async function initializeSystem() {
  console.log('开始初始化酒店管理系统...');

  // 初始化数据库配置
  const dbType = process.env.DB_TYPE || 'memory';
  const config: DatabaseConfig = {
    type: dbType as any,
    settings: dbType === 'neon' ? { 
      connectionString: process.env.NEON_CONNECTION_STRING || '' 
    } : null
  };

  try {
    await dbManager.initialize(config);
    console.log(`数据库初始化成功，类型: ${dbType}`);

    const db = dbManager.getDatabase();

    // 检查是否已有数据
    const existingUsers = await db.getAll('users');
    if (existingUsers.length > 0) {
      console.log('检测到已有数据，跳过初始化');
      return;
    }

    // 创建默认管理员用户
    const adminUser = {
      username: 'admin',
      password: 'admin123', // 在生产环境中应该使用更安全的密码
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.create('users', adminUser);
    console.log('管理员用户创建成功');

    // 初始化默认房间
    const hotelRooms = [];
    for (let floor = 82; floor <= 83; floor++) {
      for (let room = 1; room <= 32; room++) {
        const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
        hotelRooms.push({
          roomNumber,
          roomType: room <= 16 ? '标准间' : '豪华间',
          status: 'available',
          rate: room <= 16 ? 500 : 800,
          floor: floor === 82 ? 2 : 3,
          bedType: '双床',
          amenities: ['空调', '电视', 'WiFi', '热水'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 添加KTV房间
    hotelRooms.push({
      roomNumber: 'KTV01',
      roomType: 'KTV包厢',
      status: 'available',
      rate: 1200,
      floor: 1,
      bedType: '无',
      amenities: ['音响', '点歌系统', '沙发', '空调'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 批量创建房间
    for (const room of hotelRooms) {
      await db.create('hotel_rooms', room);
    }
    console.log(`酒店房间初始化完成，共创建 ${hotelRooms.length} 个房间`);

    // 初始化默认支付方式
    const paymentMethods = [
      { name: '现金', code: 'CASH', active: true },
      { name: '支付宝', code: 'ALIPAY', active: true },
      { name: '微信支付', code: 'WECHAT', active: true },
      { name: '信用卡', code: 'CREDIT_CARD', active: true },
      { name: '银行转账', code: 'BANK_TRANSFER', active: true },
    ];

    for (const method of paymentMethods) {
      await db.create('payment_methods', method);
    }
    console.log(`支付方式初始化完成，共创建 ${paymentMethods.length} 种支付方式`);

    // 初始化默认菜品分类
    const categories = ['主食', '汤类', '饮料', '甜品', '特色菜'];
    for (const category of categories) {
      await db.create('dishes', {
        name: `示例菜品-${category}`,
        category,
        price: 50,
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: `这是${category}类别的示例菜品`
      });
    }
    console.log(`菜品分类初始化完成，共创建 ${categories.length} 个分类的示例菜品`);

    console.log('系统初始化完成！');
  } catch (error) {
    console.error('系统初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeSystem().catch(console.error);
}

export { initializeSystem };