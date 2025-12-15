import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import './index.css';
import { APP_CONFIG } from './config/appConfig';
import {
  Order,
  Dish,
  Expense,
  Ingredient,
  KTVRoom,
  SignBillAccount,
  HotelRoom,
  SystemSettings,
  Page,
  OrderStatus,
} from './types';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { useAppData } from './hooks/useAppData';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const MenuManagement = React.lazy(() => import('./components/MenuManagement'));
const OrderManagement = React.lazy(
  () => import('./components/OrderManagement')
);
const FinanceSystem = React.lazy(() => import('./components/FinanceSystem'));
const InventoryManagement = React.lazy(
  () => import('./components/InventoryManagement')
);
const Settings = React.lazy(() => import('./components/Settings'));
const KTVSystem = React.lazy(() => import('./components/KTVSystem'));
const SignBillSystem = React.lazy(() => import('./components/SignBillSystem'));
const HotelSystem = React.lazy(() => import('./components/HotelSystem'));
const QRCodeManager = React.lazy(() => import('./components/QRCodeManager'));
const KitchenDisplay = React.lazy(() => import('./components/KitchenDisplay'));
const CustomerOrder = React.lazy(() => import('./components/CustomerOrder'));
const PaymentManagement = React.lazy(
  () => import('./components/PaymentManagement')
);
const PermissionManagement = React.lazy(
  () => import('./components/PermissionManagement')
);

const App = () => {
  // Page Routing State
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    // Check URL params for customer/kitchen views
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      if (pageParam === 'customer') return 'customer';
      if (pageParam === 'kitchen') return 'kitchen';
    }
    return 'dashboard';
  });

  // Auth State - 在开发环境中自动认证
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // 在开发环境中自动通过认证
    if (typeof window !== 'undefined') {
      // 检查是否是开发环境
      const isDev =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.port !== '';

      // 在开发环境中自动认证，生产环境中检查sessionStorage
      if (isDev) {
        return true;
      }

      // 生产环境中检查认证状态
      return sessionStorage.getItem('jx_auth') === 'true';
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingText, setLoadingText] = useState(
    '系统初始化中... / Initializing'
  );

  // Application State
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [ktvRooms, setKtvRooms] = useState<KTVRoom[]>([]);
  const [signBillAccounts, setSignBillAccounts] = useState<SignBillAccount[]>(
    []
  );
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);

  // Global Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    storeInfo: APP_CONFIG.DEFAULT_STORE_INFO,
    notifications: {
      sound: true,
      desktop: true,
    },
    payment: {
      enabledMethods: ['CASH'],
      aliPayEnabled: false,
      weChatEnabled: false,
      gCashEnabled: true,
      mayaEnabled: true,
    },
    exchangeRate: APP_CONFIG.DEFAULT_FINANCIAL.exchangeRate,
    serviceChargeRate: APP_CONFIG.DEFAULT_FINANCIAL.serviceChargeRate,
    categories: [],
  });

  // --- Data Initialization ---
  const { data, loading, error } = useAppData();

  // Update state when data changes
  useEffect(() => {
    if (data) {
      setDishes(data.dishes);
      setOrders(data.orders);
      setExpenses(data.expenses);
      setInventory(data.inventory);
      setKtvRooms(data.ktvRooms);
      setSignBillAccounts(data.signBillAccounts);
      setHotelRooms(data.hotelRooms);
    }
  }, [data]);

  // Update loading state
  useEffect(() => {
    setIsLoading(loading);
    if (loading) {
      setLoadingText('正在同步云端数据... / Syncing Cloud Data');
    }
  }, [loading]);

  // Handle data fetch errors
  useEffect(() => {
    if (error) {
      console.error('Failed to load initial data', error);
    }
  }, [error]);

  // --- Optimized Persistence Layer (Debounced) ---

  // Track previous data for Notifications logic
  const prevOrdersRef = useRef<Order[]>([]);

  useEffect(() => {
    if (!isLoading) {
      if (prevOrdersRef.current.length === 0) prevOrdersRef.current = orders;
    }
  }, [isLoading]);

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Monitor New Orders Logic
  useEffect(() => {
    if (isLoading) return;
    const prevOrders = prevOrdersRef.current || [];

    // Check for NEW PENDING orders
    const currentPending = orders
      ? orders.filter((o: Order) => o.status === OrderStatus.PENDING).length
      : 0;
    const prevPending = prevOrders
      ? prevOrders.filter((o: Order) => o.status === OrderStatus.PENDING).length
      : 0;

    if (
      orders &&
      prevOrders &&
      orders.length > prevOrders.length &&
      currentPending > prevPending
    ) {
      const oldOrderIds = new Set(prevOrders.map((o: Order) => o.id));
      const brandNewOrders = orders.filter(
        (o: Order) => !oldOrderIds.has(o.id) && o.status === OrderStatus.PENDING
      );

      if (brandNewOrders.length > 0) {
        triggerNotification(
          '新订单提醒 / New Order',
          `收到 ${brandNewOrders.length} 个新订单，请及时处理！`
        );

        // 同时在页面上显示一个明显的提示
        const notificationElement = document.createElement('div');
        notificationElement.innerHTML = `
             <div id="new-order-notification" class="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-bounce flex items-center gap-2">
               <div class="w-3 h-3 bg-white rounded-full animate-ping absolute"></div>
               <span class="font-bold">新订单提醒 / New Order</span>
               <span>收到 ${brandNewOrders.length} 个新订单</span>
               <button onclick="document.getElementById('new-order-notification').remove()" class="ml-2 text-white hover:text-gray-200">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                 </svg>
               </button>
             </div>
           `;
        document.body.appendChild(notificationElement);

        // 5秒后自动移除通知
        setTimeout(() => {
          const element = document.getElementById('new-order-notification');
          if (element) {
            element.remove();
          }
        }, 5000);
      }
    }

    prevOrdersRef.current = orders || [];
  }, [orders, isLoading]);

  const triggerNotification = (title: string, body: string) => {
    const savedSettings = localStorage.getItem('jx_settings');
    const settings = savedSettings
      ? JSON.parse(savedSettings)
      : { notifications: { sound: true, desktop: true } };
    const { sound, desktop } = settings.notifications || {
      sound: true,
      desktop: true,
    };

    if (sound) {
      try {
        // 检查音频文件是否存在
        fetch(APP_CONFIG.NOTIFICATION.soundUrl)
          .then((response) => {
            if (response.ok) {
              const audio = new Audio(APP_CONFIG.NOTIFICATION.soundUrl);
              audio
                .play()
                .catch((err) => console.error('Audio playback failed:', err));
            } else {
              // 如果通知音效文件不存在，使用系统默认通知音
              console.log('通知音效文件不存在，使用系统默认通知音');
              if (
                'Notification' in window &&
                Notification.permission === 'granted'
              ) {
                new Notification(title, {
                  body: body,
                  icon: '/favicon.ico',
                  silent: false, // 允许系统播放默认通知音
                });
              }
            }
          })
          .catch((err) => {
            console.error('检查音频文件失败:', err);
          });
      } catch (e) {
        console.error('播放通知音效失败:', e);
      }
    }

    if (
      desktop &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        silent: !sound, // 如果已经播放了音效，就不重复播放系统通知音
      });
    }
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    // Also update URL for better history management
    const url = new URL(window.location.href);
    if (page === 'customer' || page === 'kitchen') {
      url.searchParams.set('page', page);
    } else {
      url.searchParams.delete('page');
    }
    window.history.pushState({}, '', url);
    setIsMobileMenuOpen(false); // Close sidebar on navigation
  };

  // Callback to allow other components (Hotel, KTV, Customer) to place orders
  const handlePlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...(prev || [])]);
  };
  // Centralized Order Status Handler with Inventory Deduction
  const handleOrderStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    console.log(`Updating order ${orderId} status to ${newStatus}`);

    // 1. Deduct inventory if moving to COOKING
    if (newStatus === OrderStatus.COOKING) {
      const order = orders ? orders.find((o) => o.id === orderId) : undefined;
      if (order) {
        // Deduct ingredients from inventory
        setInventory((prev) =>
          (prev || []).map((invItem) => {
            // Find if this item is used in the order
            const orderItem = order.items?.find(
              (item) => item.dishId === invItem.id
            );
            if (orderItem) {
              const amountToDeduct = orderItem.quantity;
              return {
                ...invItem,
                quantity: Math.max(0, invItem.quantity - amountToDeduct),
              };
            }
            return invItem;
          })
        );
        console.log('Inventory deducted for Order', orderId);
      }
    }

    // 2. Update Order Status
    setOrders((prev) =>
      (prev || []).map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      )
    );
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem('jx_auth', 'true');
    setIsAuthenticated(true);
  };

  // 修复useEffect依赖数组警告
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const parsedOrders: Order[] = JSON.parse(savedOrders);
        // 确保解析的数据符合Order类型
        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        }
      } catch (error) {
        console.error('Failed to parse orders from localStorage:', error);
      }
    }
  }, [orders]); // 添加orders到依赖数组

  // 移除网络状态监听器，避免React错误#310
  // Network status effect has been removed to prevent React error #310

  // Render content based on current page
  const renderContent = () => {
    try {
      // Loading state
      if (isLoading) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-slate-600" />
              <p className="font-medium text-slate-600">{loadingText}</p>
            </div>
          </div>
        );
      }

      // Authentication check
      if (!isAuthenticated) {
        return <Login onLogin={handleLoginSuccess} />;
      }

      // Page routing
      switch (currentPage) {
        case 'dashboard':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Dashboard...
                </div>
              }
            >
              <Dashboard
                orders={orders}
                ktvRooms={ktvRooms}
                signBillAccounts={signBillAccounts}
                hotelRooms={hotelRooms}
              />
            </Suspense>
          );
        case 'menu':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Menu Management...
                </div>
              }
            >
              <MenuManagement
                dishes={dishes}
                setDishes={setDishes}
                categories={systemSettings.categories || []}
                setCategories={(newCategories) => {
                  setSystemSettings((prev) => ({
                    ...prev,
                    categories:
                      typeof newCategories === 'function'
                        ? newCategories(prev.categories || [])
                        : newCategories,
                  }));
                }}
                inventory={inventory}
              />
            </Suspense>
          );
        case 'orders':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Order Management...
                </div>
              }
            >
              <OrderManagement orders={orders} setOrders={setOrders} />
            </Suspense>
          );
        case 'finance':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Finance System...
                </div>
              }
            >
              <FinanceSystem
                expenses={expenses}
                setExpenses={setExpenses}
                orders={orders}
              />
            </Suspense>
          );
        case 'inventory':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Inventory Management...
                </div>
              }
            >
              <InventoryManagement
                inventory={inventory}
                setInventory={setInventory}
              />
            </Suspense>
          );
        case 'settings':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Settings...
                </div>
              }
            >
              <Settings
                systemSettings={systemSettings}
                setSystemSettings={setSystemSettings}
                dishes={dishes}
                setDishes={setDishes}
                orders={orders}
                setOrders={setOrders}
                expenses={expenses}
                setExpenses={setExpenses}
                inventory={inventory}
                setInventory={setInventory}
                ktvRooms={ktvRooms}
                setKtvRooms={setKtvRooms}
                signBillAccounts={signBillAccounts}
                setSignBillAccounts={setSignBillAccounts}
                hotelRooms={hotelRooms}
                setHotelRooms={setHotelRooms}
                onSettingsChange={(newSettings) => {
                  setSystemSettings((prev) => ({ ...prev, ...newSettings }));
                }}
              />
            </Suspense>
          );
        case 'ktv':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading KTV System...
                </div>
              }
            >
              <KTVSystem
                rooms={ktvRooms}
                setRooms={setKtvRooms}
                dishes={dishes}
              />
            </Suspense>
          );
        case 'signbill':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Sign Bill System...
                </div>
              }
            >
              <SignBillSystem
                accounts={signBillAccounts}
                setAccounts={setSignBillAccounts}
              />
            </Suspense>
          );
        case 'hotel':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Hotel System...
                </div>
              }
            >
              <HotelSystem
                rooms={hotelRooms}
                setRooms={setHotelRooms}
                dishes={dishes}
                onPlaceOrder={handlePlaceOrder}
                systemSettings={{
                  exchangeRate: systemSettings.exchangeRate || 8.2,
                }}
              />
            </Suspense>
          );
        case 'qrcode':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading QR Code Manager...
                </div>
              }
            >
              <QRCodeManager hotelRooms={hotelRooms} ktvRooms={ktvRooms} />
            </Suspense>
          );
        case 'kitchen':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Kitchen Display...
                </div>
              }
            >
              <KitchenDisplay
                orders={orders}
                onStatusChange={handleOrderStatusChange}
                onBack={() => setCurrentPage('dashboard')}
              />
            </Suspense>
          );
        case 'customer':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Customer Order...
                </div>
              }
            >
              <CustomerOrder
                dishes={dishes}
                orders={orders}
                onPlaceOrder={handlePlaceOrder}
                systemSettings={systemSettings}
              />
            </Suspense>
          );
        case 'payment':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Payment Management...
                </div>
              }
            >
              <PaymentManagement />
            </Suspense>
          );
        case 'permissions':
          return (
            <Suspense
              fallback={
                <div className="p-8 text-center text-slate-500">
                  Loading Permission Management...
                </div>
              }
            >
              <PermissionManagement />
            </Suspense>
          );
        default:
          return (
            <div className="p-8 text-center text-red-500">
              Page not found: {currentPage}
            </div>
          );
      }
    } catch (error) {
      console.error('Render content error:', error);
      // 添加错误处理，防止白屏
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-red-600">⚠️</div>
            <h2 className="mb-2 text-xl font-bold text-slate-800">
              页面加载错误
            </h2>
            <p className="mb-4 text-slate-600">
              抱歉，页面加载时发生了错误。请刷新页面重试。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }
  };

  // Customer View & Kitchen View (No Sidebar)
  if (currentPage === 'customer' || currentPage === 'kitchen') {
    return renderContent();
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-slate-50">
        {/* Mobile Header */}
        <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-slate-900 px-4 shadow-md md:hidden">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="text-lg">江西酒店 Admin</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Desktop Sidebar */}
        <div className="z-30 hidden w-64 bg-slate-900 text-white shadow-xl md:block">
          <Suspense
            fallback={<div className="p-4 text-slate-400">Loading...</div>}
          >
            <Sidebar
              currentPage={currentPage}
              onNavigate={handleNavigate}
              isOpen={true}
              onClose={() => {}}
            />
          </Suspense>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="absolute bottom-0 left-0 top-0 w-64 bg-slate-900 text-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Suspense
                fallback={<div className="p-4 text-slate-400">Loading...</div>}
              >
                <Sidebar
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                  isOpen={true}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              </Suspense>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 pt-16 md:ml-0 md:pt-0">{renderContent()}</div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
