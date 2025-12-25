// scripts/test-neon-connection.ts
import { dbManager } from '../lib/database.js';

async function testNeonConnection() {
  console.log('🔍 测试Neon数据库连接...');
  
  try {
    // 使用Neon数据库配置
    const config = {
      type: 'neon' as const,
      connectionString: process.env.NEON_CONNECTION_STRING
    };
    
    if (!config.connectionString) {
      throw new Error('NEON_CONNECTION_STRING 环境变量未设置');
    }
    
    // 初始化数据库
    await dbManager.initialize(config);
    
    console.log('✅ Neon数据库连接成功');
    
    const db = dbManager.getDatabase();
    
    // 测试基本操作
    const testKey = `test:${Date.now()}`;
    const testData = { 
      message: 'Connection test successful', 
      timestamp: new Date().toISOString() 
    };
    
    // 写入测试数据
    await db.set(testKey, testData);
    console.log('✅ 数据写入测试成功');
    
    // 读取测试数据
    const result = await db.get(testKey);
    if (result && result.message === 'Connection test successful') {
      console.log('✅ 数据读取测试成功');
    } else {
      throw new Error('数据读取验证失败');
    }
    
    // 删除测试数据
    await db.delete(testKey);
    console.log('✅ 数据删除测试成功');
    
    console.log('🎉 Neon数据库连接测试全部通过！');
    
    // 测试数据表创建
    console.log('🔍 测试数据表初始化...');
    
    // 测试创建一个酒店房间
    const testRoom = await db.create('hotel_rooms', {
      roomNumber: 'TEST001',
      roomType: '测试房间',
      status: 'available',
      rate: 100,
      amenities: ['测试'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ 房间数据表测试成功:', testRoom.id);
    
    // 删除测试房间
    await db.remove('hotel_rooms', testRoom.id);
    console.log('✅ 测试数据清理完成');
    
    console.log('🎉 所有数据库功能测试通过！');
    
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
    throw error;
  }
}

// 运行测试
testNeonConnection().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});