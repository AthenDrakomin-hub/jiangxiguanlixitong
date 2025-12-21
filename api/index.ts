import { VercelRequest, VercelResponse } from '@vercel/node';
import { kvClient } from './db.js';

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
];

// Validate collection name
function isValidCollection(collectionName: string): boolean {
  return ALLOWED_COLLECTIONS.includes(collectionName);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check if database is connected
  if (!kvClient.isConnected()) {
    res.status(503).json({
      success: false,
      message: 'Database connection not available',
      error: 'Missing Redis configuration',
    });
    return;
  }

  try {
    // Extract collection name from URL path
    const pathParts = req.url?.split('/').filter((p: string) => p) || [];
    const collectionName =
      pathParts[pathParts.length - 1]?.split('?')[0] ||
      (query.collection as string);

    // Validate collection name
    if (
      collectionName &&
      collectionName !== 'index' &&
      !isValidCollection(collectionName)
    ) {
      res.status(400).json({
        success: false,
        message: `Invalid collection name: ${collectionName}`,
      });
      return;
    }

    switch (method) {
      case 'GET':
        if (collectionName) {
          // Get all items in collection
          try {
            const items = await kvClient.getAll(collectionName);

            res.status(200).json({
              success: true,
              data: items,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Error fetching data from KV storage:', error);
            // Return empty data array on error but still success status
            res.status(200).json({
              success: true,
              data: [],
              timestamp: new Date().toISOString(),
            });
          }
        } else {
          // Return API info
          res.status(200).json({
            success: true,
            message: 'Jiangxi Hotel Management System API (KV Storage Version)',
            timestamp: new Date().toISOString(),
          });
        }
        break;

      case 'POST':
        // Create new item
        if (collectionName && body) {
          const newItem = await kvClient.create(collectionName, body);

          res.status(201).json({
            success: true,
            data: newItem,
            message: `Successfully created new record in ${collectionName}`,
          });
        } else {
          res.status(400).json({
            success: false,
            message:
              'Collection name and data body are required for POST requests',
          });
        }
        break;

      case 'PUT':
        // Update existing item
        if (collectionName && query.id && body) {
          const updatedItem = await kvClient.update(
            collectionName,
            query.id as string,
            body
          );

          if (updatedItem) {
            res.status(200).json({
              success: true,
              data: updatedItem,
              message: `Successfully updated record in ${collectionName}`,
            });
          } else {
            res.status(404).json({
              success: false,
              message: `Record not found in ${collectionName}`,
            });
          }
        } else {
          res.status(400).json({
            success: false,
            message:
              'Collection name, record ID, and data body are required for PUT requests',
          });
        }
        break;

      case 'DELETE':
        // Delete item
        if (collectionName && query.id) {
          const deleted = await kvClient.delete(
            collectionName,
            query.id as string
          );

          if (deleted) {
            res.status(200).json({
              success: true,
              message: `Successfully deleted record from ${collectionName}`,
            });
          } else {
            res.status(404).json({
              success: false,
              message: `Record not found in ${collectionName}`,
            });
          }
        } else {
          res.status(400).json({
            success: false,
            message:
              'Collection name and record ID are required for DELETE requests',
          });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
