// Internationalization utilities

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

// Language resources
const translations: Record<string, TranslationDictionary> = {
  'zh-CN': {
    // Navigation
    'dashboard': '仪表盘',
    'menu': '菜单管理',
    'orders': '订单中心',
    'finance': '财务管理',
    'inventory': '库存管理',
    'settings': '系统设置',
    'ktv': 'KTV 包厢',
    'signbill': '签单挂账',
    'hotel': '客房送餐',
    'qrcode': '二维码管理',
    'kitchen': '后厨显示',
    'customer': '顾客点餐',
    'car': '用车服务',
    'permissions': '权限管理',
    
    // Common actions
    'save': '保存',
    'cancel': '取消',
    'delete': '删除',
    'edit': '编辑',
    'add': '添加',
    'search': '搜索',
    'filter': '筛选',
    
    // Status messages
    'loading': '加载中...',
    'success': '操作成功',
    'error': '操作失败',
    'confirm': '确认操作',
    
    // Form labels
    'name': '名称',
    'description': '描述',
    'price': '价格',
    'quantity': '数量',
    'category': '分类',
    
    // Validation messages
    'required': '此项为必填',
    'invalidFormat': '格式不正确',
    
    // Time related
    'today': '今天',
    'yesterday': '昨天',
    'thisWeek': '本周',
    'thisMonth': '本月',
  },
  
  'en': {
    // Navigation
    'dashboard': 'Dashboard',
    'menu': 'Menu Management',
    'orders': 'Order Center',
    'finance': 'Financial Management',
    'inventory': 'Inventory Management',
    'settings': 'System Settings',
    'ktv': 'KTV Rooms',
    'signbill': 'Sign Bill',
    'hotel': 'Hotel Room Service',
    'qrcode': 'QR Code Management',
    'kitchen': 'Kitchen Display',
    'customer': 'Customer Order',
    'car': 'Car Service',
    'permissions': 'Permission Management',
    
    // Common actions
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'search': 'Search',
    'filter': 'Filter',
    
    // Status messages
    'loading': 'Loading...',
    'success': 'Operation successful',
    'error': 'Operation failed',
    'confirm': 'Confirm action',
    
    // Form labels
    'name': 'Name',
    'description': 'Description',
    'price': 'Price',
    'quantity': 'Quantity',
    'category': 'Category',
    
    // Validation messages
    'required': 'This field is required',
    'invalidFormat': 'Invalid format',
    
    // Time related
    'today': 'Today',
    'yesterday': 'Yesterday',
    'thisWeek': 'This Week',
    'thisMonth': 'This Month',
  },

  'fil': {
    // Navigation
    'dashboard': 'Dashboard',
    'menu': 'Pamamahala ng Menu',
    'orders': 'Sentro ng Order',
    'finance': 'Pamamahala sa Pananalapi',
    'inventory': 'Imbentaryo',
    'settings': 'Mga Setting ng Sistema',
    'ktv': 'Silid ng KTV',
    'signbill': 'Mag-sign ng Bill',
    'hotel': 'Serbisyo sa Kuwarto ng Hotel',
    'qrcode': 'Pamamahala ng QR Code',
    'kitchen': 'Display ng Kusina',
    'customer': 'Order ng Customer',
    'car': 'Serbisyo sa Sasakyan',
    'permissions': 'Pamamahala ng Pahintulot',
    
    // Common actions
    'save': 'I-save',
    'cancel': 'Ikansela',
    'delete': 'Tanggalin',
    'edit': 'I-edit',
    'add': 'Magdagdag',
    'search': 'Maghanap',
    'filter': 'Salain',
    
    // Status messages
    'loading': 'Naglo-load...',
    'success': 'Matagumpay ang operasyon',
    'error': 'Nabigo ang operasyon',
    'confirm': 'Kumpirmahin ang aksyon',
    
    // Form labels
    'name': 'Pangalan',
    'description': 'Paglalarawan',
    'price': 'Presyo',
    'quantity': 'Dami',
    'category': 'Kategorya',
    
    // Validation messages
    'required': 'Kinakailangan ang field na ito',
    'invalidFormat': 'Di-wasto ang format',
    
    // Time related
    'today': 'Ngayon',
    'yesterday': 'Kahapon',
    'thisWeek': 'Ngayong Linggo',
    'thisMonth': 'Ngayong Buwan',
  }
};

// Current language (default to Chinese)
let currentLanguage: string = 'zh-CN';

// Set the current language
export const setLanguage = (lang: string) => {
  if (translations[lang]) {
    currentLanguage = lang;
  }
};

// Get the current language
export const getCurrentLanguage = (): string => {
  return currentLanguage;
};

// Translate a key to the current language
export const t = (key: string, lang?: string): string => {
  const language = lang || currentLanguage;
  
  // Split key by dots for nested objects
  const keys = key.split('.');
  let translation: string | TranslationDictionary | undefined = translations[language];
  
  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = (translation as TranslationDictionary)[k];
    } else {
      // Fallback to English, then to key itself
      if (language !== 'en') {
        return t(key, 'en');
      }
      return key;
    }
  }
  
  return typeof translation === 'string' ? translation : key;
};

// Format currency based on locale
export const formatCurrency = (amount: number, currency: string = 'PHP'): string => {
  // For Philippine Peso
  if (currency === 'PHP') {
    return `₱${amount.toFixed(2)}`;
  }
  
  // Default formatting
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date based on locale
export const formatDate = (date: Date | string, locale?: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const lang = locale || currentLanguage;
  
  if (lang === 'zh-CN') {
    return dateObj.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  if (lang === 'fil') {
    return dateObj.toLocaleDateString('fil-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};