/**
 * 数据初始化脚本
 * 用于初始化酒店管理系统的基础数据
 */

import { kvClient } from './lib/kv-client.ts';
import { createDatabaseConfigFromEnv } from './src/config.ts';

async function initializeData() {
  console.log('开始初始化数据...');
  
  try {
    // 初始化数据库连接
    const dbConfig = createDatabaseConfigFromEnv();
    await kvClient.initialize(dbConfig);
    
    console.log('数据库连接初始化成功');
    
    // 检查数据库连接状态
    if (!kvClient.isConnected()) {
      throw new Error('数据库连接不可用');
    }
    
    console.log('数据库连接状态正常');
    
    // 初始化64间酒店房间 (8201-8232 和 8301-8332)
    const hotelRooms = [];
    
    // 8楼2区: 8201-8232
    for (let i = 1; i <= 32; i++) {
      const roomNumber = `82${String(i).padStart(2, '0')}`;
      hotelRooms.push({
        id: `room-${roomNumber}`,
        number: roomNumber,
        floor: 82,
        status: 'Vacant',
        orders: [],
      });
    }

    // 8楼3区: 8301-8332
    for (let i = 1; i <= 32; i++) {
      const roomNumber = `83${String(i).padStart(2, '0')}`;
      hotelRooms.push({
        id: `room-${roomNumber}`,
        number: roomNumber,
        floor: 83,
        status: 'Vacant',
        orders: [],
      });
    }

    // 初始化KTV房间
    const ktvRooms = [
      {
        id: 'ktv-vip-001',
        name: 'VIP包厢',
        type: 'VIP',
        status: 'Available',
        hourlyRate: 200,
      },
    ];

    // 初始化系统设置
    const systemSettings = {
      id: 'system-settings-default',
      storeInfo: {
        name: '江西酒店 Jiangxi Hotel',
        address: 'Pasay City, Manila, Philippines',
        phone: '+63-XXX-XXXX',
        wifiSSID: 'JiangxiHotel-Guest',
        wifiPassword: 'welcome2024',
      },
      exchangeRate: 8.2,
      serviceChargeRate: 0.1,
      categories: ['热菜', '凉菜', '汤类', '主食', '酒水', '小吃'],
      payment: {
        enabledMethods: ['CASH', 'GCASH', 'MAYA', 'WECHAT', 'ALIPAY'],
        aliPayEnabled: true,
        weChatEnabled: true,
        gCashEnabled: true,
        mayaEnabled: true,
      },
      h5PageSettings: {
        enableCustomStyling: true,
        customHeaderColor: '#4F46E5',
        customButtonColor: '#DC2626',
        showStoreInfo: true,
        showWiFiInfo: true,
      },
      lobbyEnabled: true,
      lobbyTableName: 'LOBBY',
    };

    // 批量创建数据
    const pipeline = [];
    
    // 创建酒店房间
    for (const room of hotelRooms) {
      pipeline.push(kvClient.create('hotel_rooms', room));
    }
    
    // 创建KTV房间
    for (const ktv of ktvRooms) {
      pipeline.push(kvClient.create('ktv_rooms', ktv));
    }
    
    // 创建系统设置
    pipeline.push(kvClient.create('system_settings', systemSettings));

    // 执行所有创建操作
    await Promise.all(pipeline);

    console.log('数据初始化完成！');
    console.log('已创建:');
    console.log(`- ${hotelRooms.length} 个酒店房间`);
    console.log(`- ${ktvRooms.length} 个KTV房间`);
    console.log('- 1 个系统设置');
    
  } catch (error) {
    console.error('数据初始化失败:', error);
    throw error;
  }
}

// 运行初始化
initializeData()
  .then(() => {
    console.log('数据初始化脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('数据初始化脚本执行失败:', error);
    process.exit(1);
  });