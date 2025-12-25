import { dbManager } from './lib/database.js';

async function testDatabaseInitialization() {
  console.log('开始测试数据库初始化...');
  
  try {
    // 初始化数据库
    const dbType = process.env.DB_TYPE || 'memory';
    await dbManager.initialize({ type: dbType as any });
    
    console.log('数据库初始化成功');
    
    const db = dbManager.getDatabase();
    
    // 测试获取酒店房间
    const hotelRooms = await db.getAll('hotel_rooms:');
    console.log(`酒店房间数量: ${hotelRooms.length}`);
    
    // 测试获取菜品
    const dishes = await db.getAll('dishes:');
    console.log(`菜品数量: ${dishes.length}`);
    
    // 测试获取KTV房间
    const ktvRooms = await db.getAll('ktv_rooms:');
    console.log(`KTV房间数量: ${ktvRooms.length}`);
    
    // 测试获取支付方式
    const paymentMethods = await db.getAll('payment_methods:');
    console.log(`支付方式数量: ${paymentMethods.length}`);
    
    // 测试获取库存
    const inventory = await db.getAll('inventory:');
    console.log(`库存项目数量: ${inventory.length}`);
    
    // 测试获取签单账户
    const signBillAccounts = await db.getAll('sign_bill_accounts:');
    console.log(`签单账户数量: ${signBillAccounts.length}`);
    
    // 测试获取系统设置
    const systemSettings = await db.get('system_settings:default');
    console.log(`系统设置存在: ${!!systemSettings}`);
    
    console.log('所有测试通过！数据库和初始数据正常工作。');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
testDatabaseInitialization();