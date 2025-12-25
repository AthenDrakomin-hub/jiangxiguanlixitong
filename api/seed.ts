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
  const adminUser = process.env.VITE_ADMIN_USER || 'admin';
  const adminPass = process.env.VITE_ADMIN_PASS || 'admin123';
  
  // 验证Basic认证头
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response(
      JSON.stringify({
        success: false,
        message: '认证失败',
      }),
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }
  
  // 解码Base64认证信息
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [username, password] = credentials.split(':');
    
    if (username !== adminUser || password !== adminPass) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '认证失败',
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: '认证失败',
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