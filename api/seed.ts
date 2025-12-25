import { dbManager } from '../lib/database.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const method = req.method;
  
  // CORS 头设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: '仅支持 POST 请求',
      }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  // 添加权限校验
  const authHeader = req.headers.get('Authorization');
  const adminKey = process.env.ADMIN_KEY || process.env.VITE_ADMIN_KEY;
  
  // 验证Bearer认证头
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({
        success: false,
        message: '认证失败：缺少 Bearer Token',
      }),
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }
  
  const providedKey = authHeader.substring(7); // 移除 "Bearer " 前缀
  
  if (!adminKey || providedKey !== adminKey) {
    return new Response(
      JSON.stringify({
        success: false,
        message: '认证失败：密钥不匹配',
      }),
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }

  try {
    // 检查数据库连接状态
    if (!dbManager.isInitialized()) {
      // 尝试初始化数据库
      const dbType = process.env.DB_TYPE || 'memory';
      await dbManager.initialize({ type: dbType as any });
    }

    if (!dbManager.isInitialized()) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '数据库连接不可用',
        }),
        {
          status: 503,
          headers: corsHeaders,
        }
      );
    }

    // 获取数据库实例
    const db = dbManager.getDatabase();

    // 初始化64间酒店房间
    const hotelRooms = [];
    
    // 8楼2区: 8201-8232
    for (let i = 1; i <= 32; i++) {
      const roomNumber = `82${String(i).padStart(2, '0')}`;
      hotelRooms.push({
        roomNumber: roomNumber,
        roomType: i <= 16 ? '标准间' : '豪华间',
        status: 'available',
        rate: i <= 16 ? 500 : 800,
        floor: i <= 16 ? 2 : 3,
        bedType: '双床',
        amenities: ['空调', '电视', 'WiFi', '热水'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 8楼3区: 8301-8332
    for (let i = 1; i <= 32; i++) {
      const roomNumber = `83${String(i).padStart(2, '0')}`;
      hotelRooms.push({
        roomNumber: roomNumber,
        roomType: i <= 16 ? '标准间' : '豪华间',
        status: 'available',
        rate: i <= 16 ? 500 : 800,
        floor: i <= 16 ? 2 : 3,
        bedType: '双床',
        amenities: ['空调', '电视', 'WiFi', '热水'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 初始化KTV房间
    const ktvRooms = [
      {
        name: 'KTV01',
        status: 'available',
        currentSession: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 初始化系统设置
    const systemSettings = {
      storeInfo: {
        name: '江西酒店 (Jinjiang Star Hotel)',
        address: '5 Corner Lourdes Street and Roxas Boulevard, Pasay City',
        phone: '+639084156449',
        openingHours: '10:00 - 02:00',
        kitchenPrinterUrl: '',
        wifiSsid: 'ChangeMe_WIFI_SSID',
        wifiPassword: '',
        telegram: '@jx555999',
        h5PageTitle: '江西酒店 - 在线点餐',
        h5PageDescription: '江西酒店在线点餐系统，为您提供便捷的客房送餐和大厅点餐服务',
        h5PageKeywords: '江西酒店,在线点餐,客房送餐,餐厅服务',
      },
      notifications: {
        sound: true,
        desktop: true,
      },
      payment: {
        enabledMethods: ['CASH'],
        aliPayEnabled: false,
        weChatEnabled: false,
        gCashEnabled: true,
        mayaEnabled: true,
      },
      exchangeRate: 8.2,
      serviceChargeRate: 0.1,
      categories: ['热菜', '凉菜', '汤类', '主食', '酒水', '小吃'],
      h5PageSettings: {
        enableCustomStyling: true,
        customHeaderColor: '#4F46E5',
        customButtonColor: '#DC2626',
        showStoreInfo: true,
        showWiFiInfo: true,
      },
    };

    // 初始化支付方式
    const paymentMethods = [
      { name: '现金', code: 'CASH', enabled: true },
      { name: 'GCash', code: 'GCASH', enabled: true },
      { name: 'Maya', code: 'MAYA', enabled: true },
      { name: '支付宝', code: 'ALIPAY', enabled: false },
      { name: '微信支付', code: 'WECHAT', enabled: false },
    ];

    // 初始化菜品
    const dishes = [
      { 
        name: '宫保鸡丁', 
        category: '热菜', 
        price: 45, 
        description: '经典川菜，酸甜可口', 
        available: true,
        spiciness: 2
      },
      { 
        name: '麻婆豆腐', 
        category: '热菜', 
        price: 32, 
        description: '嫩滑豆腐配麻辣肉末', 
        available: true,
        spiciness: 3
      },
      { 
        name: '白切鸡', 
        category: '凉菜', 
        price: 58, 
        description: '嫩滑鸡肉配秘制蘸料', 
        available: true,
        spiciness: 1
      },
      { 
        name: '西湖牛肉羹', 
        category: '汤类', 
        price: 28, 
        description: '鲜美牛肉汤，营养丰富', 
        available: true,
        spiciness: 0
      },
      { 
        name: '扬州炒饭', 
        category: '主食', 
        price: 35, 
        description: '经典炒饭，粒粒分明', 
        available: true,
        spiciness: 0
      },
      { 
        name: '青岛啤酒', 
        category: '酒水', 
        price: 15, 
        description: '清爽啤酒', 
        available: true,
        spiciness: 0
      },
      { 
        name: '可乐', 
        category: '酒水', 
        price: 12, 
        description: '冰镇可乐', 
        available: true,
        spiciness: 0
      },
      { 
        name: '春卷', 
        category: '小吃', 
        price: 22, 
        description: '酥脆春卷', 
        available: true,
        spiciness: 1
      },
    ];

    // 初始化库存
    const inventory = [
      { name: '大米', category: '主食', quantity: 50, unit: '公斤', minStock: 10, pricePerUnit: 8 },
      { name: '鸡肉', category: '肉类', quantity: 30, unit: '公斤', minStock: 5, pricePerUnit: 40 },
      { name: '豆腐', category: '豆制品', quantity: 20, unit: '块', minStock: 5, pricePerUnit: 3 },
      { name: '青椒', category: '蔬菜', quantity: 15, unit: '公斤', minStock: 3, pricePerUnit: 12 },
      { name: '啤酒', category: '酒水', quantity: 100, unit: '瓶', minStock: 20, pricePerUnit: 10 },
    ];

    // 初始化签单账户
    const signBillAccounts = [
      { 
        accountName: 'VIP客户', 
        creditLimit: 10000, 
        currentBalance: 0, 
        status: 'active',
        contactPerson: '张经理',
        contactPhone: '13800138000'
      },
      { 
        accountName: '公司账户', 
        creditLimit: 5000, 
        currentBalance: 0, 
        status: 'active',
        contactPerson: '李总',
        contactPhone: '13900139000'
      },
    ];

    // 使用管道批量写入数据
    const pipeline = [];
    
    // 创建酒店房间
    for (const room of hotelRooms) {
      pipeline.push(db.create('hotel_rooms', room));
    }
    
    // 创建KTV房间
    for (const ktv of ktvRooms) {
      pipeline.push(db.create('ktv_rooms', ktv));
    }
    
    // 创建支付方式
    for (const method of paymentMethods) {
      pipeline.push(db.create('payment_methods', method));
    }
    
    // 创建菜品
    for (const dish of dishes) {
      pipeline.push(db.create('dishes', dish));
    }
    
    // 创建库存
    for (const item of inventory) {
      pipeline.push(db.create('inventory', item));
    }
    
    // 创建签单账户
    for (const account of signBillAccounts) {
      pipeline.push(db.create('sign_bill_accounts', account));
    }
    
    // 创建系统设置（使用固定ID）
    pipeline.push(db.set('system_settings:default', systemSettings));

    // 执行所有创建操作
    await Promise.all(pipeline);

    return new Response(
      JSON.stringify({
        success: true,
        message: '数据初始化成功',
        stats: {
          hotelRooms: hotelRooms.length,
          ktvRooms: ktvRooms.length,
          systemSettings: 1,
        },
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '数据初始化失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}