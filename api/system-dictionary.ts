import { dbManager } from '../lib/database.js';
import { SystemDictionary } from '../types.js';

export interface DictionaryQuery {
  category?: string;
  key_code?: string;
  search?: string;
}

export const dictionaryAPI = {
  // 获取词库条目
  async getDictionaryEntries(query?: DictionaryQuery): Promise<SystemDictionary[]> {
    const db = dbManager.getDatabase();
    
    let entries = await db.getAll<SystemDictionary>('system_dictionary');
    
    if (query) {
      if (query.category) {
        entries = entries.filter(entry => entry.category === query.category);
      }
      
      if (query.key_code) {
        entries = entries.filter(entry => entry.key_code === query.key_code);
      }
      
      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        entries = entries.filter(entry => 
          entry.key_code.toLowerCase().includes(searchTerm) ||
          entry.zh_cn.toLowerCase().includes(searchTerm) ||
          entry.en_ph.toLowerCase().includes(searchTerm) ||
          (entry.description && entry.description.toLowerCase().includes(searchTerm))
        );
      }
    }
    
    return entries;
  },

  // 获取单个词库条目
  async getDictionaryEntry(key_code: string): Promise<SystemDictionary | null> {
    const db = dbManager.getDatabase();
    return await db.get<SystemDictionary>(`system_dictionary:${key_code}`);
  },

  // 创建词库条目
  async createDictionaryEntry(entry: Omit<SystemDictionary, 'createdAt' | 'updatedAt'>): Promise<SystemDictionary> {
    const db = dbManager.getDatabase();
    
    const newEntry: SystemDictionary = {
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return await db.create('system_dictionary', newEntry);
  },

  // 更新词库条目
  async updateDictionaryEntry(key_code: string, updates: Partial<SystemDictionary>): Promise<SystemDictionary> {
    const db = dbManager.getDatabase();
    
    const existing = await db.get<SystemDictionary>(`system_dictionary:${key_code}`);
    if (!existing) {
      throw new Error(`Dictionary entry with key_code ${key_code} not found`);
    }
    
    const updatedEntry: SystemDictionary = {
      ...existing,
      ...updates,
      key_code, // Ensure key_code remains unchanged
      updatedAt: new Date().toISOString()
    };
    
    return await db.update('system_dictionary', key_code, updatedEntry);
  },

  // 删除词库条目
  async deleteDictionaryEntry(key_code: string): Promise<boolean> {
    const db = dbManager.getDatabase();
    return await db.remove('system_dictionary', key_code);
  },

  // 初始化默认词库
  async initializeDefaultDictionary(): Promise<void> {
    const db = dbManager.getDatabase();
    
    // 检查是否已有数据
    const existingEntries = await db.getAll<SystemDictionary>('system_dictionary');
    if (existingEntries.length > 0) {
      return; // 已有数据，不再初始化
    }

    const defaultEntries: Omit<SystemDictionary, 'createdAt' | 'updatedAt'>[] = [
      // 业务状态类
      {
        key_code: 'ORDER_PENDING',
        category: 'STATUS',
        zh_cn: '待接单',
        en_ph: 'Pending / New Order',
        description: 'H5刚下的单'
      },
      {
        key_code: 'ORDER_PROCESSING',
        category: 'STATUS',
        zh_cn: '制作中',
        en_ph: 'Kitchen Processing',
        description: '厨房正在做'
      },
      {
        key_code: 'ORDER_DELIVERED',
        category: 'STATUS',
        zh_cn: '已送达',
        en_ph: 'Order Delivered',
        description: '菜已上齐'
      },
      {
        key_code: 'ORDER_COMPLETED',
        category: 'STATUS',
        zh_cn: '已结账',
        en_ph: 'Completed / Paid',
        description: '钱已收到'
      },
      {
        key_code: 'ORDER_VOID',
        category: 'STATUS',
        zh_cn: '已作废',
        en_ph: 'Voided / Cancelled',
        description: '异常订单处理'
      },
      
      // 支付方式类
      {
        key_code: 'PAY_CASH',
        category: 'PAYMENT',
        zh_cn: '现金支付',
        en_ph: 'Cash Payment',
        description: '现金收银'
      },
      {
        key_code: 'PAY_GCASH',
        category: 'PAYMENT',
        zh_cn: 'GCash转账',
        en_ph: 'GCash / E-Wallet',
        description: '电子支付'
      },
      {
        key_code: 'PAY_MAYA',
        category: 'PAYMENT',
        zh_cn: 'Maya支付',
        en_ph: 'Maya Payment',
        description: '电子支付'
      },
      {
        key_code: 'PAY_CHARGE',
        category: 'PAYMENT',
        zh_cn: '签单挂账',
        en_ph: 'Charge to Account',
        description: '合作单位挂账'
      },
      {
        key_code: 'PAY_ROOM',
        category: 'PAYMENT',
        zh_cn: '房费合并',
        en_ph: 'Charge to Room',
        description: '客人退房再付'
      },
      
      // 前台操作类
      {
        key_code: 'BTN_CHECKOUT',
        category: 'UI',
        zh_cn: '收银结算',
        en_ph: 'Pay / Checkout',
        description: '收钱按钮'
      },
      {
        key_code: 'BTN_SHIFT',
        category: 'UI',
        zh_cn: '交班报告',
        en_ph: 'End Shift / Report',
        description: '换班结算'
      },
      {
        key_code: 'BTN_EXPENSE',
        category: 'UI',
        zh_cn: '记录支出',
        en_ph: 'Add Expense',
        description: '记一笔开销'
      },
      {
        key_code: 'BTN_VOID',
        category: 'UI',
        zh_cn: '作废订单',
        en_ph: 'Void Order',
        description: '删单理由弹出'
      },
      {
        key_code: 'BTN_CONFIRM',
        category: 'UI',
        zh_cn: '确认接单',
        en_ph: 'Confirm Order',
        description: '订单中心操作'
      },
      
      // 财务分类类
      {
        key_code: 'EXP_MARKET',
        category: 'EXPENSE',
        zh_cn: '买菜采购',
        en_ph: 'Market / Ingredients',
        description: '厨房支出'
      },
      {
        key_code: 'EXP_REPAIR',
        category: 'EXPENSE',
        zh_cn: '维修费用',
        en_ph: 'Maintenance / Repair',
        description: '设施维护'
      },
      {
        key_code: 'EXP_UTILITY',
        category: 'EXPENSE',
        zh_cn: '水电杂费',
        en_ph: 'Utilities / Bills',
        description: '杂项开支'
      },
      {
        key_code: 'EXP_REFUND',
        category: 'EXPENSE',
        zh_cn: '客服退款',
        en_ph: 'Refund to Customer',
        description: '异常退款'
      }
    ];

    for (const entry of defaultEntries) {
      await db.create('system_dictionary', {
        ...entry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }
};