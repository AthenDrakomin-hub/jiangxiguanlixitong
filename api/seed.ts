import { kvClient } from '../lib/kv-client.js';

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

  // 检查是否为真实连接
  const connectionStatus = kvClient.getConnectionStatus();
  if (!connectionStatus.isRealConnection) {
    return new Response(
      JSON.stringify({
        success: false,
        message: '无法初始化数据：未检测到真实的Vercel KV连接',
        hint: '请在Vercel控制台连接KV数据库后重试',
        connectionStatus,
      }),
      {
        status: 503,
        headers: corsHeaders,
      }
    );
  }

  try {
    // 检查数据库连接状态
    if (!kvClient.isConnected()) {
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

    // 初始化64间酒店房间
    const hotelRooms = [];
    
    // 8楼2区: 8201-8232
    for (let i = 1; i <= 32; i++) {
      const roomNumber = `82${String(i).padStart(2, '0')}`;
      hotelRooms.push({
        id: `room-${roomNumber}`,
        roomNumber: roomNumber,
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
        roomNumber: roomNumber,
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

    // 使用管道批量写入数据
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