import { Database, DatabaseConfig, NeonConfig } from '../types.js';

/**
 * Neon数据库实现
 */
export class NeonDatabase implements Database {
  private pool: any;

  constructor(config: DatabaseConfig) {
    
    if (config.type === 'neon' && config.settings && 'connectionString' in config.settings) {
      // 在构造函数中初始化连接池
      this.initializePool((config.settings as NeonConfig).connectionString);
      console.log('NeonDatabase initialized with config:', config);
    } else {
      throw new Error('Neon数据库连接字符串未配置');
    }
  }

  private initializePool(connectionString: string) {
    try {
      // 使用require来加载Neon驱动
      const { Pool } = require('@neondatabase/serverless');
      this.pool = new Pool({ 
        connectionString: connectionString
      });
    } catch (error) {
      console.error('Failed to initialize Neon database:', error);
      throw new Error('Neon数据库初始化失败，请确保已安装@neondatabase/serverless');
    }
  }

  async connect(): Promise<void> {
    console.log('Neon database connected');
    // 连接池已初始化，无需额外连接操作
  }

  async disconnect(): Promise<void> {
    console.log('Neon database disconnected');
    if (this.pool) {
      await this.pool.end();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const { rows } = await this.pool.query('SELECT value FROM kv_store WHERE key = $1', [key]);
      if (rows.length > 0) {
        return JSON.parse(rows[0].value) as T;
      }
      return null;
    } catch (error) {
      console.error('Error getting value from Neon:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    // 数据验证逻辑
    this.validateData(key, value);
    
    try {
      const serializedValue = JSON.stringify(value);
      await this.pool.query(
        `INSERT INTO kv_store (key, value, updated_at) 
         VALUES ($1, $2, NOW()) 
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, serializedValue]
      );
    } catch (error) {
      console.error('Error setting value in Neon:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        'DELETE FROM kv_store WHERE key = $1',
        [key]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting value from Neon:', error);
      return false;
    }
  }

  async getAll<T>(prefix: string): Promise<T[]> {
    try {
      const { rows } = await this.pool.query(
        'SELECT value FROM kv_store WHERE key LIKE $1',
        [`${prefix}%`]
      );
      
      return rows.map((row: any) => JSON.parse(row.value) as T);
    } catch (error) {
      console.error('Error getting all values from Neon:', error);
      return [];
    }
  }

  async create<T>(prefix: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const id = this.generateId();
    const now = new Date().toISOString();
    const item = {
      ...(data as any),
      id,
      createdAt: now,
      updatedAt: now,
    } as T;

    // 验证数据
    this.validateData(`${prefix}:${id}`, item);
    
    await this.set(`${prefix}:${id}`, item);
    return item;
  }

  async update<T>(prefix: string, id: string, data: Partial<T>): Promise<T | null> {
    const key = `${prefix}:${id}`;
    const existing = await this.get<T>(key);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    } as T;

    // 验证数据
    this.validateData(key, updated);
    
    await this.set(key, updated);
    return updated;
  }

  async remove(prefix: string, id: string): Promise<boolean> {
    const key = `${prefix}:${id}`;
    return await this.delete(key);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private validateData(key: string, value: any): void {
    // 从键中提取实体类型
    const entityType = key.split(':')[0];
    
    switch (entityType) {
      case 'orders':
        if (value.total === undefined || value.total === null) {
          throw new Error('订单逻辑错误：总额(total)不能为空');
        }
        if (value.items === undefined || !Array.isArray(value.items)) {
          throw new Error('订单逻辑错误：订单项(items)必须为数组');
        }
        if (value.tableId === undefined || value.tableId === '') {
          throw new Error('订单逻辑错误：桌号(tableId)不能为空');
        }
        break;
      case 'dishes':
        if (value.name === undefined || value.name === '') {
          throw new Error('菜品逻辑错误：菜品名称(name)不能为空');
        }
        if (typeof value.price !== 'number' || value.price < 0) {
          throw new Error('菜品逻辑错误：菜品价格(price)必须为非负数');
        }
        break;
      case 'expenses':
        if (value.amount === undefined || typeof value.amount !== 'number' || value.amount <= 0) {
          throw new Error('支出逻辑错误：支出金额(amount)必须为正数');
        }
        if (value.category === undefined || value.category === '') {
          throw new Error('支出逻辑错误：支出类别(category)不能为空');
        }
        if (value.description === undefined || value.description === '') {
          throw new Error('支出逻辑错误：支出描述(description)不能为空');
        }
        break;
      case 'inventory':
        if (value.name === undefined || value.name === '') {
          throw new Error('库存逻辑错误：库存名称(name)不能为空');
        }
        if (typeof value.quantity !== 'number' || value.quantity < 0) {
          throw new Error('库存逻辑错误：库存数量(quantity)必须为非负数');
        }
        if (value.unit === undefined || value.unit === '') {
          throw new Error('库存逻辑错误：库存单位(unit)不能为空');
        }
        break;
      case 'hotel_rooms':
        if (value.roomNumber === undefined || value.roomNumber === '') {
          throw new Error('酒店房间逻辑错误：房间号(roomNumber)不能为空');
        }
        if (value.status === undefined || !['available', 'occupied', 'maintenance', 'cleaning'].includes(value.status)) {
          throw new Error('酒店房间逻辑错误：房间状态(status)必须为有效值');
        }
        break;
      case 'ktv_rooms':
        if (value.name === undefined || value.name === '') {
          throw new Error('KTV房间逻辑错误：房间名称(name)不能为空');
        }
        if (value.status === undefined || !['available', 'occupied', 'maintenance'].includes(value.status)) {
          throw new Error('KTV房间逻辑错误：房间状态(status)必须为有效值');
        }
        break;
      case 'sign_bill_accounts':
        if (value.accountName === undefined || value.accountName === '') {
          throw new Error('签单账户逻辑错误：账户名称(accountName)不能为空');
        }
        if (typeof value.creditLimit !== 'number' || value.creditLimit < 0) {
          throw new Error('签单账户逻辑错误：信用额度(creditLimit)必须为非负数');
        }
        break;
    }
  }
}