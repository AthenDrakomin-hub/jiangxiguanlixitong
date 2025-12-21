// api/unified-index.ts
/**
 * Unified API Handler for both Blob and KV storage
 * 
 * This module provides a single API endpoint that can work with
 * both Vercel Blob Storage and Vercel KV storage based on
 * environment configuration.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { storageManager } from '../lib/storage-manager.js';

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

  try {
    // Extract collection name from URL path
    const pathParts = req.url?.split('/').filter((p: string) => p) || [];
    const collectionName =
      pathParts[pathParts.length - 1]?.split('?')[0] ||
      (query.collection as string);

    // Log current storage backend
    const backendInfo = storageManager.getBackendInfo();
    console.log(`Using storage backend: ${backendInfo.type} (${backendInfo.description})`);

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
            const items = await storageManager.getAll(collectionName);
            
            res.status(200).json({
              success: true,
              data: items,
              timestamp: new Date().toISOString(),
              storageBackend: backendInfo.type,
            });
          } catch (error) {
            console.error('Error fetching data from storage:', error);
            // Return empty data array on error but still success status
            res.status(200).json({
              success: true,
              data: [],
              timestamp: new Date().toISOString(),
              storageBackend: backendInfo.type,
            });
          }
        } else {
          // Return API info
          res.status(200).json({
            success: true,
            message:
              'Jiangxi Hotel Management System API (Unified Storage Version)',
            timestamp: new Date().toISOString(),
            storageBackend: backendInfo.type,
            storageDescription: backendInfo.description,
          });
        }
        break;

      case 'POST':
        // Create new item
        if (collectionName && body) {
          try {
            const newItem = await storageManager.create(collectionName, body);
            
            res.status(201).json({
              success: true,
              data: newItem,
              message: `Successfully created new record in ${collectionName}`,
              storageBackend: backendInfo.type,
            });
          } catch (error) {
            console.error('Error creating item in storage:', error);
            res.status(500).json({
              success: false,
              message: 'Failed to create item',
              error: error instanceof Error ? error.message : 'Unknown error',
              storageBackend: backendInfo.type,
            });
          }
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
          try {
            const updatedItem = await storageManager.update(collectionName, query.id as string, body);
            
            if (updatedItem) {
              res.status(200).json({
                success: true,
                data: updatedItem,
                message: `Successfully updated record in ${collectionName}`,
                storageBackend: backendInfo.type,
              });
            } else {
              res.status(404).json({
                success: false,
                message: `Record with ID ${query.id} not found in ${collectionName}`,
                storageBackend: backendInfo.type,
              });
            }
          } catch (error) {
            console.error('Error updating item in storage:', error);
            res.status(500).json({
              success: false,
              message: 'Failed to update item',
              error: error instanceof Error ? error.message : 'Unknown error',
              storageBackend: backendInfo.type,
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
          try {
            const deleted = await storageManager.delete(collectionName, query.id as string);
            
            if (deleted) {
              res.status(200).json({
                success: true,
                message: `Successfully deleted record from ${collectionName}`,
                storageBackend: backendInfo.type,
              });
            } else {
              res.status(404).json({
                success: false,
                message: `Record with ID ${query.id} not found in ${collectionName}`,
                storageBackend: backendInfo.type,
              });
            }
          } catch (error) {
            console.error('Error deleting item from storage:', error);
            res.status(500).json({
              success: false,
              message: 'Failed to delete item',
              error: error instanceof Error ? error.message : 'Unknown error',
              storageBackend: backendInfo.type,
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