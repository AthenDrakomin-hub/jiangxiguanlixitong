import { kvClient } from './db.js';

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

  // Check if database is connected
  if (!kvClient.isConnected()) {
    const status = kvClient.getConnectionStatus();
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Database connection not available',
        error: 'Missing Redis configuration',
        debug: {
          ...status,
          hint: 'Please link Vercel KV in dashboard and redeploy',
        },
      }),
      {
        status: 503,
        headers: corsHeaders,
      }
    );
  }

  try {
    // Extract collection name from URL path
    const pathParts = url.pathname.split('/').filter((p) => p);
    const collectionName = pathParts[pathParts.length - 1] || url.searchParams.get('collection');

    // Validate collection name
    if (
      collectionName &&
      collectionName !== 'index' &&
      !isValidCollection(collectionName)
    ) {
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

    switch (method) {
      case 'GET':
        if (collectionName) {
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
        } else {
          // Return API info with connection status
          const status = kvClient.getConnectionStatus();
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Jiangxi Hotel Management System API (KV Storage Version)',
              kvStatus: status,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
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
        // Update existing item
        const body = await req.json().catch(() => null);
        const recordId = url.searchParams.get('id');
        
        if (collectionName && recordId && body) {
          const updatedItem = await kvClient.update(
            collectionName,
            recordId,
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
        // Delete item
        const recordId = url.searchParams.get('id');
        
        if (collectionName && recordId) {
          const deleted = await kvClient.delete(
            collectionName,
            recordId
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
