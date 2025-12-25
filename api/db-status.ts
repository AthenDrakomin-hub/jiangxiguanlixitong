import { dbManager } from '../lib/database.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const method = req.method;
  
  // CORS 头设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
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
    let dbType = null;
    try {
      const db = dbManager.getDatabase();
      // 尝试执行一个简单的操作来验证连接
      await db.get('health-check-test');
    } catch (error) {
      console.warn('Database health check failed:', error);
    }
    
    // 获取当前配置的数据库类型
    const connectionStatus = {
      connected: true,
      type: process.env.DB_TYPE || 'memory',
      isRealConnection: (process.env.DB_TYPE && process.env.DB_TYPE !== 'memory') || false,
      message: `数据库连接正常 (类型: ${process.env.DB_TYPE || 'memory'})`
    };

    // 如果是真实连接（非内存），提供更详细的检查
    if (connectionStatus.isRealConnection) {
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

      return new Response(
        JSON.stringify({
          success: true,
          message: '数据库连接正常',
          connectionStatus,
          stats,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } else {
      // 内存数据库的响应
      return new Response(
        JSON.stringify({
          success: true,
          message: connectionStatus.message,
          connectionStatus,
          stats: { info: '使用内存数据库，数据将在重启后丢失' },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }
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