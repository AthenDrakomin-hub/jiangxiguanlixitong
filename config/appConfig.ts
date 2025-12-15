// Application Configuration
export const APP_CONFIG = {
  // Default admin credentials
  DEFAULT_ADMIN: {
    username: 'admin',
    password: 'ChangeMeAdminPass!2025',
  },

  // Default store information
  DEFAULT_STORE_INFO: {
    name: '江西酒店 (Jinjiang Star Hotel)',
    address: '5 Corner Lourdes Street and Roxas Boulevard, Pasay City',
    phone: '+639084156449',
    openingHours: '10:00 - 02:00',
    kitchenPrinterUrl: '',
    wifiSsid: 'ChangeMe_WIFI_SSID',
    wifiPassword: '',
    telegram: '@jx555999',
    // 默认H5页面配置
    h5PageTitle: '江西酒店 - 在线点餐',
    h5PageDescription:
      '江西酒店在线点餐系统，为您提供便捷的客房送餐和大厅点餐服务',
    h5PageKeywords: '江西酒店,在线点餐,客房送餐,餐厅服务',
  },

  // Default financial settings
  DEFAULT_FINANCIAL: {
    exchangeRate: 8.2, // RMB to PHP
    serviceChargeRate: 0.1, // 10%
  },

  // Notification settings
  NOTIFICATION: {
    soundUrl: '/notification.mp3',
  },

  // Default H5 page settings
  DEFAULT_H5_PAGE_SETTINGS: {
    enableCustomStyling: true,
    customHeaderColor: '#4F46E5',
    customButtonColor: '#DC2626',
    showStoreInfo: true,
    showWiFiInfo: true,
  },
};
