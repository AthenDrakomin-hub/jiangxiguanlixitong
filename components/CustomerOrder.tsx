import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Plus, Minus, X, ChevronRight, UtensilsCrossed, MapPin, Search, History, Receipt, Home, Banknote, Smartphone, QrCode, Wallet, ArrowLeft, Wifi, Phone, Send, Loader2, Eye } from 'lucide-react';
import { Dish, Order, OrderStatus, PaymentMethod, SystemSettings } from '../types';
import { setLanguage, t, LANGUAGE_COOKIE_NAME } from '../utils/i18n';
import { getCookie, setCookie } from '../utils/cookie';
import ImageLazyLoad from './ImageLazyLoad';
import OrderDetail from './OrderDetail';

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
            ${order.items.map(item => `
              <tr>
                <td>${item.dishName}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">₱${item.price.toFixed(2)}</td>
                <td class="text-right">₱${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${order.notes ? `
          <div class="mb-1">
            <strong>${t('special_requests')}:</strong>
            <div>${order.notes}</div>
          </div>
        ` : ''}
        
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
    
    // Write content to the print window
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // printWindow.close(); // Optionally close after printing
    };
  };

  // Loading State
  const [loadingText, setLoadingText] = useState('加载中...');

  // Settings
  const storeInfo = systemSettings?.storeInfo;
  const storeName = storeInfo?.name || t('default_store_name');
  const exchangeRate = systemSettings?.exchangeRate || 8.2;
  const serviceChargeRate = systemSettings?.serviceChargeRate || 0.10;
  
  // H5 Page Settings
  const h5PageSettings = systemSettings?.h5PageSettings || {
    enableCustomStyling: true,
    customHeaderColor: '#4F46E5',
    customButtonColor: '#DC2626',
    showStoreInfo: true,
    showWiFiInfo: true
  };
  
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
  
  // Apply custom styles if enabled
  useEffect(() => {
    if (h5PageSettings?.enableCustomStyling) {
      const style = document.createElement('style');
      style.innerHTML = `
        .custom-header {
          background-color: ${h5PageSettings.customHeaderColor} !important;
        }
        .custom-button {
          background-color: ${h5PageSettings.customButtonColor} !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
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
    return dishes.filter(dish => {
      const matchesCategory = activeCategory === 'All' || dish.category === activeCategory;
      const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
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

  // Recommended dishes based on order history
  const recommendedDishes = useMemo(() => {
    if (myOrders.length === 0 || dishes.length === 0) return [];
    
    // Count dish frequencies
    const dishCount: Record<string, number> = {};
    myOrders.forEach(order => {
      order.items.forEach(item => {
        dishCount[item.dishId] = (dishCount[item.dishId] || 0) + item.quantity;
      });
    });
    
    // Sort dishes by frequency and get top 5
    const sortedDishes = Object.entries(dishCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([dishId]) => dishes.find(dish => dish.id === dishId))
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
      total: { orders: myOrders.length, revenue: 0 }
    };
    
    // Calculate stats
    myOrders.forEach(order => {
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
    setLoadingText(t('processing_payment'));    try {
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
      alert(t('error'));    } finally {
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
            return <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold">{t('pending_status')}</span>;
          case OrderStatus.COOKING: 
            return <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">{t('cooking_status')}</span>;
          case OrderStatus.SERVED: 
            return <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">{t('served_status')}</span>;
          case OrderStatus.PAID: 
            return <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">{t('paid_status')}</span>;
          default:
            return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">Unknown</span>;
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans fade-in">
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
        {t('language_toggle')}      </button>
      
      {/* Top Banner (Only on Menu Tab) */}
      {activeTab === 'MENU' && (
        <div className={`relative shrink-0 pb-6 ${h5PageSettings?.enableCustomStyling ? 'custom-header' : 'bg-slate-800'}`}>
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
              {h5PageSettings?.showStoreInfo && (
                <div className="space-y-1.5 text-xs opacity-90">
                   <div className="flex items-start gap-2">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-red-400" /> 
                      <span>{storeInfo?.address}</span>
                   </div>
                   {h5PageSettings?.showWiFiInfo && storeInfo?.wifiSsid && (
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
              )}
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
              <div className="sticky top-0 z-20 bg-slate-50 pt-4 pb-2 px-4 shadow-sm slide-in-left">
                 <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder={t('search_placeholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-smooth"
                    />
                 </div>
                 
                 {/* Recommended Dishes */}
                 {recommendedDishes.length > 0 && (
                   <div className="mb-4 slide-in-left delay-75">
                     <h3 className="text-sm font-bold text-slate-700 mb-2">{t('recommended_for_you')}</h3>
                     <div className="flex gap-2 overflow-x-auto pb-2">
                       {recommendedDishes.map(dish => (
                         <button
                           key={dish.id}
                           onClick={() => {
                             setActiveCategory(dish.category);
                             setSearchTerm(dish.name);
                           }}
                           className="flex-shrink-0 flex flex-col items-center gap-1 bg-white p-2 rounded-lg border border-slate-200 shadow-sm card-hover"
                         >
                           <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                             <span className="text-xs font-bold text-slate-600 truncate px-1">{dish.name.substring(0, 8)}</span>
                           </div>
                           <span className="text-xs text-slate-500 truncate w-16">₱{dish.price}</span>
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
                 
                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide slide-in-left delay-100">
                     {categories.map(cat => (
                       <button
                         key={cat}
                         onClick={() => setActiveCategory(cat as any)}
                         className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm btn-primary ${
                           activeCategory === cat 
                             ? (h5PageSettings?.enableCustomStyling ? 'custom-button text-white shadow-custom scale-105' : 'bg-red-600 text-white shadow-red-200 scale-105')
                             : 'bg-white text-slate-500 border border-slate-200'
                         }`}
                       >
                         {cat === 'All' ? t('all_categories') : cat}
                       </button>
                     ))}
                 </div>
              </div>

              {/* Dish List */}
              <div className="p-4 space-y-4 min-h-[50vh] fade-in delay-150">
                 {displayedDishes.length === 0 ? (
                   <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center">
                      <UtensilsCrossed size={32} className="mb-2 opacity-50" />
                      <span>{t('no_items_found')}</span>
                   </div>
                 ) : (
                   displayedDishes.map(dish => {
                     const inCartQty = cart.find(i => i.dish.id === dish.id)?.quantity || 0;
                     return (
                       <div key={dish.id} className="flex gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 card-hover" role="article" aria-labelledby={`dish-name-${dish.id}`}>
                          <div className="w-24 h-24 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                            <ImageLazyLoad 
                              src={dish.imageUrl || '/placeholder-image.jpg'} 
                              alt={dish.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                             <div>
                                <h3 id={`dish-name-${dish.id}`} className="font-bold text-slate-800 text-sm truncate">{dish.name}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{dish.description}</p>
                             </div>
                             <div className="flex justify-between items-end mt-1">
                                <div>
                                   <div className="font-bold text-red-600 text-lg">₱{dish.price}</div>
                                   <div className="text--[10px] text-slate-400">{t('reference_price')}: ¥{(dish.price / exchangeRate).toFixed(0)}</div>
                                </div>
                                {inCartQty > 0 ? (
                                  <div className="flex items-center gap-3 bg-slate-50 rounded-full px-1 py-1 border border-slate-200 shadow-inner" role="group" aria-label={t('quantity_controls')}>
                                     <button 
                                       onClick={() => removeFromCart(dish.id)} 
                                       onKeyDown={(e) => handleDishKeyDown(e, dish)}
                                       className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm border border-slate-100 active:scale-90 transition-transform btn-primary"
                                       aria-label={`${t('decrease_quantity')} ${dish.name}`}
                                     >
                                       <Minus size={14} />
                                     </button>
                                     <span className="font-bold text-slate-800 text-sm min-w-[16px] text-center" aria-live="polite">{inCartQty}</span>
                                     <button 
                                       onClick={() => addToCart(dish)} 
                                       onKeyDown={(e) => handleDishKeyDown(e, dish)}
                                       className={`w-7 h-7 flex items-center justify-center rounded-full text-white shadow-sm active:scale-90 transition-transform ${h5PageSettings?.enableCustomStyling ? 'custom-button' : 'bg-red-600'} btn-primary`}
                                       aria-label={`${t('increase_quantity')} ${dish.name}`}
                                     >
                                       <Plus size={14} />
                                     </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => addToCart(dish)} 
                                    onKeyDown={(e) => handleDishKeyDown(e, dish)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full shadow-sm transition-colors active:scale-90 ${h5PageSettings?.enableCustomStyling ? 'custom-button text-white hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'} btn-primary`}
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
            <div className="p-4 space-y-4 fade-in">
               <h2 className="text-xl font-bold text-slate-800 mb-4 px-2 slide-in-right">
                 {t('order_history')}
               </h2>
               
               {/* Sales Statistics */}
               {salesStats && (
                 <div className="grid grid-cols-3 gap-2 mb-4 slide-in-right delay-75">
                   <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 text-center card-hover">
                     <div className="text-xs text-slate-500 mb-1">{t('today')}</div>
                     <div className="font-bold text-slate-800">{salesStats.today.orders}</div>
                     <div className="text-xs text-slate-500">{t('orders')}</div>
                   </div>
                   <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 text-center card-hover">
                     <div className="text-xs text-slate-500 mb-1">{t('yesterday')}</div>
                     <div className="font-bold text-slate-800">{salesStats.yesterday.orders}</div>
                     <div className="text-xs text-slate-500">{t('orders')}</div>
                   </div>
                   <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 text-center card-hover">
                     <div className="text-xs text-slate-500 mb-1">{t('total')}</div>
                     <div className="font-bold text-slate-800">{salesStats.total.orders}</div>
                     <div className="text-xs text-slate-500">{t('orders')}</div>
                   </div>
                   <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 text-center card-hover">
                     <div className="text-xs text-slate-500 mb-1">{t('today')}</div>
                     <div className="font-bold text-slate-800">₱{salesStats.today.revenue.toFixed(0)}</div>
                     <div className="text-xs text-slate-500">{t('revenue')}</div>
                   </div>
                   <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 text-center card-hover">
                     <div className="text-xs text-slate-500 mb-1">{t('yesterday')}</div>
                     <div className="font-bold text-slate-800">₱{salesStats.yesterday.revenue.toFixed(0)}</div>
                     <div className="text-xs text-slate-500">{t('revenue')}</div>
                   </div>
                   <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 text-center card-hover">
                     <div className="text-xs text-slate-500 mb-1">{t('total')}</div>
                     <div className="font-bold text-slate-800">₱{salesStats.total.revenue.toFixed(0)}</div>
                     <div className="text-xs text-slate-500">{t('revenue')}</div>
                   </div>
                 </div>
               )}
               {myOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 slide-in-right delay-100">
                     <History size={48} className="mx-auto mb-3 opacity-30" />
                     <p>{t('no_orders_yet')}</p>
                     <button 
                       onClick={() => setActiveTab('MENU')} 
                       className="mt-4 text-red-600 font-bold text-sm btn-primary"
                     >
                       {t('order_now')}
                     </button>
                  </div>
               ) : (
                  myOrders.map(order => (
                     <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover slide-in-right delay-150">
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
                                 {t('cash_collection_notice')}
                              </div>
                           )}
                           <div className="pt-3 mt-2 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-sm font-bold text-slate-600">
                                {t('total_label')}
                              </span>
                              <span className="text-lg font-bold text-slate-800">₱{order.totalAmount}</span>
                           </div>
                        </div>
                        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                           <button 
                              onClick={() => setSelectedOrder(order)}
                              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 btn-primary"
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
      {activeTab === 'MENU' && cart.length > 0 && !isCartOpen && !isPaymentModalOpen && (
         <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-30">
            <button 
               onClick={() => setIsCartOpen(true)}
               className={`w-full backdrop-blur text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between active:scale-[0.98] transition-transform border border-white/10 bounce-soft ${h5PageSettings?.enableCustomStyling ? 'custom-button' : 'bg-slate-900/95'} btn-primary`}
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
                  {t('view_cart')} <ChevronRight size={16} />
               </div>
            </button>
         </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-40 max-w-md mx-auto" role="navigation" aria-label={t('bottom_navigation')}>
         <button 
           onClick={() => setActiveTab('MENU')}
           onKeyDown={(e) => handleTabKeyDown(e, 'MENU')}
           className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'MENU' ? 'text-red-600 bg-red-50' : 'text-slate-400'}`}
           aria-selected={activeTab === 'MENU'}
           role="tab"
         >
            <Home size={24} />
            <span className="text-[10px] font-bold mt-1">
              {t('menu_tab')}
            </span>
         </button>
         <button 
           onClick={() => setActiveTab('ORDERS')}
           onKeyDown={(e) => handleTabKeyDown(e, 'ORDERS')}
           className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'ORDERS' ? 'text-red-600 bg-red-50' : 'text-slate-400'}`}
           aria-selected={activeTab === 'ORDERS'}
           role="tab"
         >
            <Receipt size={24} />
            <span className="text-[10px] font-bold mt-1">
              {t('orders_tab')}
            </span>
            {myOrders.length > 0 && activeTab !== 'ORDERS' && (
               <span className="absolute top-2 right-[20%] w-2 h-2 bg-red-500 rounded-full" aria-label={t('unread_orders')}></span>
            )}
         </button>
      </div>

      {/* Cart Bottom Sheet */}
      {isCartOpen && !isPaymentModalOpen && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300 slide-in-up">
               <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                     <ShoppingBag size={20} className="text-red-600" /> 
                     {t('cart_title')}
                  </h3>
                  <button 
                    onClick={() => setIsCartOpen(false)} 
                    className="p-2 bg-white rounded-full text-slate-400 shadow-sm hover:bg-slate-100 transition-colors"
                    aria-label={t('close_cart')}
                  >
                     <X size={20} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cart.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center border-b border-slate-50 last:border-0 pb-4 last:pb-0 slide-in-left delay-{idx*50}" role="listitem">
                        <div className="flex-1">
                           <div className="font-bold text-slate-800">{item.dish.name}</div>
                           <div className="text-xs text-slate-400">₱{item.dish.price}</div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1" role="group" aria-label={`${t('quantity_controls_for')} ${item.dish.name}`}>
                           <button 
                             onClick={() => removeFromCart(item.dish.id)} 
                             onKeyDown={(e) => handleCartItemKeyDown(e, item.dish.id)}
                             className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm text-slate-600 btn-primary"
                             aria-label={`${t('decrease_quantity')} ${item.dish.name}`}
                           >
                             <Minus size={14} />
                           </button>
                           <span className="font-bold text-slate-800 w-4 text-center" aria-live="polite">{item.quantity}</span>
                           <button 
                             onClick={() => addToCart(item.dish)} 
                             onKeyDown={(e) => handleCartItemKeyDown(e, item.dish.id)}
                             className={`w-8 h-8 flex items-center justify-center rounded shadow-sm ${h5PageSettings?.enableCustomStyling ? 'custom-button text-white' : 'bg-red-600 text-white'} btn-primary`}
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
                  <div className="mt-6 pt-4 border-t border-slate-100">
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                       {t('special_requests')}
                     </label>
                     <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('special_requests_placeholder')}
                        className="w-full bg-slate-50 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none h-20"
                     />
                  </div>
               </div>

               <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="space-y-1 mb-2">
                     <div className="flex justify-between items-center text-sm text-slate-500">
                        <span>{t('subtotal')}</span>
                        <span>₱{subTotal}</span>
                     </div>
                     {serviceChargeRate > 0 && (
                        <div className="flex justify-between items-center text-sm text-slate-500">
                           <span>
                             {t('service_charge')}
                           </span>
                           <span>₱{serviceCharge.toFixed(2)}</span>
                        </div>
                     )}
                     <div className="flex justify-between items-center text-lg font-bold text-slate-800 pt-2 border-t border-slate-200">
                        <span>{t('total')}</span>
                        <span>₱{totalAmount.toFixed(0)}</span>
                     </div>
                  </div>
                  
                  <button 
                     onClick={handleInitiateCheckout}
                     disabled={cart.length === 0}
                     className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 shadow-xl shadow-red-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary"
                  >
                    {t('checkout')}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Payment Selection Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 slide-in-up">
              
              {/* Payment Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                 <button 
                   onClick={() => setIsPaymentModalOpen(false)} 
                   className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors"
                   aria-label={t('back_to_cart')}
                 >
                    <ArrowLeft size={20} />
                 </button>
                 <h3 className="font-bold text-slate-800 text-lg">
                   {t('cashier')}
                 </h3>
                 <div className="w-8"></div>
              </div>

              {/* Payment Content */}
              <div className="flex-1 overflow-y-auto p-6">
                 
                 {/* Amount Display */}
                 <div className="text-center mb-8">
                    <p className="text-slate-500 text-sm mb-1">
                      {t('total_amount')}
                    </p>
                    <div className="text-4xl font-bold text-slate-900">₱{totalAmount.toFixed(0)}</div>
                    <div className="text-xs text-slate-400 mt-1">{t('reference_price')}: ≈ ¥{(totalAmount / exchangeRate).toFixed(1)}</div>
                 </div>

                 {!selectedPaymentMethod ? (
                   /* Method Selector */
                   <div className="space-y-3">
                      <p className="text-sm font-bold text-slate-700 mb-2">
                        {t('select_payment_method')}
                      </p>
                      
                      {/* Cash (Always Available) */}
                      <button 
                        onClick={() => setSelectedPaymentMethod('CASH')} 
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50 transition-all text-left group card-hover"
                        aria-label={`${t('select_payment_method')} ${t('cash')}`}
                      >
                         <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform"><Banknote size={24} /></div>
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
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group card-hover"
                          aria-label={`${t('select_payment_method')} GCash`}
                        >
                           <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Wallet size={24} /></div>
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
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-green-500 hover:bg-green-50 transition-all text-left group card-hover"
                          aria-label={`${t('select_payment_method')} Maya`}
                        >
                           <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Wallet size={24} /></div>
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
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group card-hover"
                          aria-label={`${t('select_payment_method')} Alipay`}
                        >
                           <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><Smartphone size={24} /></div>
                           <div className="flex-1">
                              <div className="font-bold text-slate-800">Alipay {t('alipay')}</div>
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
                          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group card-hover"
                          aria-label={`${t('select_payment_method')} WeChat Pay`}
                        >
                           <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform"><QrCode size={24} /></div>
                           <div className="flex-1">
                              <div className="font-bold text-slate-800">WeChat {t('wechat_pay')}</div>
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
                             <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                                <Banknote className="mx-auto text-green-600 mb-2" size={32} />
                                <h4 className="font-bold text-green-800">
                                  {t('cash_payment')}
                                </h4>
                                <p className="text-xs text-green-700">
                                  {t('prepare_cash')}
                                </p>
                             </div>

                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                  {t('cash_amount_prompt')}
                                </label>
                                <div className="relative">
                                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                                   <input 
                                      type="number" 
                                      autoFocus
                                      value={cashAmountTendered}
                                      onChange={(e) => setCashAmountTendered(e.target.value)}
                                      className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                                      placeholder={t('cash_amount_placeholder')}
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
                                      className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors btn-primary"
                                   >
                                     {t('exact')}
                                   </button>
                                </div>
                             </div>

                             {cashAmountTendered && !isNaN(parseFloat(cashAmountTendered)) && (
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                   <span className="text-slate-500 font-medium">
                                     {t('change_due')}
                                   </span>
                                   <span className={`text-xl font-bold ${parseFloat(cashAmountTendered) >= totalAmount ? 'text-green-600' : 'text-red-500'}`}>
                                      ₱{(parseFloat(cashAmountTendered) - totalAmount).toFixed(0)}
                                   </span>
                                </div>
                             )}

                             <div className="flex gap-3 pt-4">
                                <button 
                                  onClick={() => setSelectedPaymentMethod(null)} 
                                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                  {t('back')}
                                </button>
                                <button 
                                   onClick={handleConfirmPayment}
                                   disabled={isProcessingPayment || (cashAmountTendered ? parseFloat(cashAmountTendered) < totalAmount : true)}
                                   className={`flex-[2] py-3 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${h5PageSettings?.enableCustomStyling ? 'custom-button shadow-custom' : 'bg-green-600 shadow-green-200'} btn-primary`}
                                >
                                   {isProcessingPayment ? 
                                     t('processing') : 
                                     t('confirm_cash')}
                                </button>
                             </div>
                          </div>
                       ) : (
                          <div className="space-y-8 text-center py-8">
                             {isProcessingPayment ? (
                                <div className="flex flex-col items-center">
                                   <div className="w-20 h-20 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-6"></div>
                                   <h4 className="text-xl font-bold text-slate-800">
                                     {t('processing')}
                                   </h4>
                                   <p className="text-slate-500">
                                     {t('waiting_payment_confirmation')}
                                   </p>
                                </div>
                             ) : (
                                <>
                                   <div className="mx-auto w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-slate-300 relative overflow-hidden">
                                      <QrCode size={64} className="text-slate-400 opacity-20" />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                         <p className="text-xs text-slate-400 font-bold">
                                           {t('simulated_api_qr')}
                                         </p>
                                      </div>
                                   </div>
                                   
                                   <div>
                                      <h4 className="text-xl font-bold text-slate-800 mb-1">
                                        {t('scan_to_pay')}
                                      </h4>
                                      <p className="text-slate-500 text-sm">
                                        {t('use_app').replace('{method}', selectedPaymentMethod || '')}
                                      </p>
                                   </div>

                                   <div className="flex gap-3 pt-4">
                                      <button 
                                        onClick={() => setSelectedPaymentMethod(null)} 
                                        className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                      >
                                        {t('back')}
                                      </button>
                                      <button 
                                         onClick={handleConfirmPayment}
                                         className={`flex-[2] py-3 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 ${h5PageSettings?.enableCustomStyling ? 'custom-button shadow-custom' : 'bg-red-600 shadow-red-200'} btn-primary`}
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