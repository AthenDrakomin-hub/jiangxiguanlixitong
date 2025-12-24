import { DatabaseConfig } from './types';
import { dbManager } from './lib/database';

// 数据库配置
const config: DatabaseConfig = {
  type: 'memory', // 使用内存数据库进行初始化
};

// 酒店房间数据
const hotelRooms: Array<{roomNumber: string, floor: number, status: string, orders: any[]}> = [];

// 8楼2区: 8201-8232
for (let i = 1; i <= 32; i++) {
  const roomNumber = `82${String(i).padStart(2, '0')}`;
  hotelRooms.push({
    roomNumber: roomNumber,
    floor: 82,
    status: 'available',
    orders: [],
  });
}

// 8楼3区: 8301-8332
for (let i = 1; i <= 32; i++) {
  const roomNumber = `83${String(i).padStart(2, '0')}`;
  hotelRooms.push({
    roomNumber: roomNumber,
    floor: 83,
    status: 'available',
    orders: [],
  });
}

// KTV房间数据
const ktvRooms = [
  {
    name: 'VIP包厢',
    type: 'VIP',
    status: 'available',
    hourlyRate: 200,
  },
];

// 系统设置数据
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

async function initializeData() {
  try {
    // 初始化数据库
    await dbManager.initialize(config);
    const db = dbManager.getDatabase();

    console.log('开始初始化数据...');

    // 批量创建酒店房间
    const hotelRoomPromises = hotelRooms.map(room => 
      db.create('hotel_rooms', room)
    );
    
    // 批量创建KTV房间
    const ktvRoomPromises = ktvRooms.map(ktv => 
      db.create('ktv_rooms', ktv)
    );
    
    // 创建系统设置
    const systemSettingsPromise = db.create('system_settings', systemSettings);

    // 执行所有创建操作
    await Promise.all([
      ...hotelRoomPromises,
      ...ktvRoomPromises,
      systemSettingsPromise
    ]);

    console.log('数据初始化完成！');
    console.log(`- 酒店房间: ${hotelRooms.length} 间`);
    console.log(`- KTV房间: ${ktvRooms.length} 间`);
    console.log('- 系统设置: 1 项');

  } catch (error) {
    console.error('数据初始化失败:', error);
  }
}

// 运行初始化
initializeData();