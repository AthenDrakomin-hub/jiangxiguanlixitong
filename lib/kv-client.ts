// kv-client.ts
/**
 * Database Client unified for the hotel management system
 * 
 * This client now uses only the dbManager (Neon/Memory database) 
 * instead of Vercel KV to ensure consistency
 */

import { dbManager } from './database.js';
import { DatabaseConfig, StorageType } from '../types.js';

// 定义连接状态类型
interface ConnectionStatus {
  connected: boolean;
  type: StorageType | null;
  isRealConnection: boolean;
  message: string;
}

// 默认配置 - 使用内存数据库作为后备
const defaultConfig: DatabaseConfig = {
  type: 'memory',
  settings: null
};

// 初始化数据库管理器
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await dbManager.initialize(defaultConfig);
    initialized = true;
  }
}

/**
 * Database Client with helper methods for the hotel management system
 * This client now uses only dbManager (Neon/Memory) for consistency
 */
export const kvClient = {
  /**
   * 检查连接状态并返回配置信息
   * @returns 连接状态和配置详情
   */
  getConnectionStatus(): ConnectionStatus {
    const isInitialized = dbManager.isInitialized();
    return {
      connected: isInitialized,
      type: isInitialized && (globalThis as any).dbConfig ? (globalThis as any).dbConfig.type : null,
      isRealConnection: isInitialized,
      message: isInitialized ? 'Database connected' : 'Database not initialized'
    };
  },

  isConnected(): boolean {
    return dbManager.isInitialized();
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
   * 初始化数据库连接
   * @param config 数据库配置
   */
  async initialize(config: DatabaseConfig): Promise<void> {
    try {
      await dbManager.reconfigure(config);
      (globalThis as any).dbConfig = config;
      console.log(`Database initialized with type: ${config.type}`);
    } catch (error) {
      console.error('Error initializing database:', error);
      // 如果初始化失败，使用内存数据库作为后备
      await dbManager.initialize(defaultConfig);
      console.warn('Falling back to memory database');
    }
  },

  /**
   * Get a single item by key
   * @param key The key to retrieve
   * @returns The parsed JSON data or null if not found
   */
  async get(key: string) {
    await ensureInitialized();
    try {
      const db = dbManager.getDatabase();
      const data = await db.get<any>(key);
      // 深度序列化处理（BigInt 等）
      return data ? this.serializeData(data) : null;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set a single item by key
   * @param key The key to set
   * @param value The value to store (will be JSON serialized)
   */
  async set(key: string, value: unknown) {
    await ensureInitialized();
    try {
      const db = dbManager.getDatabase();
      await db.set(key, value);
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
    }
  },

  /**
   * Delete a single item by key
   * @param key The key to delete
   */
  async del(key: string) {
    await ensureInitialized();
    try {
      const db = dbManager.getDatabase();
      return await db.delete(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return false;
    }
  },

  /**
   * Get all items for a specific entity type
   * @param entityType The type of entity (e.g., 'dishes', 'orders')
   * @returns Array of all items
   */
  async getAll(entityType: string) {
    await ensureInitialized();
    try {
      const db = dbManager.getDatabase();
      return await db.getAll<any>(entityType);
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
    await ensureInitialized();
    try {
      const db = dbManager.getDatabase();
      return await db.create<any>(entityType, itemData);
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
    await ensureInitialized();
    try {
      const db = dbManager.getDatabase();
      return await db.update<any>(entityType, id, itemData);
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
    await ensureInitialized();
    try {
      const db = dbManager.getDatabase();
      return await db.remove(entityType, id);
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