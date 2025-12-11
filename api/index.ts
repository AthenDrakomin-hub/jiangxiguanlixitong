import { VercelRequest, VercelResponse } from '@vercel/node';
import { put, list, del } from '@vercel/blob';

// Define allowed collections
const ALLOWED_COLLECTIONS = [
  'dishes', 
  'orders', 
  'expenses', 
  'inventory', 
  'ktv_rooms', 
  'sign_bill_accounts', 
  'hotel_rooms', 
  'payment_methods'
];

// Validate collection name
function isValidCollection(collectionName: string): boolean {
  return ALLOWED_COLLECTIONS.includes(collectionName);
}

// Generate a unique key for blob storage
function generateBlobKey(collectionName: string, id?: string): string {
  if (id) {
    return `${collectionName}/${id}.json`;
  }
  return `${collectionName}.json`;
}

// Helper function to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extract collection name from URL path
    const pathParts = req.url?.split('/').filter((p: string) => p) || [];
    const collectionName = pathParts[pathParts.length - 1]?.split('?')[0] || query.collection as string;
    
    // Validate collection name
    if (collectionName && collectionName !== 'index' && !isValidCollection(collectionName)) {
      res.status(400).json({ 
        success: false,
        message: `Invalid collection name: ${collectionName}`
      });
      return;
    }
    
    switch (method) {
      case 'GET':
        if (collectionName) {
          // Get all items in collection
          try {
            const blobList = await list({ prefix: `${collectionName}/` });
            const items = [];
            
            for (const blob of blobList.blobs) {
              const response = await fetch(blob.url);
              const item = await response.json();
              items.push(item);
            }
            
            res.status(200).json({ 
              success: true,
              data: items,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error fetching data from blob storage:', error);
            res.status(200).json({ 
              success: true,
              data: [],
              timestamp: new Date().toISOString()
            });
          }
        } else {
          // Return API info
          res.status(200).json({ 
            success: true,
            message: 'Jiangxi Hotel Management System API (Blob Storage Version)',
            timestamp: new Date().toISOString()
          });
        }
        break;
        
      case 'POST':
        // Create new item
        if (collectionName && body) {
          const newItem = {
            id: generateId(),
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Store item in blob storage
          const blobKey = generateBlobKey(collectionName, newItem.id);
          const blobResult = await put(blobKey, JSON.stringify(newItem), { 
            access: 'public',
            contentType: 'application/json'
          });
          
          res.status(201).json({ 
            success: true,
            data: newItem,
            url: blobResult.url,
            message: `Successfully created new record in ${collectionName}`
          });
        } else {
          res.status(400).json({ 
            success: false,
            message: 'Collection name and data body are required for POST requests'
          });
        }
        break;
        
      case 'PUT':
        // Update existing item
        if (collectionName && query.id && body) {
          const updatedItem = {
            id: query.id,
            ...body,
            updatedAt: new Date().toISOString()
          };
          
          // Update item in blob storage
          const blobKey = generateBlobKey(collectionName, query.id as string);
          const blobResult = await put(blobKey, JSON.stringify(updatedItem), { 
            access: 'public',
            contentType: 'application/json'
          });
          
          res.status(200).json({ 
            success: true,
            data: updatedItem,
            url: blobResult.url,
            message: `Successfully updated record in ${collectionName}`
          });
        } else {
          res.status(400).json({ 
            success: false,
            message: 'Collection name, record ID, and data body are required for PUT requests'
          });
        }
        break;
        
      case 'DELETE':
        // Delete item
        if (collectionName && query.id) {
          // Delete item from blob storage
          const blobKey = generateBlobKey(collectionName, query.id as string);
          await del(`https://your-blob-store.vercel.app/${blobKey}`);
          
          res.status(200).json({ 
            success: true,
            message: `Successfully deleted record from ${collectionName}`
          });
        } else {
          res.status(400).json({ 
            success: false,
            message: 'Collection name and record ID are required for DELETE requests'
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}