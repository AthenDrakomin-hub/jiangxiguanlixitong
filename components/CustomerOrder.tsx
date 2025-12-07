
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Plus, Minus, X, ChevronRight, UtensilsCrossed, MapPin, Search, ChefHat, Clock, History, Receipt, ArrowLeft, Home, Menu as MenuIcon } from 'lucide-react';
import { Dish, Category, Order, OrderStatus, OrderItem, OrderSource } from '../types';

interface CustomerOrderProps {
  dishes: Dish[];
  orders: Order[]; // Passed down to check history
  onPlaceOrder: (order: Order) => void;
  systemSettings?: any;
}

const CustomerOrder: React.FC<CustomerOrderProps> = ({ dishes, orders, onPlaceOrder, systemSettings }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'MENU' | 'ORDERS'>('MENU');
  
  // Menu State
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [cart, setCart] = useState<{ dish: Dish; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');

  // Location State
  const [tableId, setTableId] = useState('');
  const [isFixedLocation, setIsFixedLocation] = useState(false); 
  const [showTableSelector, setShowTableSelector] = useState(false);

  // Settings
  const storeName = systemSettings?.storeInfo?.name || '江西饭店 Jiangxi Hotel';
  const exchangeRate = systemSettings?.exchangeRate || 8.2;
  const serviceChargeRate = systemSettings?.serviceChargeRate || 0.10;

  // Initialize from URL Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    
    if (idParam) {
      setTableId(idParam);
      setIsFixedLocation(true);
    } else {
      setShowTableSelector(true); // Prompt user to select table if none provided
    }
  }, []);

  // Determine Order Source based on ID format
  const getOrderSource = (id: string): OrderSource => {
    const upperId = id.toUpperCase();
    if (upperId.startsWith('82') || upperId.startsWith('83') || upperId.startsWith('RM')) return 'ROOM_SERVICE';
    if (upperId.includes('KTV') || upperId.includes('VIP')) return 'KTV';
    if (upperId === 'TAKEOUT') return 'TAKEOUT';
    return 'LOBBY';
  };

  // Group dishes
  const categories = ['All', ...Object.values(Category)];
  const displayedDishes = dishes.filter(d => {
    const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    return d.available && matchesCategory && matchesSearch;
  });

  // History Orders (Filter by Table ID)
  const myOrders = useMemo(() => {
     if (!tableId) return [];
     return orders.filter(o => o.tableNumber === tableId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, tableId]);

  // Cart Logic
  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        return prev.map(item => item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart(prev => prev.reduce((acc, item) => {
      if (item.dish.id === dishId) {
        if (item.quantity > 1) {
          acc.push({ ...item, quantity: item.quantity - 1 });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as { dish: Dish; quantity: number }[]));
  };

  // Totals Calculation
  const subTotal = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
  const serviceCharge = subTotal * serviceChargeRate;
  const totalAmount = subTotal + serviceCharge;
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = () => {
    if (cart.length === 0 || !tableId) return;

    const orderItems: OrderItem[] = cart.map(c => ({
      dishId: c.dish.id,
      dishName: c.dish.name,
      quantity: c.quantity,
      price: c.dish.price
    }));

    const newOrder: Order = {
      id: `WEB-${Date.now().toString().slice(-6)}`,
      tableNumber: tableId,
      source: getOrderSource(tableId),
      items: orderItems,
      status: OrderStatus.PENDING,
      totalAmount: totalAmount, 
      createdAt: new Date().toISOString(),
      notes: notes || 'Mobile Order 手机点餐'
    };

    onPlaceOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);
    setNotes('');
    setShowSuccess(true);
    setTimeout(() => {
       setShowSuccess(false);
       setActiveTab('ORDERS'); // Switch to history tab
    }, 2000);
  };

  // Render Functions
  const renderStatusBadge = (status: OrderStatus) => {
      switch (status) {
          case OrderStatus.PENDING: return <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold">待接单 Pending</span>;
          case OrderStatus.COOKING: return <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">烹饪中 Cooking</span>;
          case OrderStatus.SERVED: return <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">已上菜 Served</span>;
          case OrderStatus.PAID: return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">已支付 Paid</span>;
          default: return <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">已取消 Cancelled</span>;
      }
  };

  if (showTableSelector && !isFixedLocation) {
     return (
        <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
           <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-xl text-center">
              <MapPin size={48} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome 欢迎光临</h2>
              <p className="text-slate-500 mb-6">Please select your location 请选择您的位置</p>
              
              <div className="space-y-3">
                 <button onClick={() => { setTableId('LOBBY'); setShowTableSelector(false); }} className="w-full py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-red-500 hover:text-red-600 transition-colors">
                    Lobby Hall 大厅
                 </button>
                 <button onClick={() => { setTableId('TAKEOUT'); setShowTableSelector(false); }} className="w-full py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors">
                    Takeout 外卖
                 </button>
                 <div className="relative">
                    <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200 z-0"></span>
                    <span className="relative z-10 bg-white px-2 text-xs text-slate-400">OR INPUT ROOM NO</span>
                 </div>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. 8201" 
                      className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2 text-center font-bold focus:border-red-500 outline-none uppercase"
                      id="custom-room-input"
                    />
                    <button 
                       onClick={() => {
                          const val = (document.getElementById('custom-room-input') as HTMLInputElement).value;
                          if (val) { setTableId(val); setShowTableSelector(false); }
                       }}
                       className="bg-red-600 text-white px-6 rounded-xl font-bold"
                    >
                       Go
                    </button>
                 </div>
              </div>
           </div>
        </div>
     )
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-green-500 z-50 flex flex-col items-center justify-center text-white p-6 text-center animate-fade-in">
         <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm animate-bounce">
            <UtensilsCrossed size={48} />
         </div>
         <h2 className="text-3xl font-bold mb-2">Order Sent!</h2>
         <p className="opacity-90 mb-1">下单成功！后厨正在制作中。</p>
         <p className="text-sm opacity-75">Location: {tableId}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans">
      
      {/* Top Banner (Only on Menu Tab) */}
      {activeTab === 'MENU' && (
        <div className="relative h-40 bg-slate-800 shrink-0">
           <img src="https://picsum.photos/800/400?random=restaurant" className="w-full h-full object-cover opacity-60" alt="Banner" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
           <div className="absolute bottom-4 left-4 right-4 text-white">
              <h1 className="text-xl font-bold leading-tight shadow-sm">{storeName}</h1>
              <div className="flex items-center gap-2 mt-1 text-xs opacity-90">
                 <span className="bg-red-600 px-2 py-0.5 rounded font-bold">Open</span>
                 <span className="flex items-center gap-1"><MapPin size={10} /> Pasay City</span>
              </div>
           </div>
           {/* Table ID Badge */}
           <div 
             onClick={() => !isFixedLocation && setShowTableSelector(true)}
             className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30 flex items-center gap-1 cursor-pointer"
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
                      placeholder="Search food... 搜索菜品"
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
                         {cat === 'All' ? '全部 All' : cat}
                       </button>
                     ))}
                 </div>
              </div>

              {/* Dish List */}
              <div className="p-4 space-y-4 min-h-[50vh]">
                 {displayedDishes.length === 0 ? (
                   <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center">
                      <UtensilsCrossed size={32} className="mb-2 opacity-50" />
                      <span>No items found</span>
                   </div>
                 ) : (
                   displayedDishes.map(dish => {
                     const inCartQty = cart.find(i => i.dish.id === dish.id)?.quantity || 0;
                     return (
                       <div key={dish.id} className="flex gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                          <div className="w-24 h-24 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
                            <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                             <div>
                                <h3 className="font-bold text-slate-800 text-sm truncate">{dish.name}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{dish.description}</p>
                             </div>
                             <div className="flex justify-between items-end mt-1">
                                <div>
                                   <div className="font-bold text-red-600 text-lg">₱{dish.price}</div>
                                   <div className="text-[10px] text-slate-400">≈ ¥{(dish.price / exchangeRate).toFixed(0)}</div>
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
               <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Order History 订单记录</h2>
               {myOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                     <History size={48} className="mx-auto mb-3 opacity-30" />
                     <p>No orders yet</p>
                     <button onClick={() => setActiveTab('MENU')} className="mt-4 text-red-600 font-bold text-sm">Order Now 去点餐</button>
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
                           <div className="pt-3 mt-2 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-sm font-bold text-slate-600">Total</span>
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
      {activeTab === 'MENU' && cart.length > 0 && (
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
                  View Cart <ChevronRight size={16} />
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
            <span className="text-[10px] font-bold mt-1">Menu 菜单</span>
         </button>
         <button 
           onClick={() => setActiveTab('ORDERS')}
           className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'ORDERS' ? 'text-red-600 bg-red-50' : 'text-slate-400'}`}
         >
            <Receipt size={24} />
            <span className="text-[10px] font-bold mt-1">Orders 订单</span>
            {myOrders.length > 0 && activeTab !== 'ORDERS' && (
               <span className="absolute top-2 right-[20%] w-2 h-2 bg-red-500 rounded-full"></span>
            )}
         </button>
      </div>

      {/* Cart Modal / Bottom Sheet */}
      {isCartOpen && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300">
               <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                     <ShoppingBag size={20} className="text-red-600" /> Cart 购物车
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
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Special Requests 备注</label>
                     <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. No spicy, less oil... (不要辣，少油)"
                        className="w-full bg-slate-50 border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none h-20"
                     />
                  </div>
               </div>

               <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="space-y-1 mb-2">
                     <div className="flex justify-between items-center text-sm text-slate-500">
                        <span>Subtotal 小计</span>
                        <span>₱{subTotal}</span>
                     </div>
                     {serviceChargeRate > 0 && (
                        <div className="flex justify-between items-center text-sm text-slate-500">
                           <span>Service Charge ({serviceChargeRate * 100}%)</span>
                           <span>₱{serviceCharge.toFixed(2)}</span>
                        </div>
                     )}
                     <div className="flex justify-between items-center text-lg font-bold text-slate-800 pt-2 border-t border-slate-200">
                        <span>Total 合计</span>
                        <span>₱{totalAmount.toFixed(0)}</span>
                     </div>
                     <div className="text-right text-xs text-slate-400">
                        ≈ ¥{(totalAmount / exchangeRate).toFixed(0)}
                     </div>
                  </div>
                  
                  <button 
                     onClick={handleSubmit}
                     className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 shadow-xl shadow-red-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                  >
                     Place Order 下单
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default CustomerOrder;
