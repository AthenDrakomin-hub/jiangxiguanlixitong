// Internationalization utilities

export const LANGUAGE_COOKIE_NAME = 'preferred_language';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

// Language resources
const translations: Record<string, TranslationDictionary> = {
  'zh-CN': {
    // Navigation
    dashboard: '仪表盘',
    menu: '菜单管理',
    orders: '订单中心',
    finance: '财务管理',
    inventory: '库存管理',
    settings: '系统设置',
    ktv: 'KTV 包厢',
    signbill: '签单挂账',
    hotel: '客房送餐',
    qrcode: '二维码管理',
    kitchen: '后厨显示',
    customer: '顾客点餐',
    car: '用车服务',
    permissions: '权限管理',

    // Common actions
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    filter: '筛选',

    // Status messages
    loading: '加载中...',
    success: '操作成功',
    error: '操作失败',
    confirm: '确认操作',
    processing_payment: '正在处理支付...',

    // Form labels
    name: '名称',
    description: '描述',
    price: '价格',
    quantity: '数量',
    category: '分类',

    // Validation messages
    required: '此项为必填',
    invalidFormat: '格式不正确',

    // Time related
    today: '今天',
    yesterday: '昨天',
    thisWeek: '本周',
    thisMonth: '本月',

    // Accessibility labels
    bottom_navigation: '底部导航',
    unread_orders: '未读订单',
    quantity_controls: '数量控制',
    quantity_controls_for: '的数量控制',
    decrease_quantity: '减少',
    increase_quantity: '增加',
    add_to_cart: '添加到购物车',
    close_cart: '关闭购物车',
    back_to_cart: '返回购物车',

    // Customer Order Page
    language_toggle: '中文',
    pending_status: '待接单 Pending',
    cooking_status: '烹饪中 Cooking',
    served_status: '已上菜 Served',
    paid_status: '已支付 Paid',
    search_placeholder: 'Search food... 搜索菜品',
    no_items_found: 'No items found',
    order_history: 'Order History 订单记录',
    no_orders_yet: 'No orders yet',
    order_now: 'Order Now 去点餐',
    cash_collection_notice: '等待服务员收款。',
    total_label: 'Total',
    view_cart: 'View Cart',
    menu_tab: 'Menu 菜单',
    orders_tab: 'Orders 订单',
    cart_title: 'Cart 购物车',
    special_requests: 'Special Requests 备注',
    special_requests_placeholder: 'e.g. No spicy, less oil... (不要辣，少油)',
    subtotal: 'Subtotal 小计',
    service_charge: 'Service Charge',
    total_amount: 'Total 合计',
    checkout: 'Checkout 去支付',
    cashier: 'Cashier 收银台',
    amount_to_pay: 'Total Amount 应付金额',
    select_payment_method: 'Select Payment Method 选择支付方式',
    cash_payment: 'Cash 现金支付',
    pay_at_counter: 'Pay at counter / table',
    e_wallet: 'E-Wallet',
    rmb_payment: 'RMB Payment',
    cash_payment_title: 'Cash Payment',
    prepare_cash: 'Please prepare your cash.',
    cash_amount_prompt: 'How much will you pay with?',
    cash_amount_placeholder: 'e.g. 1000',
    quick_amount_500: '₱500',
    quick_amount_1000: '₱1000',
    exact_amount: 'Exact',
    change_due: 'Change Due 找零',
    back_button: 'Back',
    confirm_cash: 'Confirm Cash',
    processing: 'Processing...',
    waiting_payment_confirmation: 'Waiting for payment confirmation',
    scan_to_pay: 'Scan to Pay',
    use_app: 'Use your {method} app',
    simulate_success: 'Simulate Success (Dev)',
    all_categories: '全部 All',
    simulated_api_qr: 'Simulated API QR',
    total: 'Total 合计',
    service_charge_with_rate: 'Service Charge ({rate}%)',
    cash: 'Cash 现金支付',
    e_wallet_label: 'E-Wallet',
    rmb_payment_label: 'RMB Payment',
    back: 'Back',
    exact: 'Exact',
    reference_price: '参考价 Ref',
    default_store_name: '江西酒店 (Jinjiang Star Hotel)',
    order_detail_title: '订单详情',
    order_items: '订单项目',
    close: '关闭',
    alipay: '支付宝',
    wechat_pay: '微信支付',
    view_details: '查看详情',
    recommended_for_you: '为你推荐',
    print_receipt: '打印收据',
    order_id: '订单号',
    table_number: '桌号',
    order_time: '下单时间',
    status: '状态',
    payment_method: '支付方式',
    item: '项目',
    amount: '金额',
    thank_you_message: '谢谢惠顾，欢迎再次光临！',
    revenue: '收入',
  },

  en: {
    // Navigation
    dashboard: 'Dashboard',
    menu: 'Menu Management',
    orders: 'Order Center',
    finance: 'Financial Management',
    inventory: 'Inventory Management',
    settings: 'System Settings',
    ktv: 'KTV Rooms',
    signbill: 'Sign Bill',
    hotel: 'Hotel Room Service',
    qrcode: 'QR Code Management',
    kitchen: 'Kitchen Display',
    customer: 'Customer Order',
    car: 'Car Service',
    permissions: 'Permission Management',

    // Common actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',

    // Status messages
    loading: 'Loading...',
    success: 'Operation successful',
    error: 'Operation failed',
    confirm: 'Confirm action',
    processing_payment: 'Processing payment...',

    // Form labels
    name: 'Name',
    description: 'Description',
    price: 'Price',
    quantity: 'Quantity',
    category: 'Category',

    // Validation messages
    required: 'This field is required',
    invalidFormat: 'Invalid format',

    // Time related
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',

    // Accessibility labels
    bottom_navigation: 'Bottom navigation',
    unread_orders: 'Unread orders',
    quantity_controls: 'Quantity controls',
    quantity_controls_for: 'Quantity controls for',
    decrease_quantity: 'Decrease quantity of',
    increase_quantity: 'Increase quantity of',
    add_to_cart: 'Add to cart',
    close_cart: 'Close cart',
    back_to_cart: 'Back to cart',

    // Customer Order Page
    language_toggle: 'English',
    pending_status: 'Pending',
    cooking_status: 'Cooking',
    served_status: 'Served',
    paid_status: 'Paid',
    search_placeholder: 'Search food...',
    no_items_found: 'No items found',
    order_history: 'Order History',
    no_orders_yet: 'No orders yet',
    order_now: 'Order Now',
    cash_collection_notice: 'Wait for staff to collect cash.',
    total_label: 'Total',
    view_cart: 'View Cart',
    menu_tab: 'Menu',
    orders_tab: 'Orders',
    cart_title: 'Cart',
    special_requests: 'Special Requests',
    special_requests_placeholder: 'e.g. No spicy, less oil...',
    subtotal: 'Subtotal',
    service_charge: 'Service Charge',
    total_amount: 'Total',
    checkout: 'Checkout',
    cashier: 'Cashier',
    amount_to_pay: 'Total Amount',
    select_payment_method: 'Select Payment Method',
    cash_payment: 'Cash',
    pay_at_counter: 'Pay at counter / table',
    e_wallet: 'E-Wallet',
    rmb_payment: 'RMB Payment',
    cash_payment_title: 'Cash Payment',
    prepare_cash: 'Please prepare your cash.',
    cash_amount_prompt: 'How much will you pay with?',
    cash_amount_placeholder: 'e.g. 1000',
    quick_amount_500: '₱500',
    quick_amount_1000: '₱1000',
    exact_amount: 'Exact',
    change_due: 'Change Due',
    back_button: 'Back',
    confirm_cash: 'Confirm Cash',
    processing: 'Processing...',
    waiting_payment_confirmation: 'Waiting for payment confirmation',
    scan_to_pay: 'Scan to Pay',
    use_app: 'Use your {method} app',
    simulate_success: 'Simulate Success (Dev)',
    all_categories: 'All',
    alipay: 'Alipay',
    wechat_pay: 'WeChat Pay',
    reference_price: 'Ref Price',
    default_store_name: 'Jinjiang Star Hotel',
    order_detail_title: 'Order Details',
    order_items: 'Order Items',
    close: 'Close',
    view_details: 'View Details',
    recommended_for_you: 'Recommended for You',
    print_receipt: 'Print Receipt',
    order_id: 'Order ID',
    table_number: 'Table Number',
    order_time: 'Order Time',
    status: 'Status',
    payment_method: 'Payment Method',
    item: 'Item',
    amount: 'Amount',
    thank_you_message: 'Thank you! Please come again!',
    revenue: 'Revenue',
  },
  fil: {
    // Navigation
    dashboard: 'Dashboard',
    menu: 'Pamamahala ng Menu',
    orders: 'Sentro ng Order',
    finance: 'Pamamahala sa Pananalapi',
    inventory: 'Imbentaryo',
    settings: 'Mga Setting ng Sistema',
    ktv: 'Silid ng KTV',
    signbill: 'Mag-sign ng Bill',
    hotel: 'Serbisyo sa Kuwarto ng Hotel',
    qrcode: 'Pamamahala ng QR Code',
    kitchen: 'Display ng Kusina',
    customer: 'Order ng Customer',
    car: 'Serbisyo sa Sasakyan',
    permissions: 'Pamamahala ng Pahintulot',

    // Common actions
    save: 'I-save',
    cancel: 'Ikansela',
    delete: 'Tanggalin',
    edit: 'I-edit',
    add: 'Magdagdag',
    search: 'Maghanap',
    filter: 'Salain',

    // Status messages
    loading: 'Naglo-load...',
    success: 'Matagumpay ang operasyon',
    error: 'Nabigo ang operasyon',
    confirm: 'Kumpirmahin ang aksyon',
    processing_payment: 'Pinoproseso ang pagbabayad...',

    // Form labels
    name: 'Pangalan',
    description: 'Paglalarawan',
    price: 'Presyo',
    quantity: 'Dami',
    category: 'Kategorya',

    // Validation messages
    required: 'Kinakailangan ang field na ito',
    invalidFormat: 'Di-wasto ang format',

    // Time related
    today: 'Ngayon',
    yesterday: 'Kahapon',
    thisWeek: 'Ngayong Linggo',
    thisMonth: 'Ngayong Buwan',

    // Accessibility labels
    bottom_navigation: 'Navigation sa ibaba',
    unread_orders: 'Mga hindi nabasang order',
    quantity_controls: 'Mga kontrol ng dami',
    quantity_controls_for: 'Mga kontrol ng dami para sa',
    decrease_quantity: 'Bawasan ang dami ng',
    increase_quantity: 'Dagdagan ang dami ng',
    add_to_cart: 'Idagdag sa cart',
    close_cart: 'Isara ang cart',
    back_to_cart: 'Bumalik sa cart',

    // Customer Order Page
    language_toggle: 'Fil',
    pending_status: 'Naghihintay',
    cooking_status: 'Nagluluto',
    served_status: 'Nai-serve na',
    paid_status: 'Nabayaran',
    search_placeholder: 'Maghanap ng pagkain...',
    no_items_found: 'Walang nakitang mga item',
    order_history: 'Kasaysayan ng Order',
    no_orders_yet: 'Wala pang mga order',
    order_now: 'Mag-order Ngayon',
    cash_collection_notice: 'Hintaying makolekta ng staff ang cash.',
    total_label: 'Kabuuan',
    view_cart: 'Tingnan ang Cart',
    menu_tab: 'Menu',
    orders_tab: 'Mga Order',
    cart_title: 'Cart',
    special_requests: 'Mga Espesyal na Kahilingan',
    special_requests_placeholder:
      'hal. Walang maanghang, kaunti lang ang mantika...',
    subtotal: 'Subtotal',
    service_charge: 'Bayad sa Serbisyo',
    total_amount: 'Kabuuang Halaga',
    checkout: 'Mag-checkout',
    cashier: 'Cashier',
    amount_to_pay: 'Kabuuang Halaga',
    select_payment_method: 'Pumili ng Paraan ng Pagbabayad',
    cash_payment: 'Cash',
    pay_at_counter: 'Magbayad sa counter / mesa',
    e_wallet: 'E-Wallet',
    rmb_payment: 'Pagbabayad sa RMB',
    cash_payment_title: 'Pagbabayad sa Cash',
    prepare_cash: 'Mangyaring ihanda ang iyong cash.',
    cash_amount_prompt: 'Magkano ang ibabayad mo?',
    cash_amount_placeholder: 'hal. 1000',
    quick_amount_500: '₱500',
    quick_amount_1000: '₱1000',
    exact_amount: 'Eksakto',
    change_due: 'Sukli',
    back_button: 'Bumalik',
    confirm_cash: 'Kumpirmahin ang Cash',
    processing: 'Pinoproseso...',
    waiting_payment_confirmation: 'Naghihintay ng kumpirmasyon ng pagbabayad',
    scan_to_pay: 'I-scan para Magbayad',
    use_app: 'Gamitin ang iyong {method} app',
    simulate_success: 'I-simulate ang Tagumpay (Dev)',
    all_categories: 'Lahat',
    simulated_api_qr: 'Simulated na API QR',
    total: 'Kabuuan',
    service_charge_with_rate: 'Bayad sa Serbisyo ({rate}%)',
    cash_label: 'Cash',
    e_wallet_label: 'E-Wallet',
    rmb_payment_label: 'Pagbabayad sa RMB',
    back: 'Bumalik',
    exact: 'Eksakto',
    alipay: 'Alipay',
    wechat_pay: 'WeChat Pay',
    reference_price: 'Reference Price',
    default_store_name: 'Jinjiang Star Hotel',
    order_detail_title: 'Detalye ng Order',
    order_items: 'Mga Item ng Order',
    close: 'Isara',
    view_details: 'Tingnan ang Detalye',
    recommended_for_you: 'Inirerekomenda para sa Iyo',
    print_receipt: 'I-print ang Resibo',
    order_id: 'Order ID',
    table_number: 'Numero ng Mesa',
    order_time: 'Oras ng Order',
    status: 'Katayuan',
    payment_method: 'Paraan ng Pagbabayad',
    item: 'Item',
    amount: 'Halaga',
    thank_you_message: 'Salamat! Mangyaring bumalik muli!',
    revenue: 'Kita',
  },
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
  let translation: string | TranslationDictionary | undefined =
    translations[language];

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
export const formatCurrency = (
  amount: number,
  currency: string = 'PHP'
): string => {
  // For Philippine Peso
  if (currency === 'PHP') {
    return `₱${amount.toFixed(2)}`;
  }

  // Default formatting
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
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
      minute: '2-digit',
    });
  }

  if (lang === 'fil') {
    return dateObj.toLocaleDateString('fil-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
