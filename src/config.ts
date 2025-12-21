// 应用配置文件
export const APP_CONFIG = {
  // 默认管理员账户
  DEFAULT_ADMIN: {
    username: 'admin',
    password: 'admin123',
  },

  // 应用基本信息
  APP_INFO: {
    NAME: '江西酒店管理系统',
    VERSION: '1.0.0',
    DESCRIPTION: '酒店管理后台系统',
  },

  // 默认存储信息
  DEFAULT_STORE_INFO: {
    name: '江西酒店',
    address: '江西省南昌市',
    phone: '0791-88888888',
    openingHours: '24小时营业',
  },

  // 默认财务信息
  DEFAULT_FINANCIAL: {
    exchangeRate: 8.2,
    serviceChargeRate: 0.1,
  },

  // 通知配置
  NOTIFICATION: {
    soundUrl: '/notification.mp3',
  },

  // API配置
  API: {
    BASE_URL: '/api',
    TIMEOUT: 10000,
  },

  // 存储配置
  STORAGE: {
    PREFIX: 'hotel_',
  },
};
