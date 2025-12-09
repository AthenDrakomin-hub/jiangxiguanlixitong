import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { apiClient } from './services/apiClient';
import { 
  Dish, 
  Order, 
  Expense, 
  Ingredient, 
  KTVRoom, 
  SignBillAccount, 
  HotelRoom, 
  OrderStatus,
  Page
} from './types';
import { APP_CONFIG } from './config/appConfig';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const MenuManagement = React.lazy(() => import('./components/MenuManagement'));
const OrderManagement = React.lazy(() => import('./components/OrderManagement'));
const FinanceSystem = React.lazy(() => import('./components/FinanceSystem'));
const InventoryManagement = React.lazy(() => import('./components/InventoryManagement'));
const Settings = React.lazy(() => import('./components/Settings'));
const KTVSystem = React.lazy(() => import('./components/KTVSystem'));
const SignBillSystem = React.lazy(() => import('./components/SignBillSystem'));
const HotelSystem = React.lazy(() => import('./components/HotelSystem'));
const QRCodeManager = React.lazy(() => import('./components/QRCodeManager'));
const KitchenDisplay = React.lazy(() => import('./components/KitchenDisplay'));
const CustomerOrder = React.lazy(() => import('./components/CustomerOrder'));
const Login = React.lazy(() => import('./components/Login'));
const Sidebar = React.lazy(() => import('./components/Sidebar'));

const NOTIFICATION_SOUND_URL = APP_CONFIG.NOTIFICATION.soundUrl;

const App: React.FC = () => {
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
      const isDev = window.location.hostname === 'localhost' || 
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
  const [loadingText, setLoadingText] = useState('系统初始化中... / Initializing');
  
  // Application State
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [ktvRooms, setKtvRooms] = useState<KTVRoom[]>([]);
  const [signBillAccounts, setSignBillAccounts] = useState<SignBillAccount[]>([]);
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);

  
  // Global Settings State
  const [systemSettings, setSystemSettings] = useState<any>({
      storeInfo: APP_CONFIG.DEFAULT_STORE_INFO,
      notifications: {
          sound: true,
          desktop: true
      },
      payment: {
          enabledMethods: ['CASH'],
          aliPayEnabled: false,
          weChatEnabled: false,
          gCashEnabled: true,
          mayaEnabled: true
      },
      exchangeRate: APP_CONFIG.DEFAULT_FINANCIAL.exchangeRate,
      serviceChargeRate: APP_CONFIG.DEFAULT_FINANCIAL.serviceChargeRate,
      categories: []
  });

  // --- Data Initialization ---
  useEffect(() => {
    const initData = async () => {
      try {
        setLoadingText('正在同步云端数据... / Syncing Cloud Data');
        
        // Fetch all data from API with automatic fallback
        const response: any = await apiClient.fetchAll();
        
        // Update state with fetched data
        setDishes(response.dishes);
        setOrders(response.orders);
        setExpenses(response.expenses);
        setInventory(response.inventory);
        setKtvRooms(response.ktvRooms);
        setSignBillAccounts(response.signBillAccounts);
        setHotelRooms(response.hotelRooms);

        
        // Load settings
        const savedSettings = localStorage.getItem('jx_settings');
        if (savedSettings) {
           setSystemSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated || currentPage === 'customer') {
        initData();
    }
  }, [isAuthenticated, currentPage]);

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
    const prevOrders = prevOrdersRef.current;
    
    // Check for NEW PENDING orders
    const currentPending = orders.filter(o => o.status === OrderStatus.PENDING).length;
    const prevPending = prevOrders.filter(o => o.status === OrderStatus.PENDING).length;

    if (orders.length > prevOrders.length && currentPending > prevPending) {
        const oldOrderIds = new Set(prevOrders.map(o => o.id));
        const brandNewOrders = orders.filter(o => !oldOrderIds.has(o.id) && o.status === OrderStatus.PENDING);
        
        if (brandNewOrders.length > 0) {
           triggerNotification('新订单提醒 / New Order', `收到 ${brandNewOrders.length} 个新订单，请及时处理！`);
        }
    }
    
    prevOrdersRef.current = orders;
  }, [orders, isLoading]);

  const triggerNotification = (title: string, body: string) => {
    const savedSettings = localStorage.getItem('jx_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : { notifications: { sound: true, desktop: true } };
    const { sound, desktop } = settings.notifications || { sound: true, desktop: true };

    if (sound) {
      try {
        const audio = new Audio(NOTIFICATION_SOUND_URL);
        audio.play().catch(err => console.error("Audio playback failed:", err));
      } catch (e) { console.error(e); }
    }

    if (desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: body, icon: '/favicon.ico' });
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
  
  // Handle Settings Update from Settings Component
  const handleSettingsUpdate = (newSettings: any) => {
     setSystemSettings(newSettings);
  };

  // Handle Categories Update from MenuManagement Component
  const handleCategoriesUpdate = (newCategories: string[] | ((prev: string[]) => string[])) => {
    // If it's a function, we need to get the actual value
    const categories = typeof newCategories === 'function' 
      ? newCategories(systemSettings.categories || []) 
      : newCategories;
      
    setSystemSettings((prev: any) => ({
      ...prev,
      categories: categories
    }));
  };

  // Callback to allow other components (Hotel, KTV, Customer) to place orders
  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Centralized Order Status Handler with Inventory Deduction
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    console.log(`Updating order ${orderId} status to ${newStatus}`);
    
    // 1. Deduct inventory if moving to COOKING
    if (newStatus === OrderStatus.COOKING) {
       const order = orders.find(o => o.id === orderId);
       if (order) {
          // Deduct ingredients from inventory
          setInventory(prev => prev.map(invItem => {
             // Find if this item is used in the order
             const orderItem = order.items?.find(item => item.dishId === invItem.id);
             if (orderItem) {
                const amountToDeduct = orderItem.quantity;
                return { ...invItem, quantity: Math.max(0, invItem.quantity - amountToDeduct) };
             }
             return invItem;
          }));
          console.log("Inventory deducted for Order", orderId);
       }
    }

    // 2. Update Order Status
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem('jx_auth', 'true');
    setIsAuthenticated(true);
  };

  // 在开发环境中始终显示主界面，生产环境中才需要认证
  const shouldShowLogin = () => {
    if (typeof window !== 'undefined') {
      // 检查是否是开发环境
      const isDev = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.port !== '';
      
      // 在开发环境中不显示登录页面
      if (isDev) {
        return false;
      }
      
      // 在生产环境中，非客户页面需要认证
      return !isAuthenticated && currentPage !== 'customer';
    }
    return false;
  };

  if (shouldShowLogin()) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  const renderContent = () => {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
           <Loader2 className="animate-spin" /> Loading Module...
        </div>
      }>
        {(() => {
          switch (currentPage) {
            case 'dashboard':
              return <Dashboard orders={orders} ktvRooms={ktvRooms} signBillAccounts={signBillAccounts} hotelRooms={hotelRooms} />;
            case 'menu':
              return <MenuManagement 
                dishes={dishes} 
                setDishes={setDishes} 
                inventory={inventory} 
                categories={systemSettings.categories || []} 
                setCategories={handleCategoriesUpdate} 
              />;
            case 'orders':
              return <OrderManagement orders={orders} setOrders={setOrders} />; 
            case 'kitchen':
              return <KitchenDisplay orders={orders} onStatusChange={handleOrderStatusChange} onBack={() => handleNavigate('dashboard')} />;
            case 'finance':
              return <FinanceSystem 
                orders={orders} 
                expenses={expenses} 
                setExpenses={setExpenses}
              />;
            case 'inventory':
              return <InventoryManagement inventory={inventory} setInventory={setInventory} />;
            case 'settings':
              return <Settings onSettingsChange={handleSettingsUpdate} />;
            case 'ktv':
              return <KTVSystem rooms={ktvRooms} setRooms={setKtvRooms} dishes={dishes} />;
            case 'signbill':
              return <SignBillSystem accounts={signBillAccounts} setAccounts={setSignBillAccounts} />;
            case 'hotel':
              return <HotelSystem 
                rooms={hotelRooms} 
                setRooms={setHotelRooms} 
                dishes={dishes}
                onPlaceOrder={handlePlaceOrder}
              />;
            case 'qrcode':
              return <QRCodeManager hotelRooms={hotelRooms} ktvRooms={ktvRooms} />;
            case 'customer':
              return <CustomerOrder dishes={dishes} orders={orders} onPlaceOrder={handlePlaceOrder} systemSettings={systemSettings} />;

            default:
              return <Dashboard orders={orders} ktvRooms={ktvRooms} signBillAccounts={signBillAccounts} hotelRooms={hotelRooms} />;
          }
        })()}
      </Suspense>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 size={40} className="animate-spin text-slate-800" />
        <p className="font-medium text-lg">{loadingText}</p>
        <p className="text-sm text-slate-400">正在同步数据资源 / Syncing Data</p>
      </div>
    );
  }

  // Customer View & Kitchen View (No Sidebar)
  if (currentPage === 'customer' || currentPage === 'kitchen') {
     return renderContent();
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-40 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-2 text-white font-bold">
           <span className="text-lg">江西酒店 Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
           </svg>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-slate-900 text-white shadow-xl z-30">
        <Suspense fallback={<div className="p-4 text-slate-400">Loading...</div>}>
          <Sidebar currentPage={currentPage} onNavigate={handleNavigate} isOpen={true} onClose={() => {}} />
        </Suspense>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 text-white shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <Suspense fallback={<div className="p-4 text-slate-400">Loading...</div>}>
              <Sidebar currentPage={currentPage} onNavigate={handleNavigate} isOpen={true} onClose={() => setIsMobileMenuOpen(false)} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-0 pt-16 md:pt-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;