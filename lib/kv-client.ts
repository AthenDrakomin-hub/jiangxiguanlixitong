// kv-client.js
/**
 * KV Client for Upstash Redis integration
 *
 * This module provides a wrapper around the Upstash Redis client
 * to handle data storage and retrieval for the hotel management system.
 */

import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Get Redis configuration from environment variables
const redisUrl =
  process.env.HOTEL_KV_KV_REST_API_URL ||
  process.env.HOTEL_KV_REST_API_URL ||
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_URL;

const redisToken =
  process.env.HOTEL_KV_KV_REST_API_TOKEN ||
  process.env.HOTEL_KV_REST_API_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_TOKEN;

// Validate required environment variables
if (!redisUrl || !redisToken) {
  console.error('❌ Missing required Upstash Redis environment variables!');
  console.error(
    'Please set: HOTEL_KV_KV_REST_API_URL and HOTEL_KV_KV_REST_API_TOKEN (or HOTEL_KV_REST_API_URL and HOTEL_KV_REST_API_TOKEN, or KV_REST_API_URL and KV_REST_API_TOKEN, or UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN)'
  );
  // Instead of throwing an error, we'll create a mock client for development
  console.warn('🔧 Using mock KV client for development purposes');
}

// Initialize Redis client with environment variables
const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

/**
 * KV Client with helper methods for the hotel management system
 */
export const kvClient = {
  /**
   * Check if the client is connected
   * @returns Boolean indicating if the client is properly configured
   */
  isConnected() {
    return !!redis;
  },

  /**
   * Get a single item by key
   * @param key The key to retrieve
   * @returns The parsed JSON data or null if not found
   */
  async get(key: string) {
    // If no redis client, return null
    if (!redis) {
      console.warn(`No Redis connection, returning null for key: ${key}`);
      return null;
    }

    try {
      const data = await redis.get(key);
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return data;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set a single item by key
   * @param key The key to set
   * @param value The value to store (will be JSON serialized)
   * @returns The result of the set operation
   */
  async set(key: string, value: unknown) {
    // If no redis client, return null
    if (!redis) {
      console.warn(`No Redis connection, skipping set for key: ${key}`);
      return null;
    }

    try {
      return await redis.set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return null;
    }
  },

  /**
   * Delete a single item by key
   * @param key The key to delete
   * @returns The number of keys deleted
   */
  async del(key: string) {
    // If no redis client, return 0
    if (!redis) {
      console.warn(`No Redis connection, skipping delete for key: ${key}`);
      return 0;
    }

    try {
      return await redis.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return 0;
    }
  },

  /**
   * Get all IDs for a specific entity type
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @returns Array of IDs
   */
  async getIndex(entityType: string) {
    // If no redis client, return empty array
    if (!redis) {
      console.warn(
        `No Redis connection, returning empty array for index: ${entityType}`
      );
      return [];
    }

    try {
      const indexKey = `${entityType}:index`;
      const members = await redis.smembers(indexKey);
      return members;
    } catch (error) {
      console.error(`Error getting index for ${entityType}:`, error);
      return [];
    }
  },

  /**
   * Add an ID to the index for a specific entity type
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @param id The ID to add
   * @returns Number of elements added to the set
   */
  async addToIndex(entityType: string, id: string) {
    // If no redis client, return 0
    if (!redis) {
      console.warn(`No Redis connection, skipping add to index: ${entityType}`);
      return 0;
    }

    try {
      const indexKey = `${entityType}:index`;
      return await redis.sadd(indexKey, id);
    } catch (error) {
      console.error(`Error adding ${id} to index ${entityType}:`, error);
      return 0;
    }
  },

  /**
   * Remove an ID from the index for a specific entity type
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @param id The ID to remove
   * @returns Number of elements removed from the set
   */
  async removeFromIndex(entityType: string, id: string) {
    // If no redis client, return 0
    if (!redis) {
      console.warn(
        `No Redis connection, skipping remove from index: ${entityType}`
      );
      return 0;
    }

    try {
      const indexKey = `${entityType}:index`;
      return await redis.srem(indexKey, id);
    } catch (error) {
      console.error(`Error removing ${id} from index ${entityType}:`, error);
      return 0;
    }
  },

  /**
   * Get all items for a specific entity type
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @returns Array of all items
   */
  async getAll(entityType: string) {
    // If no redis client, return empty array
    if (!redis) {
      console.warn(
        `No Redis connection, returning empty array for all items: ${entityType}`
      );
      return [];
    }

    try {
      const ids = await this.getIndex(entityType);
      const items = [];

      for (const id of ids) {
        const item = await this.get(`${entityType}:${id}`);
        if (item) {
          items.push(item);
        }
      }

      return items;
    } catch (error) {
      console.error(`Error getting all items for ${entityType}:`, error);
      return [];
    }
  },

  /**
   * Create a new item with auto-generated ID
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @param itemData The data to store
   * @returns The created item with ID
   */
  async create(entityType: string, itemData: unknown) {
    // If no redis client, throw error
    if (!redis) {
      console.error(
        `No Redis connection, cannot create item in: ${entityType}`
      );
      throw new Error('Database connection not available');
    }

    try {
      // Generate a unique ID
      const id = this.generateId();

      // Add timestamp fields
      const newItem = {
        ...itemData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store the item
      const key = `${entityType}:${id}`;
      await this.set(key, newItem);

      // Add to index
      await this.addToIndex(entityType, id);

      return newItem;
    } catch (error) {
      console.error(`Error creating item in ${entityType}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing item
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @param id The ID of the item to update
   * @param itemData The data to update
   * @returns The updated item
   */
  async update(entityType: string, id: string, itemData: unknown) {
    // If no redis client, throw error
    if (!redis) {
      console.error(
        `No Redis connection, cannot update item in: ${entityType}`
      );
      throw new Error('Database connection not available');
    }

    try {
      const key = `${entityType}:${id}`;

      // Get existing item
      const existingItem = await this.get(key);
      if (!existingItem) {
        return null;
      }

      // Update the item
      const updatedItem = {
        ...existingItem,
        ...itemData,
        updatedAt: new Date().toISOString(),
      };

      // Store the updated item
      await this.set(key, updatedItem);

      return updatedItem;
    } catch (error) {
      console.error(`Error updating item ${id} in ${entityType}:`, error);
      throw error;
    }
  },

  /**
   * Delete an item
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @param id The ID of the item to delete
   * @returns True if deleted, false otherwise
   */
  async delete(entityType: string, id: string) {
    // If no redis client, throw error
    if (!redis) {
      console.error(
        `No Redis connection, cannot delete item in: ${entityType}`
      );
      throw new Error('Database connection not available');
    }

    try {
      const key = `${entityType}:${id}`;

      // Delete the item
      const deleted = await this.del(key);

      // Remove from index
      await this.removeFromIndex(entityType, id);

      return deleted > 0;
    } catch (error) {
      console.error(`Error deleting item ${id} from ${entityType}:`, error);
      return false;
    }
  },

  /**
   * Generate a unique ID
   * @returns A unique string ID
   */
  generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  },
};
