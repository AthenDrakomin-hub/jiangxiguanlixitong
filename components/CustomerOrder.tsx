import React, { useState, useEffect, useMemo } from 'react';
import useDebounce from '../hooks/useDebounce';
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  ChevronRight,
  UtensilsCrossed,
  MapPin,
  Search,
  History,
  Receipt,
  Home,
  Banknote,
  Smartphone,
  QrCode,
  Wallet,
  ArrowLeft,
  Wifi,
  Phone,
  Send,
  Loader2,
  Eye,
} from 'lucide-react';
import {
  Dish,
  Order,
  OrderStatus,
  PaymentMethod,
  SystemSettings,
} from '../types.js';
import { setLanguage, t, LANGUAGE_COOKIE_NAME } from '../utils/i18n.js';
import { getCookie, setCookie } from '../utils/cookie.js';
import ImageLazyLoad from './ImageLazyLoad';
import OrderDetail from './OrderDetail';
import { apiClient } from '../services/apiClient.js';
import { auditLogger } from '../services/auditLogger.js';

interface CustomerOrderProps {
  dishes: Dish[];
  orders: Order[]; // Passed down to check history
  onPlaceOrder: (order: Order) => void;
  systemSettings?: SystemSettings;
}

const CustomerOrder: React.FC<CustomerOrderProps> = ({
  dishes = [],
  orders = [],
  onPlaceOrder,
  systemSettings,
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'MENU' | 'ORDERS'>('MENU');

  // Menu State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ dish: Dish; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebounce(searchInput, 300);
  const [notes, setNotes] = useState('');

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [cashAmountTendered, setCashAmountTendered] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Location State
  const [tableId, setTableId] = useState('');

  // Language State
  const [currentLang, setCurrentLang] = useState<'zh-CN' | 'fil'>('zh-CN');

  // Helper function to get dish name based on current language
  const getDishDisplayName = (dish: Dish): string => {
    // If name_en exists and current language is not Chinese, show English name
    if (dish.name_en && currentLang !== 'zh-CN') {
      return `${dish.name} / ${dish.name_en}`;
    }
    // Otherwise, show Chinese name
    return dish.name;
  };

  // Order Detail State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Print receipt function
  const printReceipt = (order: Order) => {
    // Create a hidden iframe for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate HTML content for the receipt
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('print_receipt')}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
          }
          .receipt-header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .receipt-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .order-info {
            margin-bottom: 10px;
          }
          .order-info div {
            margin-bottom: 3px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .items-table th,
          .items-table td {
            text-align: left;
            padding: 3px 0;
            border-bottom: 1px dashed #000;
          }
          .items-table th {
            font-weight: bold;
          }
          .total-section {
            border-top: 1px dashed #000;
            padding-top: 5px;
            font-weight: bold;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .mb-1 { margin-bottom: 5px; }
          .mt-1 { margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          <div class="receipt-title">${storeName}</div>
          <div>${t('order_detail_title')}</div>
        </div>
        
        <div class="order-info">
          <div><strong>${t('order_id')}:</strong> ${order.id}</div>
          <div><strong>${t('table_number')}:</strong> ${order.tableNumber}</div>
          <div><strong>${t('order_time')}:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
          <div><strong>${t('status')}:</strong> ${order.status}</div>
          ${order.paymentMethod ? `<div><strong>${t('payment_method')}:</strong> ${order.paymentMethod}</div>` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>${t('item')}</th>
              <th class="text-right">${t('quantity')}</th>
              <th class="text-right">${t('price')}</th>
              <th class="text-right">${t('amount')}</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.dishName}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">₱${item.price.toFixed(2)}</td>
                <td class="text-right">₱${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        
        ${
          order.notes
            ? `
          <div class="mb-1">
            <strong>${t('special_requests')}:</strong>
            <div>${order.notes}</div>
          </div>
        `
            : ''
        }
        
        <div class="total-section">
          <div class="text-right">
            <strong>${t('total_amount')}: ₱${order.totalAmount.toFixed(2)}</strong>
          </div>
        </div>
        
        <div class="text-center mt-1">
          ${t('thank_you_message')}
        </div>
      </body>
      </html>
    `;
    
    // Use document.open/write/close pattern for security
    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Note: We don't close the window immediately to allow for proper printing
    };
  };

  // Loading State
  const [loadingText, setLoadingText] = useState('加载中...');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Settings
  const storeInfo = systemSettings?.storeInfo;
  const storeName = storeInfo?.name || t('default_store_name');
  const exchangeRate = systemSettings?.exchangeRate || 8.2;
  const serviceChargeRate = systemSettings?.serviceChargeRate || 0.1;

  // H5 Page Settings
  // 产品备注: 为h5PageSettings指定明确的类型，避免使用any
  const h5PageSettings = useMemo<SystemSettings['h5PageSettings']>(() => {
    return (
      systemSettings?.h5PageSettings || {
        enableCustomStyling: true,
        customHeaderColor: '#4F46E5',
        customButtonColor: '#DC2626',
        showStoreInfo: true,
        showWiFiInfo: true,
      }
    );
  }, [systemSettings?.h5PageSettings]);

  // Dynamic categories from settings
  const categories = ['All', ...(systemSettings?.categories || [])];

  // Default payment settings if not configured
  const paymentConfig = systemSettings?.payment || {
    enabledMethods: ['CASH'],
    aliPayEnabled: false,
    weChatEnabled: false,
    gCashEnabled: true,
    mayaEnabled: true,
  };

  // Apply custom styles if enabled
  useEffect(() => {
    let styleElement: HTMLStyleElement | null = null;

    if (h5PageSettings?.enableCustomStyling) {
      styleElement = document.createElement('style');
      styleElement.id = 'customer-order-custom-styles'; // Add ID for easier removal
      styleElement.innerHTML = `
        .custom-header {
          background-color: ${h5PageSettings.customHeaderColor} !important;
        }
        .custom-button {
          background-color: ${h5PageSettings.customButtonColor} !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    // 返回清理函数
    return () => {
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [h5PageSettings]);

  // Initialize from URL Params or Cookie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const langParam = params.get('lang');

    // Check for language preference in cookie
    const cookieLang = getCookie(LANGUAGE_COOKIE_NAME);

    // Set language priority: URL param > Cookie > Default
    let initialLang: 'zh-CN' | 'fil' = 'zh-CN';

    if (langParam === 'fil' || langParam === 'zh-CN') {
      initialLang = langParam as 'zh-CN' | 'fil';
    } else if (cookieLang === 'fil' || cookieLang === 'zh-CN') {
      initialLang = cookieLang as 'zh-CN' | 'fil';
    }

    setCurrentLang(initialLang);
    setLanguage(initialLang);

    // Set table ID if provided
    if (idParam) {
      setTableId(idParam);
    } else {
      // Default to lobby if no ID provided
      setTableId('LOBBY');
    }
  }, []);

  // Filter dishes by category and search term
  const displayedDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesCategory =
        activeCategory === 'All' || dish.category === activeCategory;
      const matchesSearch =
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dish.name_en && dish.name_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [dishes, activeCategory, searchTerm]);

  // Handle keyboard navigation for dishes
  const handleDishKeyDown = (e: React.KeyboardEvent, dish: Dish) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addToCart(dish);
    }
  };

  // Handle keyboard navigation for cart items
  const handleCartItemKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      removeFromCart(itemId);
    }
  };

  // Handle keyboard navigation for tabs
  const handleTabKeyDown = (e: React.KeyboardEvent, tab: 'MENU' | 'ORDERS') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  // Cart calculations
  const totalCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const subTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0),
    [cart]
  );
  const serviceCharge = useMemo(
    () => subTotal * serviceChargeRate,
    [subTotal, serviceChargeRate]
  );
  const totalAmount = useMemo(
    () => subTotal + serviceCharge,
    [subTotal, serviceCharge]
  );

  // My Orders (filtered by tableId)
  const myOrders = useMemo(() => {
    return orders
      .filter((order) => order.tableNumber === tableId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [orders, tableId]);

  // Recommended dishes based on order history
  const recommendedDishes = useMemo(() => {
    if (myOrders.length === 0 || dishes.length === 0) return [];

    // Count dish frequencies
    const dishCount: Record<string, number> = {};
    myOrders.forEach((order) => {
      order.items.forEach((item) => {
        dishCount[item.dishId] = (dishCount[item.dishId] || 0) + item.quantity;
      });
    });

    // Sort dishes by frequency and get top 5
    const sortedDishes = Object.entries(dishCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([dishId]) => dishes.find((dish) => dish.id === dishId))
      .filter(Boolean) as Dish[];

    return sortedDishes;
  }, [myOrders, dishes]);

  // Sales statistics
  const salesStats = useMemo(() => {
    if (myOrders.length === 0) return null;

    // Calculate today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Initialize stats
    const stats = {
      today: { orders: 0, revenue: 0 },
      yesterday: { orders: 0, revenue: 0 },
      total: { orders: myOrders.length, revenue: 0 },
    };

    // Calculate stats
    myOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);

      // Add to total revenue
      stats.total.revenue += order.totalAmount;

      // Check if order is from today
      if (orderDate.getTime() === today.getTime()) {
        stats.today.orders += 1;
        stats.today.revenue += order.totalAmount;
      }

      // Check if order is from yesterday
      if (orderDate.getTime() === yesterday.getTime()) {
        stats.yesterday.orders += 1;
        stats.yesterday.revenue += order.totalAmount;
      }
    });

    return stats;
  }, [myOrders]);

  // Add item to cart
  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.dish.id === dish.id);
      if (existingItem) {
        return prev.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { dish, quantity: 1 }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (dishId: string) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.dish.id === dishId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) =>
          item.dish.id === dishId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter((item) => item.dish.id !== dishId);
      }
    });
  };

  // Initiate checkout process
  const handleInitiateCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setIsPaymentModalOpen(true);
  };

  // Confirm payment and place order
  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) return;

    setIsProcessingPayment(true);
    setLoadingText(t('processing_payment'));
    setError(null);

    try {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        tableNumber: tableId,
        source: /^8[23]\d{2}$/.test(tableId) ? 'ROOM_SERVICE' : 'LOBBY',
        items: cart.map((item) => ({
          dishId: item.dish.id,
          dishName: getDishDisplayName(item.dish),
          quantity: item.quantity,
          price: item.dish.price,
        })),
        status: OrderStatus.PENDING,
        totalAmount: totalAmount,
        paymentMethod: selectedPaymentMethod,
        createdAt: new Date().toISOString(),
        notes: notes || '',
      };

      // 创建订单
      await apiClient.create('orders', newOrder);
      onPlaceOrder(newOrder);

      // 记录日志
      auditLogger.log(
        'info',
        'CUSTOMER_ORDER',
        `H5点餐: ${tableId} - ${selectedPaymentMethod} - ₱${totalAmount.toFixed(2)}`,
        'customer'
      );

      // 自动打印到收银台/厨房（不是客户端打印）
      try {
        // 调用后台打印 API，使用已配置的打印机（云打印或浏览器打印）
        await fetch('/api/print-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newOrder }),
        });
        console.log('[CustomerOrder] 订单已发送到打印队列');
      } catch (printError) {
        // 打印失败不影响订单提交
        console.warn('[CustomerOrder] 打印失败，但订单已成功创建:', printError);
      }

      // Post message to React Native WebView if available
      const webView = (window as any).ReactNativeWebView as { postMessage: (message: string) => void } | undefined;
      if (
        typeof window !== 'undefined' &&
        webView
      ) {
        webView.postMessage(
          JSON.stringify({
            type: 'NEW_ORDER',
            order: newOrder,
          })
        );
      }

      // Reset cart and payment state
      setCart([]);
      setIsPaymentModalOpen(false);
      setSelectedPaymentMethod(null);
      setCashAmountTendered('');
      setNotes('');

      // 显示成功消息
      setSuccess(t('order_placed_successfully') || '订单提交成功！');
      setTimeout(() => setSuccess(null), 3000);

      // Switch to history tab
      setActiveTab('ORDERS');
    } catch (error) {
      console.error('Failed to process payment:', error);
      setError(t('error') || '订单提交失败，请重试');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = currentLang === 'zh-CN' ? 'fil' : 'zh-CN';
    setCurrentLang(newLang);
    setLanguage(newLang);
    // Save language preference to cookie
    setCookie(LANGUAGE_COOKIE_NAME, newLang, 30);
  };

  // Render status badge
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return (
          <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600">
            {t('pending_status')}
          </span>
        );
      case OrderStatus.COOKING:
        return (
          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">
            {t('cooking_status')}
          </span>
        );
      case OrderStatus.SERVED:
        return (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-600">
            {t('served_status')}
          </span>
        );
      case OrderStatus.PAID:
        return (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-600">
            {t('paid_status')}
          </span>
        );
      default:
        return (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="fade-in relative mx-auto min-h-screen max-w-md overflow-hidden bg-slate-50 pb-24 font-sans shadow-2xl">
      {/* Error Message */}
      {error && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 transform rounded-lg border border-red-200 bg-red-50 px-6 py-3 text-red-700 shadow-lg">
          <div className="flex items-center gap-2">
            <X size={18} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 transform rounded-lg border border-green-200 bg-green-50 px-6 py-3 text-green-700 shadow-lg">
          <div className="flex items-center gap-2">
            <Receipt size={18} />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-2xl">
            <Loader2 className="animate-spin text-red-600" size={32} />
            <p className="font-medium text-slate-700">{loadingText}</p>
          </div>
        </div>
      )}

      {/* Language Toggle Button */}
      <button
        onClick={toggleLanguage}
        className="absolute right-4 top-4 z-30 flex items-center gap-1 rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm"
      >
        {t('language_toggle')}{' '}
      </button>

      {/* Top Banner (Only on Menu Tab) */}
      {activeTab === 'MENU' && (
        <div
          className={`relative shrink-0 pb-6 ${h5PageSettings?.enableCustomStyling ? 'custom-header' : 'bg-slate-800'}`}
        >
          <div className="absolute inset-0 overflow-hidden opacity-60">
            <ImageLazyLoad
              src={
                storeInfo?.bannerImageUrl ||
                'https://picsum.photos/800/400?random=restaurant'
              }
              alt="Restaurant Banner"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>

          <div className="relative z-10 p-5 pt-8 text-white">
            <h1 className="mb-3 text-xl font-bold leading-tight shadow-sm">
              {storeName}
            </h1>
            {h5PageSettings?.showStoreInfo && (
              <div className="space-y-1.5 text-xs opacity-90">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-red-400" />
                  <span>{storeInfo?.address}</span>
                  {storeInfo?.mapUrl && (
                    <a
                      href={storeInfo.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      [地图]
                    </a>
                  )}
                </div>
                {h5PageSettings?.showWiFiInfo && storeInfo?.wifiSsid && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Wifi size={14} className="text-blue-400" />
                      <span>WiFi: {storeInfo.wifiSsid}</span>
                    </div>
                    {storeInfo.wifiPassword && (
                      <span>Pass: {storeInfo.wifiPassword}</span>
                    )}
                    <button
                      onClick={() => {
                        const wifiInfo = `WiFi: ${storeInfo.wifiSsid}${storeInfo.wifiPassword ? `, Pass: ${storeInfo.wifiPassword}` : ''}`;
                        navigator.clipboard.writeText(wifiInfo).then(() => {
                          setSuccess('WiFi信息已复制到剪贴板');
                          setTimeout(() => setSuccess(null), 2000);
                        });
                      }}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      [复制]
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {storeInfo?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-green-400" />
                      <a
                        href={`tel:${storeInfo.phone}`}
                        className="hover:text-green-600"
                      >
                        {storeInfo.phone}
                      </a>
                    </div>
                  )}
                  {storeInfo?.telegram && (
                    <div className="flex items-center gap-2">
                      <Send size={14} className="text-sky-400" />
                      <a
                        href={`https://t.me/${storeInfo.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-sky-600"
                      >
                        {storeInfo.telegram}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Table ID Badge */}
          <div className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            <MapPin size={12} /> {tableId}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 overflow-y-auto ${activeTab === 'MENU' ? 'relative z-10 -mt-4 rounded-t-2xl bg-slate-50' : 'pt-4'}`}
      >
        {/* MENU TAB CONTENT */}
        {activeTab === 'MENU' && (
          <>
            {/* Search & Categories */}
            <div className="slide-in-left sticky top-0 z-20 bg-slate-50 px-4 pb-2 pt-4 shadow-sm">
              <div className="relative mb-3">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="transition-smooth w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Recommended Dishes */}
              {recommendedDishes.length > 0 && (
                <div className="slide-in-left mb-4 delay-75">
                  <h3 className="mb-2 text-sm font-bold text-slate-700">
                    {t('recommended_for_you')}
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {recommendedDishes.map((dish) => (
                      <button
                        key={dish.id}
                        onClick={() => {
                          setActiveCategory(dish.category);
                          setSearchInput(dish.name);
                        }}
                        className="card-hover flex flex-shrink-0 flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                          <span className="truncate px-1 text-xs font-bold text-slate-600">
                            {getDishDisplayName(dish).substring(0, 8)}
                          </span>
                        </div>
                        <span className="w-16 truncate text-xs text-slate-500">
                          ₱{dish.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="scrollbar-hide slide-in-left flex gap-2 overflow-x-auto pb-2 delay-100">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    // 产品备注: 为setActiveCategory参数指定明确的类型，避免使用any
                    onClick={() => setActiveCategory(cat as string)}
                    className={`btn-primary whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold shadow-sm transition-all ${
                      activeCategory === cat
                        ? h5PageSettings?.enableCustomStyling
                          ? 'custom-button shadow-custom scale-105 text-white'
                          : 'scale-105 bg-red-600 text-white shadow-red-200'
                        : 'border border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {cat === 'All' ? t('all_categories') : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Dish List */}
            <div className="fade-in min-h-[50vh] space-y-4 p-4 delay-150">
              {displayedDishes.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center text-sm text-slate-400">
                  <UtensilsCrossed size={32} className="mb-2 opacity-50" />
                  <span>{t('no_items_found')}</span>
                </div>
              ) : (
                displayedDishes.map((dish) => {
                  const inCartQty =
                    cart.find((i) => i.dish.id === dish.id)?.quantity || 0;
                  return (
                    <div
                      key={dish.id}
                      className="card-hover flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                      role="article"
                      aria-labelledby={`dish-name-${dish.id}`}
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <ImageLazyLoad
                          src={dish.imageUrl || '/placeholder-image.jpg'}
                          alt={dish.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                        <div>
                          <h3
                            id={`dish-name-${dish.id}`}
                            className="truncate text-sm font-bold text-slate-800"
                          >
                            {getDishDisplayName(dish)}
                          </h3>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
                            {dish.description}
                          </p>
                        </div>
                        <div className="mt-1 flex items-end justify-between">
                          <div>
                            <div className="text-lg font-bold text-red-600">
                              ₱{dish.price}
                            </div>
                            <div className="text--[10px] text-slate-400">
                              {t('reference_price')}: ¥
                              {(dish.price / exchangeRate).toFixed(0)}
                            </div>
                          </div>
                          {inCartQty > 0 ? (
                            <div
                              className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-1 py-1 shadow-inner"
                              role="group"
                              aria-label={t('quantity_controls')}
                            >
                              <button
                                onClick={() => removeFromCart(dish.id)}
                                onKeyDown={(e) => handleDishKeyDown(e, dish)}
                                className="btn-primary flex h-7 w-7 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-600 shadow-sm transition-transform active:scale-90"
                                aria-label={`${t('decrease_quantity')} ${dish.name}`}
                              >
                                <Minus size={14} />
                              </button>
                              <span
                                className="min-w-[16px] text-center text-sm font-bold text-slate-800"
                                aria-live="polite"
                              >
                                {inCartQty}
                              </span>
                              <button
                                onClick={() => addToCart(dish)}
                                onKeyDown={(e) => handleDishKeyDown(e, dish)}
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm transition-transform active:scale-90 ${h5PageSettings?.enableCustomStyling ? 'custom-button' : 'bg-red-600'} btn-primary`}
                                aria-label={`${t('increase_quantity')} ${dish.name}`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(dish)}
                              onKeyDown={(e) => handleDishKeyDown(e, dish)}
                              className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors active:scale-90 ${h5PageSettings?.enableCustomStyling ? 'custom-button text-white hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'} btn-primary`}
                              aria-label={`${t('add_to_cart')} ${dish.name}`}
                            >
                              <Plus size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ORDERS TAB CONTENT */}
        {activeTab === 'ORDERS' && (
          <div className="fade-in space-y-4 p-4">
            <h2 className="slide-in-right mb-4 px-2 text-xl font-bold text-slate-800">
              {t('order_history')}
            </h2>

            {/* Sales Statistics */}
            {salesStats && (
              <div className="slide-in-right mb-4 grid grid-cols-3 gap-2 delay-75">
                <div className="card-hover rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <div className="mb-1 text-xs text-slate-500">
                    {t('today')}
                  </div>
                  <div className="font-bold text-slate-800">
                    {salesStats.today.orders}
                  </div>
                  <div className="text-xs text-slate-500">{t('orders')}</div>
                </div>
                <div className="card-hover rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <div className="mb-1 text-xs text-slate-500">
                    {t('yesterday')}
                  </div>
                  <div className="font-bold text-slate-800">
                    {salesStats.yesterday.orders}
                  </div>
                  <div className="text-xs text-slate-500">{t('orders')}</div>
                </div>
                <div className="card-hover rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <div className="mb-1 text-xs text-slate-500">
                    {t('total')}
                  </div>
                  <div className="font-bold text-slate-800">
                    {salesStats.total.orders}
                  </div>
                  <div className="text-xs text-slate-500">{t('orders')}</div>
                </div>
                <div className="card-hover rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <div className="mb-1 text-xs text-slate-500">
                    {t('today')}
                  </div>
                  <div className="font-bold text-slate-800">
                    ₱{salesStats.today.revenue.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-500">{t('revenue')}</div>
                </div>
                <div className="card-hover rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <div className="mb-1 text-xs text-slate-500">
                    {t('yesterday')}
                  </div>
                  <div className="font-bold text-slate-800">
                    ₱{salesStats.yesterday.revenue.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-500">{t('revenue')}</div>
                </div>
                <div className="card-hover rounded-lg border border-slate-100 bg-white p-3 text-center shadow-sm">
                  <div className="mb-1 text-xs text-slate-500">
                    {t('total')}
                  </div>
                  <div className="font-bold text-slate-800">
                    ₱{salesStats.total.revenue.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-500">{t('revenue')}</div>
                </div>
              </div>
            )}
            {myOrders.length === 0 ? (
              <div className="slide-in-right rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-400 delay-100">
                <History size={48} className="mx-auto mb-3 opacity-30" />
                <p>{t('no_orders_yet')}</p>
                <button
                  onClick={() => setActiveTab('MENU')}
                  className="btn-primary mt-4 text-sm font-bold text-red-600"
                >
                  {t('order_now')}
                </button>
              </div>
            ) : (
              myOrders.map((order) => (
                <div
                  key={order.id}
                  className="card-hover slide-in-right overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm delay-150"
                >
                  <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 p-4">
                    <span className="font-mono text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                    {renderStatusBadge(order.status)}
                  </div>
                  <div className="space-y-2 p-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          x{item.quantity} {item.dishName}
                        </span>
                        <span className="text-slate-500">
                          ₱{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                    {order.paymentMethod === 'CASH' &&
                      order.status === OrderStatus.PENDING && (
                        <div className="mt-2 rounded bg-yellow-50 p-2 text-xs text-yellow-800">
                          {t('cash_collection_notice')}
                        </div>
                      )}
                    <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-3">
                      <span className="text-sm font-bold text-slate-600">
                        {t('total_label')}
                      </span>
                      <span className="text-lg font-bold text-slate-800">
                        ₱{order.totalAmount}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-slate-50 bg-slate-50/50 p-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn-primary flex w-full items-center justify-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      <Eye size={16} />
                      {t('view_details')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Cart Bar (Only Menu Tab) */}
      {activeTab === 'MENU' &&
        cart.length > 0 &&
        !isCartOpen &&
        !isPaymentModalOpen && (
          <div className="fixed bottom-24 left-4 right-4 z-30 mx-auto max-w-md">
            <button
              onClick={() => setIsCartOpen(true)}
              className={`bounce-soft flex w-full items-center justify-between rounded-2xl border border-white/10 p-4 text-white shadow-2xl backdrop-blur transition-transform active:scale-[0.98] ${h5PageSettings?.enableCustomStyling ? 'custom-button' : 'bg-slate-900/95'} btn-primary`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ShoppingBag size={24} />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-red-500 text-[10px] font-bold text-white">
                    {totalCount}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold">
                    ₱{totalAmount.toFixed(0)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                {t('view_cart')} <ChevronRight size={16} />
              </div>
            </button>
          </div>
        )}

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex max-w-md justify-around border-t border-slate-200 bg-white p-2"
        role="navigation"
        aria-label={t('bottom_navigation')}
      >
        <button
          onClick={() => setActiveTab('MENU')}
          onKeyDown={(e) => handleTabKeyDown(e, 'MENU')}
          className={`flex w-full flex-col items-center justify-center rounded-xl py-2 transition-colors ${activeTab === 'MENU' ? 'bg-red-50 text-red-600' : 'text-slate-400'}`}
          aria-selected={activeTab === 'MENU'}
          role="tab"
        >
          <Home size={24} />
          <span className="mt-1 text-[10px] font-bold">{t('menu_tab')}</span>
        </button>
        <button
          onClick={() => setActiveTab('ORDERS')}
          onKeyDown={(e) => handleTabKeyDown(e, 'ORDERS')}
          className={`flex w-full flex-col items-center justify-center rounded-xl py-2 transition-colors ${activeTab === 'ORDERS' ? 'bg-red-50 text-red-600' : 'text-slate-400'}`}
          aria-selected={activeTab === 'ORDERS'}
          role="tab"
        >
          <Receipt size={24} />
          <span className="mt-1 text-[10px] font-bold">{t('orders_tab')}</span>
          {myOrders.length > 0 && activeTab !== 'ORDERS' && (
            <span
              className="absolute right-[20%] top-2 h-2 w-2 rounded-full bg-red-500"
              aria-label={t('unread_orders')}
            ></span>
          )}
        </button>
      </div>

      {/* Cart Bottom Sheet */}
      {isCartOpen && !isPaymentModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 duration-200 sm:items-center sm:p-4">
          <div className="animate-in slide-in-from-bottom-10 slide-in-up flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white duration-300 sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 p-5 backdrop-blur">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <ShoppingBag size={20} className="text-red-600" />
                {t('cart_title')}
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition-colors hover:bg-slate-100"
                aria-label={t('close_cart')}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border-b border-slate-50 last:border-0 pb-4 last:pb-0 slide-in-left delay-{idx*50}"
                  role="listitem"
                >
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">
                      {getDishDisplayName(item.dish)}
                    </div>
                    <div className="text-xs text-slate-400">
                      ₱{item.dish.price}
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-3 rounded-lg bg-slate-50 p-1"
                    role="group"
                    aria-label={`${t('quantity_controls_for')} ${item.dish.name}`}
                  >
                    <button
                      onClick={() => removeFromCart(item.dish.id)}
                      onKeyDown={(e) => handleCartItemKeyDown(e, item.dish.id)}
                      className="btn-primary flex h-8 w-8 items-center justify-center rounded bg-white text-slate-600 shadow-sm"
                      aria-label={`${t('decrease_quantity')} ${item.dish.name}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span
                      className="w-4 text-center font-bold text-slate-800"
                      aria-live="polite"
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item.dish)}
                      onKeyDown={(e) => handleCartItemKeyDown(e, item.dish.id)}
                      className={`flex h-8 w-8 items-center justify-center rounded shadow-sm ${h5PageSettings?.enableCustomStyling ? 'custom-button text-white' : 'bg-red-600 text-white'} btn-primary`}
                      aria-label={`${t('increase_quantity')} ${item.dish.name}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="w-16 text-right font-bold text-slate-800">
                    ₱{item.dish.price * item.quantity}
                  </div>
                </div>
              ))}

              {/* Notes Input */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                  {t('special_requests')}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('special_requests_placeholder')}
                  className="h-20 w-full resize-none rounded-xl border-0 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 p-6">
              <div className="mb-2 space-y-1">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{t('subtotal')}</span>
                  <span>₱{subTotal}</span>
                </div>
                {serviceChargeRate > 0 && (
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{t('service_charge')}</span>
                    <span>₱{serviceCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-800">
                  <span>{t('total')}</span>
                  <span>₱{totalAmount.toFixed(0)}</span>
                </div>
              </div>

              <button
                onClick={handleInitiateCheckout}
                disabled={cart.length === 0}
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-lg font-bold text-white shadow-xl shadow-red-200 transition-transform hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('checkout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Selection Modal */}
      {isPaymentModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/80 p-0 sm:items-center sm:p-4">
          <div className="animate-in slide-in-from-bottom-10 slide-in-up flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl">
            {/* Payment Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="-ml-2 p-2 text-slate-400 transition-colors hover:text-slate-600"
                aria-label={t('back_to_cart')}
              >
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-lg font-bold text-slate-800">
                {t('cashier')}
              </h3>
              <div className="w-8"></div>
            </div>

            {/* Payment Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Amount Display */}
              <div className="mb-8 text-center">
                <p className="mb-1 text-sm text-slate-500">
                  {t('total_amount')}
                </p>
                <div className="text-4xl font-bold text-slate-900">
                  ₱{totalAmount.toFixed(0)}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {t('reference_price')}: ≈ ¥
                  {(totalAmount / exchangeRate).toFixed(1)}
                </div>
              </div>

              {!selectedPaymentMethod ? (
                /* Method Selector */
                <div className="space-y-3">
                  <p className="mb-2 text-sm font-bold text-slate-700">
                    {t('select_payment_method')}
                  </p>

                  {/* Cash (Always Available) */}
                  <button
                    onClick={() => setSelectedPaymentMethod('CASH')}
                    className="card-hover group flex w-full items-center gap-4 rounded-xl border-2 border-slate-100 p-4 text-left transition-all hover:border-green-500 hover:bg-green-50"
                    aria-label={`${t('select_payment_method')} ${t('cash')}`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 transition-transform group-hover:scale-110">
                      <Banknote size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">
                        {t('cash')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {t('pay_at_counter')}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>

                  {/* GCash */}
                  {paymentConfig.gCashEnabled && (
                    <button
                      onClick={() => setSelectedPaymentMethod('GCASH')}
                      className="card-hover group flex w-full items-center gap-4 rounded-xl border-2 border-slate-100 p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50"
                      aria-label={`${t('select_payment_method')} GCash`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white transition-transform group-hover:scale-110">
                        <Wallet size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">GCash</div>
                        <div className="text-xs text-slate-400">
                          {t('e_wallet')}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </button>
                  )}

                  {/* Maya */}
                  {paymentConfig.mayaEnabled && (
                    <button
                      onClick={() => setSelectedPaymentMethod('MAYA')}
                      className="card-hover group flex w-full items-center gap-4 rounded-xl border-2 border-slate-100 p-4 text-left transition-all hover:border-green-500 hover:bg-green-50"
                      aria-label={`${t('select_payment_method')} Maya`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white transition-transform group-hover:scale-110">
                        <Wallet size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">Maya</div>
                        <div className="text-xs text-slate-400">
                          {t('e_wallet')}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </button>
                  )}

                  {/* Alipay */}
                  {paymentConfig.aliPayEnabled && (
                    <button
                      onClick={() => setSelectedPaymentMethod('ALIPAY')}
                      className="card-hover group flex w-full items-center gap-4 rounded-xl border-2 border-slate-100 p-4 text-left transition-all hover:border-blue-400 hover:bg-blue-50"
                      aria-label={`${t('select_payment_method')} Alipay`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                        <Smartphone size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">
                          Alipay {t('alipay')}
                        </div>
                        <div className="text-xs text-slate-400">
                          {t('rmb_payment')}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </button>
                  )}

                  {/* WeChat */}
                  {paymentConfig.weChatEnabled && (
                    <button
                      onClick={() => setSelectedPaymentMethod('WECHAT')}
                      className="card-hover group flex w-full items-center gap-4 rounded-xl border-2 border-slate-100 p-4 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50"
                      aria-label={`${t('select_payment_method')} WeChat Pay`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110">
                        <QrCode size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">
                          WeChat {t('wechat_pay')}
                        </div>
                        <div className="text-xs text-slate-400">
                          {t('rmb_payment')}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </button>
                  )}
                </div>
              ) : (
                /* Specific Method Process */
                <div className="animate-in fade-in slide-in-from-right-4">
                  {selectedPaymentMethod === 'CASH' ? (
                    <div className="space-y-6">
                      <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
                        <Banknote
                          className="mx-auto mb-2 text-green-600"
                          size={32}
                        />
                        <h4 className="font-bold text-green-800">
                          {t('cash_payment')}
                        </h4>
                        <p className="text-xs text-green-700">
                          {t('prepare_cash')}
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          {t('cash_amount_prompt')}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                            ₱
                          </span>
                          <input
                            type="number"
                            autoFocus
                            value={cashAmountTendered}
                            onChange={(e) =>
                              setCashAmountTendered(e.target.value)
                            }
                            className="w-full rounded-xl border-2 border-slate-200 py-4 pl-10 pr-4 text-2xl font-bold outline-none transition-all focus:border-green-500 focus:ring-4 focus:ring-green-100"
                            placeholder={t('cash_amount_placeholder')}
                          />
                        </div>
                        {/* Quick Amounts */}
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                          {[500, 1000].map((amt) => (
                            <button
                              key={amt}
                              onClick={() =>
                                setCashAmountTendered(amt.toString())
                              }
                              className="rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-slate-200"
                            >
                              ₱{amt}
                            </button>
                          ))}
                          <button
                            onClick={() =>
                              setCashAmountTendered(totalAmount.toFixed(0))
                            }
                            className="btn-primary rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-600 transition-colors hover:bg-slate-200"
                          >
                            {t('exact')}
                          </button>
                        </div>
                      </div>

                      {cashAmountTendered &&
                        !isNaN(parseFloat(cashAmountTendered)) && (
                          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                            <span className="font-medium text-slate-500">
                              {t('change_due')}
                            </span>
                            <span
                              className={`text-xl font-bold ${parseFloat(cashAmountTendered) >= totalAmount ? 'text-green-600' : 'text-red-500'}`}
                            >
                              ₱
                              {(
                                parseFloat(cashAmountTendered) - totalAmount
                              ).toFixed(0)}
                            </span>
                          </div>
                        )}

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setSelectedPaymentMethod(null)}
                          className="flex-1 rounded-xl py-3 font-bold text-slate-500 transition-colors hover:bg-slate-50"
                        >
                          {t('back')}
                        </button>
                        <button
                          onClick={handleConfirmPayment}
                          disabled={
                            isProcessingPayment ||
                            (cashAmountTendered
                              ? parseFloat(cashAmountTendered) < totalAmount
                              : true)
                          }
                          className={`flex flex-[2] items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${h5PageSettings?.enableCustomStyling ? 'custom-button shadow-custom' : 'bg-green-600 shadow-green-200'} btn-primary`}
                        >
                          {isProcessingPayment
                            ? t('processing')
                            : t('confirm_cash')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 py-8 text-center">
                      {isProcessingPayment ? (
                        <div className="flex flex-col items-center">
                          <div className="mb-6 h-20 w-20 animate-spin rounded-full border-4 border-slate-200 border-t-red-600"></div>
                          <h4 className="text-xl font-bold text-slate-800">
                            {t('processing')}
                          </h4>
                          <p className="text-slate-500">
                            {t('waiting_payment_confirmation')}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="relative mx-auto mb-4 flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100">
                            <QrCode
                              size={64}
                              className="text-slate-400 opacity-20"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-xs font-bold text-slate-400">
                                {t('simulated_api_qr')}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="mb-1 text-xl font-bold text-slate-800">
                              {t('scan_to_pay')}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {t('use_app').replace(
                                '{method}',
                                selectedPaymentMethod || ''
                              )}
                            </p>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => setSelectedPaymentMethod(null)}
                              className="flex-1 rounded-xl py-3 font-bold text-slate-500 transition-colors hover:bg-slate-50"
                            >
                              {t('back')}
                            </button>
                            <button
                              onClick={handleConfirmPayment}
                              className={`flex flex-[2] items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-lg ${h5PageSettings?.enableCustomStyling ? 'custom-button shadow-custom' : 'bg-red-600 shadow-red-200'} btn-primary`}
                            >
                              {t('simulate_success')}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrint={() => printReceipt(selectedOrder)}
        />
      )}
    </div>
  );
};

export default CustomerOrder;