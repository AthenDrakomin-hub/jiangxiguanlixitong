/**
 * 数据库初始化脚本
 * 通过调用API端点来初始化数据库
 */

async function initializeDatabase() {
  console.log('开始初始化数据库...');
  
  try {
    // 由于我们无法直接启动服务器，我们创建一个简单的HTTP请求模拟
    // 这里我们直接使用数据库API来初始化数据
    
    // 动态导入模块
    const { dbManager } = await import('./lib/database.ts');
    const { createDatabaseConfigFromEnv } = await import('./src/config.ts');
    
    // 创建数据库配置
    const dbConfig = createDatabaseConfigFromEnv();
    
    // 初始化数据库
    await dbManager.initialize(dbConfig);
    const database = dbManager.getDatabase();
    
    console.log('数据库连接已建立');
    
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
      pipeline.push(database.create('hotel_rooms', room));
    }
    
    // 创建KTV房间
    for (const ktv of ktvRooms) {
      pipeline.push(database.create('ktv_rooms', ktv));
    }
    
    // 创建系统设置
    pipeline.push(database.create('system_settings', systemSettings));

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
initializeDatabase()
  .then(() => {
    console.log('数据库初始化脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('数据库初始化脚本执行失败:', error);
    process.exit(1);
  });