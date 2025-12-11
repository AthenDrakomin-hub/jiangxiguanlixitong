import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Plus, Minus, X, ChevronRight, UtensilsCrossed, MapPin, Search, History, Receipt, Home, Banknote, Smartphone, QrCode, Wallet, ArrowLeft, Wifi, Phone, Send, Loader2 } from 'lucide-react';
import { Dish, Order, OrderStatus, PaymentMethod, SystemSettings } from '../types';
import { setLanguage } from '../utils/i18n';
import ImageLazyLoad from './ImageLazyLoad';

interface CustomerOrderProps {
  dishes: Dish[];
  orders: Order[]; // Passed down to check history
  onPlaceOrder: (order: Order) => void;
  systemSettings?: SystemSettings;
}

const CustomerOrder: React.FC<CustomerOrderProps> = ({ dishes = [], orders = [], onPlaceOrder, systemSettings }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'MENU' | 'ORDERS'>('MENU');
  
  // Menu State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ dish: Dish; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cashAmountTendered, setCashAmountTendered] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Location State
  const [tableId, setTableId] = useState('');

  // Language State
  const [currentLang, setCurrentLang] = useState<'zh-CN' | 'fil'>('zh-CN');

  // Loading State
  const [loadingText, setLoadingText] = useState('加载中...');

  // Settings
  const storeInfo = systemSettings?.storeInfo;
  const storeName = storeInfo?.name || '江西酒店 (Jinjiang Star Hotel)';
  const exchangeRate = systemSettings?.exchangeRate || 8.2;
  const serviceChargeRate = systemSettings?.serviceChargeRate || 0.10;
  
  // Dynamic categories from settings
  const categories = ['All', ...(systemSettings?.categories || [])];

  // Default payment settings if not configured
  const paymentConfig = systemSettings?.payment || {
    enabledMethods: ['CASH'],
    aliPayEnabled: false,
    weChatEnabled: false,
    gCashEnabled: true,
    mayaEnabled: true
  };

  // Initialize from URL Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const langParam = params.get('lang');
    
    // Set language if provided in URL
    if (langParam === 'fil' || langParam === 'zh-CN') {
      setCurrentLang(langParam as 'zh-CN' | 'fil');
      setLanguage(langParam);
    }
    
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
    return dishes.filter(dish => {
      const matchesCategory = activeCategory === 'All' || dish.category === activeCategory;
      const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           dish.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [dishes, activeCategory, searchTerm]);

  // Cart calculations
  const totalCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const subTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0), [cart]);
  const serviceCharge = useMemo(() => subTotal * serviceChargeRate, [subTotal, serviceChargeRate]);
  const totalAmount = useMemo(() => subTotal + serviceCharge, [subTotal, serviceCharge]);

  // My Orders (filtered by tableId)
  const myOrders = useMemo(() => {
    return orders.filter(order => order.tableNumber === tableId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, tableId]);

  // Add item to cart
  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.dish.id === dish.id);
      if (existingItem) {
        return prev.map(item => 
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
    setCart(prev => {
      const existingItem = prev.find(item => item.dish.id === dishId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item => 
          item.dish.id === dishId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        return prev.filter(item => item.dish.id !== dishId);
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
    setLoadingText(currentLang === 'zh-CN' ? '正在处理支付...' : 'Pinoproseso ang pagbabayad...');

    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        tableNumber: tableId,
        source: tableId.startsWith('8') ? 'ROOM_SERVICE' : 'LOBBY',
        items: cart.map(item => ({
          dishId: item.dish.id,
          dishName: item.dish.name,
          quantity: item.quantity,
          price: item.dish.price
        })),
        status: OrderStatus.PENDING,
        totalAmount: totalAmount,
        paymentMethod: selectedPaymentMethod,
        createdAt: new Date().toISOString(),
        notes: notes || ''
      };

      onPlaceOrder(newOrder);
      
      // Post message to React Native WebView if available
      if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'NEW_ORDER',
          order: newOrder
        }));
      }
      
      // Reset cart and payment state
      setCart([]);
      setIsPaymentModalOpen(false);
      setSelectedPaymentMethod(null);
      setCashAmountTendered('');
      setNotes('');
      
      // Switch to history tab
      setActiveTab('ORDERS');
    } catch (error) {
      console.error('Failed to process payment:', error);
      alert(currentLang === 'zh-CN' ? '支付处理失败，请重试。' : 'Nabigo ang pagproseso ng pagbabayad, pakisubukan muli.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = currentLang === 'zh-CN' ? 'fil' : 'zh-CN';
    setCurrentLang(newLang);
    setLanguage(newLang);
  };

  // Render status badge
  const renderStatusBadge = (status: OrderStatus) => {
      switch (status) {
          case OrderStatus.PENDING: 
            return currentLang === 'zh-CN' ? 
              <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold">待接单 Pending</span> :
              <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold">Naghihintay</span>;
          case OrderStatus.COOKING: 
            return currentLang === 'zh-CN' ? 
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">烹饪中 Cooking</span> :
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">Nagluluto</span>;
          case OrderStatus.SERVED: 
            return currentLang === 'zh-CN' ? 
              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">已上菜 Served</span> :
              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">Nai-serve na</span>;
          case OrderStatus.PAID: 
            return currentLang === 'zh-CN' ? 
              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">已支付 Paid</span> :
              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">Nabayaran</span>;
          default:
            return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">Unknown</span>;
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans">
      {/* Loading Overlay */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 shadow-2xl">
            <Loader2 className="animate-spin text-red-600" size={32} />
            <p className="text-slate-700 font-medium">{loadingText}</p>
          </div>
        </div>
      )}

      {/* Language Toggle Button */}
      <button 
        onClick={toggleLanguage}
        className="absolute top-4 right-4 z-30 bg-white/80 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-300 flex items-center gap-1 shadow-sm"
      >
        {currentLang === 'zh-CN' ? '中文' : 'Fil'}
      </button>
      
      {/* Top Banner (Only on Menu Tab) */}
      {activeTab === 'MENU' && (
        <div className="relative bg-slate-800 shrink-0 pb-6">
           <div className="absolute inset-0 overflow-hidden opacity-60">
              <ImageLazyLoad 
                src="https://picsum.photos/800/400?random=restaurant" 
                alt="Restaurant Banner" 
                className="w-full h-full object-cover" 
              />
           </div>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
           
           <div className="relative z-10 p-5 pt-8 text-white">
              <h1 className="text-xl font-bold leading-tight shadow-sm mb-3">{storeName}</h1>
              <div className="space-y-1.5 text-xs opacity-90">
                 <div className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-red-400" /> 
                    <span>{storeInfo?.address}</span>
                 </div>
                 {storeInfo?.wifiSsid && (
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Wifi size={14} className="text-blue-400" />
                            <span>WiFi: {storeInfo.wifiSsid}</span>
                        </div>
                        {storeInfo.wifiPassword && <span>Pass: {storeInfo.wifiPassword}</span>}
                     </div>
                 )}
                 <div className="flex items-center gap-4">
                     {storeInfo?.phone && (
                        <div className="flex items-center gap-2">
                            <Phone size={14} className="text-green-400" />
                            <span>{storeInfo.phone}</span>
                        </div>
                     )}
                     {storeInfo?.telegram && (
                        <div className="flex items-center gap-2">
                            <Send size={14} className="text-sky-400" />
                            <span>{storeInfo.telegram}</span>
                        </div>
                     )}
                 </div>
              </div>
           </div>
           
           {/* Table ID Badge */}
           <div 
             className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30 flex items-center gap-1 z-20"
           >
              <MapPin size={12} /> {tableId}
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${activeTab === 'MENU' ? '-mt-4 relative z-10 rounded-t-2xl bg-slate-50' : 'pt-4'}`}>
         
         {/* MENU TAB CONTENT */}
         {activeTab === 'MENU' && (
           <>
              {/* Search & Categories */}
              <div className="sticky top-0 z-20 bg-slate-50 pt-4 pb-2 px-4 shadow-sm">
                 <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder={currentLang === 'zh-CN' ? "Search food... 搜索菜品" : "Maghanap ng pagkain..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    />
                 </div>
                 
                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                     {categories.map(cat => (
                       <button
                         key={cat}
                         onClick={() => setActiveCategory(cat as any)}
                         className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                           activeCategory === cat 
                             ? 'bg-red-600 text-white shadow-red-200 scale-105' 
                             : 'bg-white text-slate-500 border border-slate-200'
                         }`}
                       >
                         {cat === 'All' ? 
                           (currentLang === 'zh-CN' ? '全部 All' : 'Lahat') : 
                           cat}
                       </button>
                     ))}
                 </div>
              </div>

              {/* Dish List */}
              <div className="p-4 space-y-4 min-h-[50vh]">
                 {displayedDishes.length === 0 ? (
                   <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center">
                      <UtensilsCrossed size={32} className="mb-2 opacity-50" />
                      <span>{currentLang === 'zh-CN' ? 'No items found' : 'Walang nakitang mga item'}</span>
                   </div>
                 ) : (
                   displayedDishes.map(dish => {
                     const inCartQty = cart.find(i => i.dish.id === dish.id)?.quantity || 0;
                     return (
                       <div key={dish.id} className="flex gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                          <div className="w-24 h-24 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                            <ImageLazyLoad 
                              src={dish.imageUrl || '/placeholder-image.jpg'} 
                              alt={dish.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                             <div>
                                <h3 className="font-bold text-slate-800 text-sm truncate">{dish.name}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{dish.description}</p>
                             </div>
                             <div className="flex justify-between items-end mt-1">
                                <div>
                                   <div className="font-bold text-red-600 text-lg">₱{dish.price}</div>
                                   <div className="text--[10px] text-slate-400">参考价 Ref: ¥{(dish.price / exchangeRate).toFixed(0)}</div>
                                </div>
                                {inCartQty > 0 ? (
                                  <div className="flex items-center gap-3 bg-slate-50 rounded-full px-1 py-1 border border-slate-200 shadow-inner">
                                     <button onClick={() => removeFromCart(dish.id)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm border border-slate-100 active:scale-90 transition-transform">
                                       <Minus size={14} />
                                     </button>
                                     <span className="font-bold text-slate-800 text-sm min-w-[16px] text-center">{inCartQty}</span>
                                     <button onClick={() => addToCart(dish)} className="w-7 h-7 flex items-center justify-center rounded-full bg-red-600 text-white shadow-sm active:scale-90 transition-transform">
                                       <Plus size={14} />
                                     </button>
                                  </div>
                                ) : (
                                  <button onClick={() => addToCart(dish)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors active:scale-90 shadow-sm">
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
            <div className="p-4 space-y-4">
               <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">
                 {currentLang === 'zh-CN' ? 'Order History 订单记录' : 'Kasaysayan ng Order'}
               </h2>
               {myOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                     <History size={48} className="mx-auto mb-3 opacity-30" />
                     <p>{currentLang === 'zh-CN' ? 'No orders yet' : 'Wala pang mga order'}</p>
                     <button 
                       onClick={() => setActiveTab('MENU')} 
                       className="mt-4 text-red-600 font-bold text-sm"
                     >
                       {currentLang === 'zh-CN' ? 'Order Now 去点餐' : 'Mag-order Ngayon'}
                     </button>
                  </div>
               ) : (
                  myOrders.map(order => (
                     <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                           <span className="text-xs text-slate-500 font-mono">{new Date(order.createdAt).toLocaleString()}</span>
                           {renderStatusBadge(order.status)}
                        </div>
                        <div className="p-4 space-y-2">
                           {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                 <span className="text-slate-700 font-medium">x{item.quantity} {item.dishName}</span>
                                 <span className="text-slate-500">₱{item.price * item.quantity}</span>
                              </div>
                           ))}
                           {order.paymentMethod === 'CASH' && order.status === OrderStatus.PENDING && (
                              <div className="mt-2 bg-yellow-50 text-yellow-800 text-xs p-2 rounded">
                                 {currentLang === 'zh-CN' ? 
                                   'Wait for staff to collect cash. 等待服务员收款。' : 
                                   'Hintaying makolekta ng staff ang cash.'}
                              </div>
                           )}
                           <div className="pt-3 mt-2 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-sm font-bold text-slate-600">
                                {currentLang === 'zh-CN' ? 'Total' : 'Kabuuan'}
                              </span>
                              <span className="text-lg font-bold text-slate-800">₱{order.totalAmount}</span>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         )}
      </div>

      {/* Floating Cart Bar (Only Menu Tab) */}
      {activeTab === 'MENU' && cart.length > 0 && !isCartOpen && !isPaymentModalOpen && (
         <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-30">
            <button 
               onClick={() => setIsCartOpen(true)}
               className="w-full bg-slate-900/95 backdrop-blur text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between active:scale-[0.98] transition-transform border border-white/10"
            >
               <div className="flex items-center gap-4">
                  <div className="relative">
                     <ShoppingBag size={24} />
                     <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                        {totalCount}
                     </span>
                  </div>
                  <div className="text-left">
                     <div className="text-lg font-bold">₱{totalAmount.toFixed(0)}</div>
                  </div>
               </div>
               <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
                  {currentLang === 'zh-CN' ? 'View Cart' : 'Tingnan ang Cart'} <ChevronRight size={16} />
               </div>
            </button>
         </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-40 max-w-md mx-auto">
         <button 
           onClick={() => setActiveTab('MENU')}
           className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'MENU' ? 'text-red-600 bg-red-50' : 'text-slate-400'}`}
         >
            <Home size={24} />
            <span className="text-[10px] font-bold mt-1">
              {currentLang === 'zh-CN' ? 'Menu 菜单' : 'Menu'}
            </span>
         </button>
         <button 
           onClick={() => setActiveTab('ORDERS')}
           className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'ORDERS' ? 'text-red-600 bg-red-50' : 'text-slate-400'}`}
         >
            <Receipt size={24} />
            <span className="text-[10px] font-bold mt-1">
              {currentLang === 'zh-CN' ? 'Orders 订单' : 'Mga Order'}
            </span>
            {myOrders.length > 0 && activeTab !== 'ORDERS' && (
               <span className="absolute top-2 right-[20%] w-2 h-2 bg-red-500 rounded-full"></span>
            )}
         </button>
      </div>

      {/* Cart Bottom Sheet */}
      {isCartOpen && !isPaymentModalOpen && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300">
               <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                     <ShoppingBag size={20} className="text-red-600" /> 
                     {currentLang === 'zh-CN' ? 'Cart 购物车' : 'Cart'}
                  </h3>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white rounded-full text-slate-400 shadow-sm hover:bg-slate-100">
                     <X size={20} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cart.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                        <div className="flex-1">
                           <div className="font-bold text-slate-800">{item.dish.name}</div>
                           <div className="text-xs text-slate-400">₱{item.dish.price}</div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                           <button onClick={() => removeFromCart(item.dish.id)} className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm text-slate-600"><Minus size={14} /></button>
                           <span className="font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                           <button onClick={() => addToCart(item.dish)} className="w-8 h-8 flex items-center justify-center rounded bg-red-600 text-white shadow-sm"><Plus size={14} /></button>
                        </div>
                        <div className="w-16 text-right font-bold text-slate-800">
                           ₱{item.dish.price * item.quantity}
                        </div>
                     </div>
                  ))}
                  
                  {/* Notes Input */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                       {currentLang === 'zh-CN' ? 'Special Requests 备注' : 'Mga Espesyal na Kahilingan'}
                     </label>
                     <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={currentLang === 'zh-CN' ? "e.g. No spicy, less oil... (不要辣，少油)" : "hal. Walang maanghang, kaunti lang ang mantika..."}
                        className="w-full bg-slate-50 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none h-20"
                     />
                  </div>
               </div>

               <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="space-y-1 mb-2">
                     <div className="flex justify-between items-center text-sm text-slate-500">
                        <span>{currentLang === 'zh-CN' ? 'Subtotal 小计' : 'Subtotal'}</span>
                        <span>₱{subTotal}</span>
                     </div>
                     {serviceChargeRate > 0 && (
                        <div className="flex justify-between items-center text-sm text-slate-500">
                           <span>
                             {currentLang === 'zh-CN' ? 
                               `Service Charge (${serviceChargeRate * 100}%)` : 
                               `Bayad sa Serbisyo (${serviceChargeRate * 100}%)`}
                           </span>
                           <span>₱{serviceCharge.toFixed(2)}</span>
                        </div>
                     )}
                     <div className="flex justify-between items-center text-lg font-bold text-slate-800 pt-2 border-t border-slate-200">
                        <span>{currentLang === 'zh-CN' ? 'Total 合计' : 'Kabuuan'}</span>
                        <span>₱{totalAmount.toFixed(0)}</span>
                     </div>
                  </div>
                  
                  <button 
                     onClick={handleInitiateCheckout}
                     disabled={cart.length === 0}
                     className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 shadow-xl shadow-red-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentLang === 'zh-CN' ? 'Checkout 去支付' : 'Mag-checkout'}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Payment Selection Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10">
              
              {/* Payment Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                 <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                    <ArrowLeft size={20} />
                 </button>
                 <h3 className="font-bold text-slate-800 text-lg">
                   {currentLang === 'zh-CN' ? 'Cashier 收银台' : 'Cashier'}
                 </h3>
                 <div className="w-8"></div>
              </div>

              {/* Payment Content */}
              <div className="flex-1 overflow-y-auto p-6">
                 
                 {/* Amount Display */}
                 <div className="text-center mb-8">
                    <p className="text-slate-500 text-sm mb-1">
                      {currentLang === 'zh-CN' ? 'Total Amount 应付金额' : 'Kabuuang Halaga'}
                    </p>
                    <div className="text-4xl font-bold text-slate-900">₱{totalAmount.toFixed(0)}</div>
                    <div className="text-xs text-slate-400 mt-1">参考价 Reference: ≈ ¥{(totalAmount / exchangeRate).toFixed(1)}</div>
                 </div>

                 {!selectedPaymentMethod ? (
                   /* Method Selector */
                   <div className="space-y-3">
                      <p className="text-sm font-bold text-slate-700 mb-2">
                        {currentLang === 'zh-CN' ? 'Select Payment Method 选择支付方式' : 'Pumili ng Paraan ng Pagbabayad'}
                      </p>
                      
                      {/* Cash (Always Available) */}
                      <button onClick={() => setSelectedPaymentMethod('CASH')} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50 transition-all text-left group">
                         <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform"><Banknote size={24} /></div>
                         <div className="flex-1">
                            <div className="font-bold text-slate-800">
                              {currentLang === 'zh-CN' ? 'Cash 现金支付' : 'Cash'}
                            </div>
                            <div className="text-xs text-slate-400">
                              {currentLang === 'zh-CN' ? 'Pay at counter / table' : 'Magbayad sa counter / mesa'}
                            </div>
                         </div>
                         <ChevronRight size={18} className="text-slate-300" />
                      </button>

                      {/* GCash */}
                      {paymentConfig.gCashEnabled && (
                        <button onClick={() => setSelectedPaymentMethod('GCASH')} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group">
                           <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Wallet size={24} /></div>
                           <div className="flex-1">
                              <div className="font-bold text-slate-800">GCash</div>
                              <div className="text-xs text-slate-400">
                                {currentLang === 'zh-CN' ? 'E-Wallet' : 'E-Wallet'}
                              </div>
                           </div>
                           <ChevronRight size={18} className="text-slate-300" />
                        </button>
                      )}

                      {/* Maya */}
                      {paymentConfig.mayaEnabled && (
                        <button onClick={() => setSelectedPaymentMethod('MAYA')} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50 transition-all text-left group">
                           <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Wallet size={24} /></div>
                           <div className="flex-1">
                              <div className="font-bold text-slate-800">Maya</div>
                              <div className="text-xs text-slate-400">
                                {currentLang === 'zh-CN' ? 'E-Wallet' : 'E-Wallet'}
                              </div>
                           </div>
                           <ChevronRight size={18} className="text-slate-300" />
                        </button>
                      )}

                      {/* Alipay */}
                      {paymentConfig.aliPayEnabled && (
                        <button onClick={() => setSelectedPaymentMethod('ALIPAY')} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group">
                           <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><Smartphone size={24} /></div>
                           <div className="flex-1">
                              <div className="font-bold text-slate-800">Alipay 支付宝</div>
                              <div className="text-xs text-slate-400">
                                {currentLang === 'zh-CN' ? 'RMB Payment' : 'Pagbabayad sa RMB'}
                              </div>
                           </div>
                           <ChevronRight size={18} className="text-slate-300" />
                        </button>
                      )}

                      {/* WeChat */}
                      {paymentConfig.weChatEnabled && (
                        <button onClick={() => setSelectedPaymentMethod('WECHAT')} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group">
                           <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform"><QrCode size={24} /></div>
                           <div className="flex-1">
                              <div className="font-bold text-slate-800">WeChat 微信支付</div>
                              <div className="text-xs text-slate-400">
                                {currentLang === 'zh-CN' ? 'RMB Payment' : 'Pagbabayad sa RMB'}
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
                             <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                                <Banknote className="mx-auto text-green-600 mb-2" size={32} />
                                <h4 className="font-bold text-green-800">
                                  {currentLang === 'zh-CN' ? 'Cash Payment' : 'Pagbabayad sa Cash'}
                                </h4>
                                <p className="text-xs text-green-700">
                                  {currentLang === 'zh-CN' ? 'Please prepare your cash.' : 'Mangyaring ihanda ang iyong cash.'}
                                </p>
                             </div>

                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                  {currentLang === 'zh-CN' ? 'How much will you pay with?' : 'Magkano ang ibabayad mo?'}
                                </label>
                                <div className="relative">
                                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                                   <input 
                                      type="number" 
                                      autoFocus
                                      value={cashAmountTendered}
                                      onChange={(e) => setCashAmountTendered(e.target.value)}
                                      className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                                      placeholder={currentLang === 'zh-CN' ? "e.g. 1000" : "hal. 1000"}
                                   />
                                </div>
                                {/* Quick Amounts */}
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                   {[500, 1000].map(amt => (
                                      <button 
                                        key={amt}
                                        onClick={() => setCashAmountTendered(amt.toString())}
                                        className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-600 hover:bg-slate-200"
                                      >
                                        ₱{amt}
                                      </button>
                                   ))}
                                   <button 
                                      onClick={() => setCashAmountTendered(totalAmount.toFixed(0))}
                                      className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-600 hover:bg-slate-200"
                                   >
                                     {currentLang === 'zh-CN' ? 'Exact' : 'Eksakto'}
                                   </button>
                                </div>
                             </div>

                             {cashAmountTendered && !isNaN(parseFloat(cashAmountTendered)) && (
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                   <span className="text-slate-500 font-medium">
                                     {currentLang === 'zh-CN' ? 'Change Due 找零' : 'Sukli'}
                                   </span>
                                   <span className={`text-xl font-bold ${parseFloat(cashAmountTendered) >= totalAmount ? 'text-green-600' : 'text-red-500'}`}>
                                      ₱{(parseFloat(cashAmountTendered) - totalAmount).toFixed(0)}
                                   </span>
                                </div>
                             )}

                             <div className="flex gap-3 pt-4">
                                <button 
                                  onClick={() => setSelectedPaymentMethod(null)} 
                                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                                >
                                  {currentLang === 'zh-CN' ? 'Back' : 'Bumalik'}
                                </button>
                                <button 
                                   onClick={handleConfirmPayment}
                                   disabled={isProcessingPayment || (cashAmountTendered ? parseFloat(cashAmountTendered) < totalAmount : true)}
                                   className="flex-[2] py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                   {isProcessingPayment ? 
                                     (currentLang === 'zh-CN' ? 'Processing...' : 'Pinoproseso...') : 
                                     (currentLang === 'zh-CN' ? 'Confirm Cash' : 'Kumpirmahin ang Cash')}
                                </button>
                             </div>
                          </div>
                       ) : (
                          <div className="space-y-8 text-center py-8">
                             {isProcessingPayment ? (
                                <div className="flex flex-col items-center">
                                   <div className="w-20 h-20 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-6"></div>
                                   <h4 className="text-xl font-bold text-slate-800">
                                     {currentLang === 'zh-CN' ? 'Processing...' : 'Pinoproseso...'}
                                   </h4>
                                   <p className="text-slate-500">
                                     {currentLang === 'zh-CN' ? 'Waiting for payment confirmation' : 'Naghihintay ng kumpirmasyon ng pagbabayad'}
                                   </p>
                                </div>
                             ) : (
                                <>
                                   <div className="mx-auto w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-slate-300 relative overflow-hidden">
                                      <QrCode size={64} className="text-slate-400 opacity-20" />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                         <p className="text-xs text-slate-400 font-bold">
                                           {currentLang === 'zh-CN' ? 'Simulated API QR' : 'Simulated na API QR'}
                                         </p>
                                      </div>
                                   </div>
                                   
                                   <div>
                                      <h4 className="text-xl font-bold text-slate-800 mb-1">
                                        {currentLang === 'zh-CN' ? 'Scan to Pay' : 'I-scan para Magbayad'}
                                      </h4>
                                      <p className="text-slate-500 text-sm">
                                        {currentLang === 'zh-CN' ? 
                                          `Use your ${selectedPaymentMethod} app` : 
                                          `Gamitin ang iyong ${selectedPaymentMethod} app`}
                                      </p>
                                   </div>

                                   <div className="flex gap-3 pt-4">
                                      <button 
                                        onClick={() => setSelectedPaymentMethod(null)} 
                                        className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                                      >
                                        {currentLang === 'zh-CN' ? 'Back' : 'Bumalik'}
                                      </button>
                                      <button 
                                         onClick={handleConfirmPayment}
                                         className="flex-[2] py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                                      >
                                        {currentLang === 'zh-CN' ? 'Simulate Success (Dev)' : 'I-simulate ang Tagumpay (Dev)'}
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
    </div>
  );
};

export default CustomerOrder;