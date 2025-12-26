import { dbManager } from '../lib/database.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const method = req.method;
  
  // CORS 头设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://www.jiangxijiudian.store',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (method !== 'GET') {
    return new Response(
      JSON.stringify({
        success: false,
        message: '仅支持 GET 请求',
      }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  try {
    // 检查数据库初始化状态，如果没有初始化，尝试初始化
    if (!dbManager.isInitialized()) {
      console.log('Database not initialized, initializing now in db-status endpoint...');
      const dbType = (process.env.DB_TYPE || 'memory') as any;
      const config = {
        type: dbType,
        settings: dbType === 'neon' ? { 
          connectionString: process.env.NEON_CONNECTION_STRING || '' 
        } : null
      };
      
      try {
        await dbManager.initialize(config);
        console.log(`Database initialized with type: ${dbType} via GET /api/db-status`);
      } catch (initError) {
        console.error('Failed to initialize database in GET /api/db-status:', initError);
        return new Response(
          JSON.stringify({
            success: false,
            message: '数据库初始化失败',
            connectionStatus: {
              connected: false,
              type: null,
              isRealConnection: false,
              message: 'Database initialization failed'
            },
            hint: '请检查数据库配置和环境变量',
          }),
          {
            status: 503,
            headers: corsHeaders,
          }
        );
      }
    }

    // 获取数据库实例并检查连接状态
    try {
      const db = dbManager.getDatabase();
      // 尝试执行一个简单的操作来验证连接
      await db.get('health-check-test');
    } catch (error) {
      console.warn('Database health check failed:', error);
    }
    
    // 获取当前配置的数据库类型
    let connectionStatus;
    const dbType = process.env.DB_TYPE || 'memory';
    
    // 检查是否是真实连接（非内存和非虚拟）
    const isRealConnection = (dbType && dbType !== 'memory' && dbType !== 'virtual') || false;
    
    connectionStatus = {
      connected: true,
      type: dbType,
      isRealConnection: isRealConnection,
      message: isRealConnection 
        ? `数据库连接正常(类型: ${dbType})` 
        : `数据库连接正常(类型: ${dbType} - 模拟模式)`
    };

    // 尝试获取一些统计信息
    const collections = [
      'dishes',
      'orders',
      'expenses',
      'inventory',
      'ktv_rooms',
      'sign_bill_accounts',
      'hotel_rooms',
      'payment_methods',
      'system_settings',
      'users',
      'partner_accounts',
      'categories',
      'system_dictionary'
    ];

    const stats = {};
    for (const collection of collections) {
      try {
        const items = await dbManager.getDatabase().getAll(collection);
        stats[collection] = Array.isArray(items) ? items.length : 0;
      } catch (error) {
        stats[collection] = 'error';
      }
    }

    // 添加数据库连接详细信息
    const dbDetails = {
      configType: process.env.DB_TYPE || 'memory',
      neonConnectionStringSet: !!process.env.NEON_CONNECTION_STRING,
      isSimulatedMode: !isRealConnection
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: '数据库连接正常',
        connectionStatus,
        dbDetails,
        stats,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('DB Status error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '检查数据库状态时出错',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}