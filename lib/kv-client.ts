// kv-client.ts
/**
 * KV Client for Upstash Redis integration
 * 
 * Edge Runtime 兼容配置，使用优化后的 Redis 客户端
 * 支持 Vercel KV 自动注入的环境变量
 */

// 定义连接状态类型
interface ConnectionStatus {
  connected: boolean;
  hasUrl: boolean;
  hasToken: boolean;
  urlPreview: string;
}

import { getRedisClient, getConnectionStatus as getRedisConnectionStatus } from './redis.js';

// 获取环境变量（Vercel KV 自动注入）
const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const redisUrl = getEnvVar('KV_REST_API_URL') || getEnvVar('KV_URL');
const redisToken = getEnvVar('KV_REST_API_TOKEN');

// 环境变量检查（不阻塞，仅记录）
if (!redisUrl || !redisToken) {
  console.warn('⚠️ KV environment variables not found');
  console.warn('Expected: KV_REST_API_URL and KV_REST_API_TOKEN');
  console.warn('Please link Vercel KV in dashboard or redeploy');
}

/**
 * KV Client with helper methods for the hotel management system
 */
export const kvClient = {
  /**
   * 检查连接状态并返回配置信息
   * @returns 连接状态和配置详情
   */
  getConnectionStatus(): ConnectionStatus {
    const redisStatus = getRedisConnectionStatus();
    return {
      connected: redisStatus.ready,
      hasUrl: !!redisUrl,
      hasToken: !!redisToken,
      urlPreview: redisUrl ? `${redisUrl.substring(0, 30)}...` : 'NOT_SET',
    } as ConnectionStatus;
  },

  isConnected(): boolean {
    const redisStatus = getRedisConnectionStatus();
    return redisStatus.ready;
  },

  /**
   * 序列化数据（处理 BigInt 等特殊类型）
   * @param data 原始数据
   * @returns 序列化后的数据
   */
  serializeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // 处理 BigInt
    if (typeof data === 'bigint') {
      return Number(data);
    }

    // 处理数组
    if (Array.isArray(data)) {
      return data.map((item) => this.serializeData(item));
    }

    // 处理对象
    if (typeof data === 'object') {
      const result: Record<string, any> = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = this.serializeData(data[key]);
        }
      }
      return result;
    }

    return data;
  },

  /**
   * Get a single item by key
   * @param key The key to retrieve
   * @returns The parsed JSON data or null if not found
   */
  async get(key: string) {
    // If no redis client, return null
    if (!this.isConnected()) {
      console.warn(`No Redis connection, returning null for key: ${key}`);
      return null;
    }

    try {
      const client = getRedisClient();
      const data = await client.get(key);
      let parsedData;
      
      if (typeof data === 'string') {
        parsedData = JSON.parse(data);
      } else {
        parsedData = data;
      }
      
      // 深度序列化处理（BigInt 等）
      return parsedData ? this.serializeData(parsedData) : null;
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
    if (!this.isConnected()) {
      console.warn(`No Redis connection, skipping set for key: ${key}`);
      return null;
    }

    try {
      const client = getRedisClient();
      return await client.set(key, JSON.stringify(value));
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
    if (!this.isConnected()) {
      console.warn(`No Redis connection, skipping delete for key: ${key}`);
      return 0;
    }

    try {
      const client = getRedisClient();
      return await client.del(key);
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
    if (!this.isConnected()) {
      console.warn(
        `No Redis connection, returning empty array for index: ${entityType}`
      );
      return [];
    }

    try {
      const client = getRedisClient();
      const indexKey = `${entityType}:index`;
      const members = await client.smembers(indexKey);
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
    if (!this.isConnected()) {
      console.warn(`No Redis connection, skipping add to index: ${entityType}`);
      return 0;
    }

    try {
      const client = getRedisClient();
      const indexKey = `${entityType}:index`;
      return await client.sadd(indexKey, id);
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
    if (!this.isConnected()) {
      console.warn(
        `No Redis connection, skipping remove from index: ${entityType}`
      );
      return 0;
    }

    try {
      const client = getRedisClient();
      const indexKey = `${entityType}:index`;
      return await client.srem(indexKey, id);
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
    if (!this.isConnected()) {
      console.warn(
        `No Redis connection, returning empty array for all items: ${entityType}`
      );
      return [];
    }

    try {
      const ids = await this.getIndex(entityType);
      
      // 强化检查：确保 ids 是数组
      if (!Array.isArray(ids) || ids.length === 0) {
        console.warn(`No items found in index for: ${entityType}`);
        return [];
      }

      const items = [];
      for (const id of ids) {
        if (!id) continue; // 跳过空值
        
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
  async create(entityType: string, itemData: Record<string, unknown>) {
    // If no redis client, throw error
    if (!this.isConnected()) {
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
  async update(
    entityType: string,
    id: string,
    itemData: Record<string, unknown>
  ) {
    // If no redis client, throw error
    if (!this.isConnected()) {
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
    if (!this.isConnected()) {
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