import { kvClient } from '../lib/kv-client.js';

// Edge Runtime 配置（极致性能）
export const config = {
  runtime: 'edge',
};

// Define allowed collections
const ALLOWED_COLLECTIONS = [
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

// Validate collection name
function isValidCollection(collectionName: string): boolean {
  return ALLOWED_COLLECTIONS.includes(collectionName);
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const method = req.method;

  // Extract collection name and ID from the dynamic route
  // Expected format: /api/[collection]/[id]
  const pathParts = url.pathname.split('/').filter(part => part !== '');
  let collectionName = null;
  let itemId = null;

  // Find the collection and ID in the path
  const apiIndex = pathParts.indexOf('api');
  if (apiIndex !== -1 && apiIndex + 1 < pathParts.length) {
    collectionName = pathParts[apiIndex + 1];
    
    // If there's another part after collection, it's the ID
    if (apiIndex + 2 < pathParts.length) {
      itemId = pathParts[apiIndex + 2];
    }
  }

  // CORS 头设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

  // Validate collection name
  if (collectionName && !isValidCollection(collectionName)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Invalid collection name: ${collectionName}`,
      }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  // 检查数据库连接状态
  const status = kvClient.getConnectionStatus();
  
  // 如果没有真实连接，提供更明确的错误信息
  if (!status.isRealConnection) {
    // 对于根路径(/api)，仍可返回API信息，但标记连接状态
    if (!collectionName) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jiangxi Hotel Management System API (KV Storage Version)',
          kvStatus: {
            ...status,
            message: '未连接到真实的Vercel KV数据库'
          },
          dataSummary: {},
          collections: ALLOWED_COLLECTIONS,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } else {
      // 对于具体集合操作，返回错误
      return new Response(
        JSON.stringify({
          success: false,
          message: '未连接到真实的Vercel KV数据库',
          error: '缺少真实的Redis配置',
          debug: {
            ...status,
            hint: '请在Vercel控制台连接KV数据库后重试',
          },
        }),
        {
          status: 503,
          headers: corsHeaders,
        }
      );
    }
  }
  
  // 检查连接是否可用
  if (!kvClient.isConnected()) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Database connection not available',
        error: 'Redis连接不可用',
        debug: {
          ...status,
          hint: '请检查Vercel KV配置',
        },
      }),
      {
        status: 503,
        headers: corsHeaders,
      }
    );
  }

  try {
    switch (method) {
      case 'GET':
        if (collectionName) {
          if (itemId) {
            // Get specific item by ID
            try {
              const key = `${collectionName}:${itemId}`;
              const item = await kvClient.get(key);
              
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
                    message: `Item not found in ${collectionName}`,
                  }),
                  {
                    status: 404,
                    headers: corsHeaders,
                  }
                );
              }
            } catch (error) {
              console.error('Error fetching item from KV storage:', error);
              return new Response(
                JSON.stringify({
                  success: false,
                  message: `Item not found in ${collectionName}`,
                }),
                {
                  status: 404,
                  headers: corsHeaders,
                }
              );
            }
          } else {
            // Get all items in collection
            try {
              const items = await kvClient.getAll(collectionName);

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
            } catch (error) {
              console.error('Error fetching data from KV storage:', error);
              // Return empty data array on error but still success status
              return new Response(
                JSON.stringify({
                  success: true,
                  data: [],
                  timestamp: new Date().toISOString(),
                }),
                {
                  status: 200,
                  headers: corsHeaders,
                }
              );
            }
          }
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Collection name is required',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

      case 'POST': {
        // Create new item
        const body = await req.json().catch(() => null);
        
        if (collectionName && body) {
          const newItem = await kvClient.create(collectionName, body);

          return new Response(
            JSON.stringify({
              success: true,
              data: newItem,
              message: `Successfully created new record in ${collectionName}`,
            }),
            {
              status: 201,
              headers: corsHeaders,
            }
          );
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Collection name and data body are required for POST requests',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
      }

      case 'PUT': {
        // Update existing item - requires itemId
        if (!itemId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Record ID is required for PUT requests',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        const body = await req.json().catch(() => null);
        
        if (collectionName && itemId && body) {
          const updatedItem = await kvClient.update(
            collectionName,
            itemId,
            body
          );

          if (updatedItem) {
            return new Response(
              JSON.stringify({
                success: true,
                data: updatedItem,
                message: `Successfully updated record in ${collectionName}`,
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
                message: `Record not found in ${collectionName}`,
              }),
              {
                status: 404,
                headers: corsHeaders,
              }
            );
          }
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Collection name, record ID, and data body are required for PUT requests',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
      }

      case 'DELETE': {
        // Delete item - requires itemId
        if (!itemId) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Record ID is required for DELETE requests',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        if (collectionName && itemId) {
          const deleted = await kvClient.delete(
            collectionName,
            itemId
          );

          if (deleted) {
            return new Response(
              JSON.stringify({
                success: true,
                message: `Successfully deleted record from ${collectionName}`,
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
                message: `Record not found in ${collectionName}`,
              }),
              {
                status: 404,
                headers: corsHeaders,
              }
            );
          }
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Collection name and record ID are required for DELETE requests',
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({
            success: false,
            message: `Method ${method} Not Allowed`,
          }),
          {
            status: 405,
            headers: {
              ...corsHeaders,
              Allow: 'GET, POST, PUT, DELETE',
            },
          }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}