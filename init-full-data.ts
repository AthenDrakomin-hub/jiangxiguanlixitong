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
const ktvRooms: Array<{name: string, type: string, status: string, hourlyRate: number}> = [
  {
    name: 'VIP包厢',
    type: 'VIP',
    status: 'available',
    hourlyRate: 200,
  },
];

// 菜品数据
const dishes: Array<{name: string, category: string, price: number, description: string, imageUrl: string}> = [
  {
    name: '宫保鸡丁',
    category: '热菜',
    price: 120,
    description: '经典川菜，酸甜可口',
    imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==', // 示例Base64图片
  },
  {
    name: '麻婆豆腐',
    category: '热菜',
    price: 80,
    description: '嫩滑豆腐配麻辣肉末',
    imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==',
  },
  {
    name: '酸辣汤',
    category: '汤类',
    price: 45,
    description: '开胃酸辣汤',
    imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==',
  },
  {
    name: '白米饭',
    category: '主食',
    price: 15,
    description: '香喷喷的白米饭',
    imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==',
  },
];

// 库存数据
const inventory: Array<{name: string, quantity: number, unit: string, minStock: number, category: string}> = [
  {
    name: '大米',
    quantity: 100,
    unit: '公斤',
    minStock: 10,
    category: '主食',
  },
  {
    name: '鸡肉',
    quantity: 50,
    unit: '公斤',
    minStock: 5,
    category: '肉类',
  },
  {
    name: '豆腐',
    quantity: 30,
    unit: '公斤',
    minStock: 5,
    category: '豆制品',
  },
  {
    name: '辣椒',
    quantity: 20,
    unit: '公斤',
    minStock: 2,
    category: '调料',
  },
];

// 支出数据
const expenses: Array<{amount: number, category: string, description: string, date: string}> = [
  {
    amount: 5000,
    category: '采购',
    description: '本周食材采购',
    date: new Date().toISOString(),
  },
  {
    amount: 1200,
    category: '水电费',
    description: '本月水电费',
    date: new Date().toISOString(),
  },
];

// 支付方式数据
const paymentMethods: Array<{name: string, type: string, enabled: boolean}> = [
  {
    name: '现金',
    type: 'CASH',
    enabled: true,
  },
  {
    name: 'GCash',
    type: 'GCASH',
    enabled: true,
  },
  {
    name: '支付宝',
    type: 'ALIPAY',
    enabled: true,
  },
  {
    name: '微信支付',
    type: 'WECHAT',
    enabled: true,
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

async function initializeFullData() {
  try {
    // 初始化数据库
    await dbManager.initialize(config);
    const db = dbManager.getDatabase();

    console.log('开始初始化完整数据...');

    // 批量创建酒店房间
    const hotelRoomPromises = hotelRooms.map(room => 
      db.create('hotel_rooms', room)
    );
    
    // 批量创建KTV房间
    const ktvRoomPromises = ktvRooms.map(ktv => 
      db.create('ktv_rooms', ktv)
    );
    
    // 批量创建菜品
    const dishPromises = dishes.map(dish => 
      db.create('dishes', dish)
    );
    
    // 批量创建库存
    const inventoryPromises = inventory.map(item => 
      db.create('inventory', item)
    );
    
    // 批量创建支出
    const expensePromises = expenses.map(expense => 
      db.create('expenses', expense)
    );
    
    // 批量创建支付方式
    const paymentMethodPromises = paymentMethods.map(method => 
      db.create('payment_methods', method)
    );
    
    // 创建系统设置
    const systemSettingsPromise = db.create('system_settings', systemSettings);

    // 执行所有创建操作
    await Promise.all([
      ...hotelRoomPromises,
      ...ktvRoomPromises,
      ...dishPromises,
      ...inventoryPromises,
      ...expensePromises,
      ...paymentMethodPromises,
      systemSettingsPromise
    ]);

    console.log('完整数据初始化完成！');
    console.log(`- 酒店房间: ${hotelRooms.length} 间`);
    console.log(`- KTV房间: ${ktvRooms.length} 间`);
    console.log(`- 菜品: ${dishes.length} 种`);
    console.log(`- 库存: ${inventory.length} 项`);
    console.log(`- 支出记录: ${expenses.length} 条`);
    console.log(`- 支付方式: ${paymentMethods.length} 种`);
    console.log('- 系统设置: 1 项');

  } catch (error) {
    console.error('数据初始化失败:', error);
  }
}

// 运行初始化
initializeFullData();