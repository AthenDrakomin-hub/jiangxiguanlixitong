// Application-wide configuration constants
export const APP_CONFIG = {
  // Default admin credentials (should be overridden by environment variables)
  DEFAULT_ADMIN: {
    username: 'admin',
    password: 'jx88888888'
  },
  
  // Store information
  DEFAULT_STORE_INFO: {
    name: '江西酒店 (Jinjiang Star Hotel)',
    address: '5 Corner Lourdes Street and Roxas Boulevard, Pasay City',
    phone: '+639084156449',
    openingHours: '10:00 - 02:00',
    wifiSsid: 'jx88888888',
    telegram: '@jx555999'
  },
  
  // Financial settings
  DEFAULT_FINANCIAL: {
    exchangeRate: 8.2, // RMB to PHP
    serviceChargeRate: 0.10 // 10%
  },
  
  // Notification settings
  NOTIFICATION: {
    soundUrl: '/sounds/notification.mp3'
  }
};