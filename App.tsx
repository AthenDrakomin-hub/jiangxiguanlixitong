
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import { Page, Dish, Order, OrderStatus, Expense, Ingredient, KTVRoom, SignBillAccount, HotelRoom, OrderItem, DishIngredient, CarRecord } from './types';
import { DataAPI } from './services/api';
import { Loader2, Cloud, Menu } from 'lucide-react';
import { getStorageSettings } from './services/storage';

// Lazy load components to optimize bundle size
const Dashboard = lazy(() => import('./components/Dashboard'));
const MenuManagement = lazy(() => import('./components/MenuManagement'));
const OrderManagement = lazy(() => import('./components/OrderManagement'));
const FinanceSystem = lazy(() => import('./components/FinanceSystem'));
const InventoryManagement = lazy(() => import('./components/InventoryManagement'));
const KTVSystem = lazy(() => import('./components/KTVSystem'));
const SignBillSystem = lazy(() => import('./components/SignBillSystem'));
const HotelSystem = lazy(() => import('./components/HotelSystem'));
const QRCodeManager = lazy(() => import('./components/QRCodeManager'));
const KitchenDisplay = lazy(() => import('./components/KitchenDisplay'));
const CustomerOrder = lazy(() => import('./components/CustomerOrder'));
const Settings = lazy(() => import('./components/Settings'));
const CarService = lazy(() => import('./components/CarService')); 

// Notification sound URL
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

// Custom Hook for Debounced Auto Save
function useDebouncedAutoSave<T>(
  key: string, 
  data: T, 
  saveFn: (data: T) => Promise<any>, 
  delay: number = 1000,
  shouldSave: boolean
) {
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!shouldSave) return;

    const handler = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveFn(data);
      } catch (e) {
        console.error(`Failed to auto-save ${key}`, e);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [data, delay, shouldSave, saveFn, key]);

  return { isSaving };
}

const App: React.FC = () => {
  // Initialize Page from URL
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      if (pageParam === 'customer') return 'customer';
      if (pageParam === 'kitchen') return 'kitchen';
    }
    return 'dashboard';
  });

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  const [carRecords, setCarRecords] = useState<CarRecord[]>([]);
  
  // Global Settings State
  const [systemSettings, setSystemSettings] = useState<any>({
      storeInfo: {
          name: '江西饭店 (Jinjiang Star Hotel)',
          address: '5 Corner Lourdes Street and Roxas Boulevard, Pasay City',
          phone: '+639084156449',
          openingHours: '10:00 - 02:00',
          wifiSsid: 'jx88888888',
          telegram: '@jx555999'
      },
      categories: ['热菜', '凉菜', '汤羹', '主食', '酒水', '特色菜']
  });

  // Check Auth on Mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('jx_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
    // Note: Customer page does not require auth
    if (currentPage === 'customer') {
      setIsAuthenticated(true);
    }
  }, [currentPage]);

  // Initial Data Load
  useEffect(() => {
    const initData = async () => {
      // Check storage type for better loading text
      const settings = getStorageSettings();
      if (settings.type === 'github') {
        setLoadingText('Connecting to GitHub Cloud... / 正在连接云端数据库');
      }

      try {
        const response = await DataAPI.fetchAll();
        setDishes(response.dishes.data);
        setOrders(response.orders.data);
        setExpenses(response.expenses.data);
        setInventory(response.inventory.data);
        setKtvRooms(response.ktvRooms.data);
        setSignBillAccounts(response.signBillAccounts.data);
        setHotelRooms(response.hotelRooms.data);
        
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
  const saveDishesStatus = useDebouncedAutoSave('dishes', dishes, DataAPI.Menu.save, 1000, !isLoading);
  const saveOrdersStatus = useDebouncedAutoSave('orders', orders, DataAPI.Orders.save, 500, !isLoading);
  const saveExpensesStatus = useDebouncedAutoSave('expenses', expenses, DataAPI.Finance.save, 1000, !isLoading);
  const saveInventoryStatus = useDebouncedAutoSave('inventory', inventory, DataAPI.Inventory.save, 1000, !isLoading);
  const saveKtvStatus = useDebouncedAutoSave('ktvRooms', ktvRooms, DataAPI.KTV.save, 1000, !isLoading);
  const saveSignBillStatus = useDebouncedAutoSave('signBillAccounts', signBillAccounts, DataAPI.SignBill.save, 1000, !isLoading);
  const saveHotelStatus = useDebouncedAutoSave('hotelRooms', hotelRooms, DataAPI.Hotel.save, 1000, !isLoading);

  // Global Saving Indicator logic
  const isGlobalSaving = saveDishesStatus.isSaving || saveOrdersStatus.isSaving || saveExpensesStatus.isSaving || 
                        saveInventoryStatus.isSaving || saveKtvStatus.isSaving || saveSignBillStatus.isSaving ||
                        saveHotelStatus.isSaving;

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

  // Callback to allow other components (Hotel, KTV, Customer) to place orders
  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Centralized Order Status Handler with Inventory Deduction
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
     // 1. Find the order
     const order = orders.find(o => o.id === orderId);
     if (!order) return;

     // 2. If status changing to COOKING, deduct inventory (Kitchen Dishes)
     if (newStatus === OrderStatus.COOKING && order.status === OrderStatus.PENDING) {
        // Logic to deduct ingredients
        const deductions = new Map<string, number>();

        order.items.forEach((item: OrderItem) => {
           const dish = dishes.find(d => d.id === item.dishId);
           if (dish && dish.ingredients) {
              dish.ingredients.forEach((ing: DishIngredient) => {
                 const currentDeduction = deductions.get(ing.ingredientId) || 0;
                 deductions.set(ing.ingredientId, currentDeduction + (ing.quantity * item.quantity));
              });
           }
        });

        // Update Inventory State
        if (deductions.size > 0) {
           setInventory(prevInv => prevInv.map(invItem => {
              if (deductions.has(invItem.id)) {
                 const amountToDeduct = deductions.get(invItem.id)!;
                 return { ...invItem, quantity: Math.max(0, invItem.quantity - amountToDeduct) };
              }
              return invItem;
           }));
           console.log("Inventory deducted for Order", orderId);
        }
     }

     // 3. Update Order Status
     setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem('jx_auth', 'true');
    setIsAuthenticated(true);
  };

  if (!isAuthenticated && currentPage !== 'customer') {
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
              return <MenuManagement dishes={dishes} setDishes={setDishes} inventory={inventory} categories={systemSettings.categories || []} />;
            case 'orders':
              return <OrderManagement orders={orders} setOrders={setOrders} />; 
            case 'kitchen':
              return <KitchenDisplay orders={orders} onStatusChange={handleOrderStatusChange} onBack={() => handleNavigate('dashboard')} />;
            case 'customer':
              return <CustomerOrder dishes={dishes} orders={orders} onPlaceOrder={handlePlaceOrder} systemSettings={systemSettings} />;
            case 'ktv':
              return <KTVSystem rooms={ktvRooms} setRooms={setKtvRooms} dishes={dishes} />;
            case 'hotel':
              return <HotelSystem rooms={hotelRooms} setRooms={setHotelRooms} dishes={dishes} onPlaceOrder={handlePlaceOrder} />;
            case 'qrcode':
              return <QRCodeManager hotelRooms={hotelRooms} ktvRooms={ktvRooms} />;
            case 'signbill':
              return <SignBillSystem accounts={signBillAccounts} setAccounts={setSignBillAccounts} />;
            case 'finance':
              return <FinanceSystem orders={orders} expenses={expenses} setExpenses={setExpenses} />;
            case 'inventory':
              return <InventoryManagement inventory={inventory} setInventory={setInventory} />;
            case 'settings':
              return <Settings onSettingsChange={handleSettingsUpdate} />;
            case 'car':
              return <CarService records={carRecords} setRecords={setCarRecords} />;
            default:
              return <Dashboard orders={orders} ktvRooms={ktvRooms} signBillAccounts={signBillAccounts} />;
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
           <span className="text-lg">江西饭店 Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto relative min-h-screen w-full">
        {/* Global Save Indicator */}
        <div className={`fixed top-20 md:top-4 right-4 md:right-8 z-30 transition-all duration-300 transform ${isGlobalSaving ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
          <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-lg rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-medium text-slate-600">
            <Cloud size={14} className="animate-pulse text-blue-500" />
            <span>正在同步 / Syncing...</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
