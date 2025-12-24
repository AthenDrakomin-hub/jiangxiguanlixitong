import { DatabaseConfig, StorageType } from '../types';

/**
 * 应用程序配置
 */
export const APP_CONFIG = {
  // 默认店铺信息
  DEFAULT_STORE_INFO: {
    name: '江西酒店 (Jinjiang Star Hotel)',
    address: '5 Corner Lourdes Street and Roxas Boulevard, Pasay City',
    phone: '+639084156449',
    openingHours: '10:00 - 02:00',
    kitchenPrinterUrl: '',
    wifiSsid: 'ChangeMe_WIFI_SSID',
    wifiPassword: '',
    telegram: '@jx555999',
    h5PageTitle: '江西酒店 - 在线点餐',
    h5PageDescription: '江西酒店在线点餐系统，为您提供便捷的客房送餐和大厅点餐服务',
    h5PageKeywords: '江西酒店,在线点餐,客房送餐,餐厅服务',
  },

  // 默认财务设置
  DEFAULT_FINANCIAL: {
    exchangeRate: 8.2,
    serviceChargeRate: 0.1, // 10%
  },

  // 通知配置
  NOTIFICATION: {
    soundUrl: '/sounds/notification.mp3',
  },
};

/**
 * 从环境变量创建数据库配置
 */
export function createDatabaseConfigFromEnv(): DatabaseConfig {
  // 检查环境变量并确定数据库类型
  const dbType = (process.env.DB_TYPE || 'memory') as StorageType;
  
  switch (dbType) {
    case 'neon':
      return {
        type: 'neon',
        settings: {
          connectionString: process.env.NEON_CONNECTION_STRING || '',
        }
      };
    
    case 'memory':
    default:
      return {
        type: 'memory',
        settings: null
      };
  }
}

/**
 * 初始化数据库配置
 */
export async function initializeDatabase() {
  const { kvClient } = await import('../lib/kv-client.js');
  const dbConfig = createDatabaseConfigFromEnv();
  
  try {
    await kvClient.initialize(dbConfig);
    console.log(`数据库初始化成功，类型: ${dbConfig.type}`);
  } catch (error) {
    console.error('数据库初始化失败，使用默认内存数据库:', error);
    // 如果初始化失败，使用内存数据库作为后备
    await kvClient.initialize({
      type: 'memory',
      settings: null
    });
  }
}