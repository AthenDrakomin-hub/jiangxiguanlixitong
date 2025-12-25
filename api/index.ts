import { dbManager } from '../lib/database.js';

export const config = {
  runtime: 'edge',
};


/**
 * 泛用型业务处理器：支持简单的 CRUD 操作
 */
async function genericBusinessHandler(req: Request, entityName: string) {
  const method = req.method;
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  

  // CORS 头设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // 初始化数据库（如果尚未初始化）
  if (!dbManager.isInitialized()) {
    const dbType = process.env.DB_TYPE || 'memory';
    try {
      await dbManager.initialize({ type: dbType as any });
    } catch (error) {
      console.error('Database initialization failed:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Database initialization failed',
          error: '数据库初始化失败',
          debug: {
            hint: '请检查数据库配置',
          },
        }),
        {
          status: 503,
          headers: corsHeaders,
        }
      );
    }
  }

  try {
    if (method === 'GET') {
      if (id) {
        // 获取特定项目
        const database = dbManager.getDatabase();
        const key = `${entityName}:${id}`;
        const item = await database.get(key);
        if (item) {
          return new Response(
            JSON.stringify({
              success: true,
              data: item,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: corsHeaders,
            }
          );
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              message: `Item not found in ${entityName}`,
            }),
            {
              status: 404,
              headers: corsHeaders,
            }
          );
        }
      } else {
        // 获取所有项目
        const database = dbManager.getDatabase();
        const items = await database.getAll(entityName);
        return new Response(
          JSON.stringify({
            success: true,
            data: items,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }
    }

    if (method === 'POST') {
      const database = dbManager.getDatabase();
      const body = await req.json();
      const newItem = await database.create(entityName, body);
      return new Response(
        JSON.stringify({
          success: true,
          data: newItem,
          message: `Successfully created new record in ${entityName}`,
        }),
        {
          status: 201,
          headers: corsHeaders,
        }
      );
    }

    if (method === 'PUT' && id) {
      const database = dbManager.getDatabase();
      const body = await req.json();
      const updatedItem = await database.update(entityName, id, body);
      if (updatedItem) {
        return new Response(
          JSON.stringify({
            success: true,
            data: updatedItem,
            message: `Successfully updated record in ${entityName}`,
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Record not found in ${entityName}`,
          }),
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }
    }

    if (method === 'DELETE' && id) {
      const database = dbManager.getDatabase();
      const deleted = await database.remove(entityName, id);
      if (deleted) {
        return new Response(
          JSON.stringify({
            success: true,
            message: `Successfully deleted record from ${entityName}`,
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Record not found in ${entityName}`,
          }),
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          Allow: 'GET, POST, PUT, DELETE',
        },
      }
    );
  } catch (error) {
    console.error(`[Business Handler Error] ${entityName}:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

/**
 * 认证处理函数
 */
async function authHandler(req: Request) {
  const method = req.method;
  
  // CORS 头设置
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  try {
    // 检查环境变量是否配置
    const ADMIN_USER = process.env.VITE_ADMIN_USER;
    const ADMIN_PASS = process.env.VITE_ADMIN_PASS;
    
    if (!ADMIN_USER || !ADMIN_PASS) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '服务器配置错误：管理员凭据未设置',
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    const { username, password } = await req.json();

    // 验证凭据
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Login successful',
          token: 'fake-jwt-token-for-demo',
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid credentials',
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
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/$/, "").toLowerCase();
  const method = req.method;

  // Handle preflight
  if (method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  // 初始化数据库（如果尚未初始化）
  if (!dbManager.isInitialized()) {
    const dbType = process.env.DB_TYPE || 'memory';
    try {
      await dbManager.initialize({ type: dbType as any });
    } catch (error) {
      console.error('Database initialization failed in main handler:', error);
      const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Database initialization failed',
          error: '数据库初始化失败',
          debug: {
            hint: '请检查数据库配置',
          },
        }),
        {
          status: 503,
          headers: corsHeaders,
        }
      );
    }
  }

  try {
    // 1. 固定功能路由
    if (path === '/api/auth/login') {
      return await authHandler(req);
    }

    // 2. 业务实体路由匹配
    const businessEntities = [
      'dishes', 
      'hotel_rooms', 
      'ktv_rooms', 
      'inventory', 
      'payment_methods', 
      'system_settings',
      'orders',
      'expenses',
      'sign_bill_accounts'
    ];

    for (const entity of businessEntities) {
      if (path === `/api/${entity}` || path.startsWith(`/api/${entity}/`)) {
        // 提取ID（如果存在）
        if (path.startsWith(`/api/${entity}/`)) {
          const pathParts = path.split('/');
          if (pathParts.length >= 4) { // /api/entity/id
            const id = pathParts[3];
            const newUrl = new URL(url.toString());
            newUrl.searchParams.set('id', id);
            const newReq = new Request(newUrl, {
              method: req.method,
              headers: req.headers,
              body: req.body,
            });
            return await genericBusinessHandler(newReq, entity);
          }
        } else {
          return await genericBusinessHandler(req, entity);
        }
      }
    }

    // 3. 兜底 404
    return new Response(
      JSON.stringify({ 
        error: 'API_ROUTE_NOT_FOUND', 
        requested_path: path,
        hint: 'API 路径未注册，请检查后端网关 businessEntities 配置。',
        available_routes: ['/api/auth/login', ...businessEntities.map(e => `/api/${e}`)]
      }), 
      { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );

  } catch (error: any) {
    console.error(`[Gateway Critical Error] ${path}:`, error);
    return new Response(
      JSON.stringify({ 
        error: 'GATEWAY_INTERNAL_ERROR', 
        message: error.message,
        suggestion: '检查 Vercel KV 环境变量和 API 代码逻辑。'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}