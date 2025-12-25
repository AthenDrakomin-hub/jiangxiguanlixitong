import { Database, DatabaseConfig } from '../types.js';

/**
 * 内存数据库实现（用于开发和测试）
 */
export class MemoryDatabase implements Database {
  private store: Map<string, any> = new Map();

  async connect(): Promise<void> {
    // 在生产环境中避免输出敏感信息
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.log('Memory database connected');
    } else {
      console.log('Memory database connected');
    }
  }

  async disconnect(): Promise<void> {
    // 在生产环境中避免输出敏感信息
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.log('Memory database disconnected');
    } else {
      console.log('Memory database disconnected');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return this.store.get(key) || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    // 数据验证逻辑
    this.validateData(key, value);
    this.store.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async getAll<T>(prefix: string): Promise<T[]> {
    const items: T[] = [];
    for (const [key, value] of this.store.entries()) {
      if (key.startsWith(prefix)) {
        items.push(value);
      }
    }
    return items;
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
      case 'partner_accounts':
        if (value.name_cn === undefined || value.name_cn === '') {
          throw new Error('合作伙伴账户逻辑错误：单位中文名(name_cn)不能为空');
        }
        if (value.name_en === undefined || value.name_en === '') {
          throw new Error('合作伙伴账户逻辑错误：单位英文名(name_en)不能为空');
        }
        if (value.contact_person === undefined || value.contact_person === '') {
          throw new Error('合作伙伴账户逻辑错误：联系人(contact_person)不能为空');
        }
        if (value.phone === undefined || value.phone === '') {
          throw new Error('合作伙伴账户逻辑错误：联系电话(phone)不能为空');
        }
        if (typeof value.credit_limit !== 'number' || value.credit_limit < 0) {
          throw new Error('合作伙伴账户逻辑错误：信用额度(credit_limit)必须为非负数');
        }
        if (typeof value.current_balance !== 'number' || value.current_balance < 0) {
          throw new Error('合作伙伴账户逻辑错误：当前余额(current_balance)必须为非负数');
        }
        break;
    }
  }
}



/**
 * 数据库工厂类，根据配置创建相应的数据库实例
 */
export class DatabaseFactory {
  static create(config: DatabaseConfig): Database {
    switch (config.type) {
      case 'neon':
        // 动态导入NeonDatabase，如果存在
        // 在服务器端，尝试加载NeonDatabase
        try {
          // 在Edge Runtime中，使用同步导入
          const { NeonDatabase } = require('./neon-database');
          return new NeonDatabase(config);
        } catch (e: any) {
          // 在生产环境中避免输出敏感信息
          const isProduction = process.env.NODE_ENV === 'production';
          if (!isProduction) {
            console.warn('Neon数据库模块未找到，使用内存数据库作为后备:', e);
          } else {
            console.warn('Neon数据库模块未找到，使用内存数据库作为后备');
          }
          return new MemoryDatabase();
        }

      case 'memory':
      default:
        // 在生产环境中避免输出敏感信息
        const isProduction = process.env.NODE_ENV === 'production';
        if (!isProduction) {
          console.info(`Using MemoryDatabase for type: ${config.type}`, config);
        } else {
          console.info(`Using MemoryDatabase for type: ${config.type}`);
        }
        return new MemoryDatabase();
    }
  }
}

/**
 * 数据库管理器，提供全局数据库实例
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private database: Database | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(config: DatabaseConfig): Promise<void> {
    this.database = DatabaseFactory.create(config);
    await this.database.connect();
    // 在生产环境中避免输出敏感信息
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.log(`Database initialized with type: ${config.type}`, config);
    } else {
      console.log(`Database initialized with type: ${config.type}`);
    }
  }

  getDatabase(): Database {
    if (!this.database) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.database;
  }

  async reconfigure(config: DatabaseConfig): Promise<void> {
    if (this.database) {
      await this.database.disconnect();
    }
    await this.initialize(config);
  }

  isInitialized(): boolean {
    return this.database !== null;
  }
}

// 创建全局数据库管理器实例
export const dbManager = DatabaseManager.getInstance();