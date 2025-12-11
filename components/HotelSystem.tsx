import React, { useState } from 'react';
import { Utensils, X, Plus, User, Receipt, ChefHat, Loader2 } from 'lucide-react';
import { HotelRoom, Dish, OrderItem, Order, OrderStatus, HotelRoomStatus } from '../types';
import ImageLazyLoad from './ImageLazyLoad';

interface HotelSystemProps {
  rooms: HotelRoom[];
  setRooms: React.Dispatch<React.SetStateAction<HotelRoom[]>>;
  dishes: Dish[];
  onPlaceOrder: (newOrder: Order) => void;
  systemSettings: {
    exchangeRate: number;
  };
}

const HotelSystem: React.FC<HotelSystemProps> = ({ 
  rooms, 
  setRooms, 
  dishes, 
  onPlaceOrder
}) => {
  const [activeFloor, setActiveFloor] = useState<number>(2);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('加载中...');
  
  // Filter rooms by active floor
  const displayRooms = rooms.filter((r: HotelRoom) => r.floor === activeFloor);
  
  // Add item to cart
  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.dishId === dish.id);
      if (existingItem) {
        return prev.map(item => 
          item.dishId === dish.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { 
          dishId: dish.id, 
          dishName: dish.name, 
          quantity: 1, 
          price: dish.price 
        }];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (dishId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.dishId === dishId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item => 
          item.dishId === dishId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        return prev.filter(item => item.dishId !== dishId);
      }
    });
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate room total
  const roomTotal = selectedRoom?.orders.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0) || 0;

  // Sort rooms by room number
  const sortedRooms = [...displayRooms].sort((a, b) => {
    return parseInt(a.number) - parseInt(b.number);
  });

  const handleRoomClick = (room: HotelRoom) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const toggleRoomStatus = () => {
    if (!selectedRoom) return;
    // For dining-only service, we don't need to toggle room occupancy status
    // This function can be repurposed or removed based on actual business needs
    alert('此系统专为客房送餐服务设计，房间占用状态不影响点餐功能。');
  };

  const handleSubmitOrder = async () => {
    if (!selectedRoom || cart.length === 0) return;

    setIsLoading(true);
    setLoadingText('正在提交订单...');

    try {
      // Simulate network request delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        tableNumber: selectedRoom.number, 
        source: 'ROOM_SERVICE',
        items: cart,
        status: OrderStatus.PENDING,
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        createdAt: new Date().toISOString(),
        notes: '客房点餐 Room Service'
      };
      
      onPlaceOrder(newOrder);

      const updateFn = (r: HotelRoom) => {
        if (r.id === selectedRoom.id) {
          const updatedOrders = [...r.orders];
          cart.forEach(cartItem => {
            const existing = updatedOrders.find(o => o.dishId === cartItem.dishId);
            if (existing) existing.quantity += cartItem.quantity;
            else updatedOrders.push(cartItem);
          });

          return {
            ...r,
            // 对于纯送餐服务，房间状态始终保持为Occupied以表示该房间有订单历史
            status: 'Occupied' as HotelRoomStatus,
            orders: updatedOrders,
            guestName: r.guestName || '点餐客人 Guest',
            lastOrderTime: new Date().toISOString()
          };
        }
        return r;
      };

      setRooms(prev => prev.map(updateFn));
      
      // Success feedback
      alert(`订单已发送至厨房！Order Sent!\n房号: ${selectedRoom.number}`);
      setCart([]); // 清空购物车而不是关闭模态框，允许继续点餐
    } catch (error) {
      console.error('Failed to submit order:', error);
      alert('订单提交失败，请重试。Order submission failed, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 shadow-2xl">
            <Loader2 className="animate-spin text-orange-600" size={32} />
            <p className="text-slate-700 font-medium">{loadingText}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Utensils className="text-orange-500" /> 客房餐饮服务
           </h2>
           <p className="text-slate-500 text-sm mt-1">为客房下单，订单将自动流转至后厨</p>
           <p className="text-slate-500 text-xs mt-1">房间号范围: 8201-8232 (2楼) 和 8301-8332 (3楼)</p>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
           <button 
             onClick={() => setActiveFloor(2)}
             className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeFloor === 2 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             2楼 / 2F (82xx)
           </button>
           <button 
             onClick={() => setActiveFloor(3)}
             className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeFloor === 3 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             3楼 / 3F (83xx)
           </button>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {sortedRooms.map(room => {
          const hasOrders = room.orders.length > 0;
          return (
            <button
              key={room.id}
              onClick={() => handleRoomClick(room)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all p-2
                ${hasOrders 
                  ? 'bg-orange-50 border-orange-500 text-orange-900 shadow-md' 
                  : room.status === 'Occupied' 
                    ? 'bg-blue-50 border-blue-300 text-blue-900' // Occupied but no orders yet
                    : 'bg-white border-slate-200 text-slate-400 hover:border-orange-300'
                }
              `}
            >
              <span className="text-lg font-bold">{room.number}</span>
              {hasOrders && (
                 <div className="mt-1 flex items-center gap-1 text-xs font-bold bg-white/50 px-2 py-0.5 rounded-full">
                    <Utensils size={10} />
                    <span>₱{room.orders.reduce((s, i) => s + i.price * i.quantity, 0)}</span>
                 </div>
              )}
              {room.status === 'Occupied' && !hasOrders && (
                <span className="text-[10px] mt-1 text-blue-500">有历史订单</span>
              )}
            </button>
          );
        })}
      </div>

      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div>
                 <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   Room {selectedRoom.number} 
                   <span className={`text-xs px-2 py-0.5 rounded border ${selectedRoom.status === 'Occupied' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                     {selectedRoom.status === 'Occupied' ? 'Occupied' : 'Vacant'}
                   </span>
                 </h3>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                 <X size={24} />
               </button>
            </div>

            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
               <div className="w-full md:w-1/3 bg-white border-r border-slate-100 flex flex-col">
                  
                  <div className="p-4 border-b border-slate-100">
                     <button 
                       onClick={toggleRoomStatus}
                       className={`w-full py-2 rounded-lg text-sm font-bold border flex items-center justify-center gap-2 transition-colors ${
                         selectedRoom.status === 'Occupied' 
                           ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50' 
                           : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                       }`}
                     >
                       <User size={16} />
                       房间状态说明
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 bg-orange-50/30">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <ChefHat size={16} /> New Order (待提交)
                    </h4>
                    {cart.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-xs border border-dashed border-slate-300 rounded-lg">
                        Select items from menu
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cart.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm">
                             <div>
                               <div className="text-slate-800 font-medium">{item.dishName}</div>
                               <div className="text-xs text-orange-600">₱{item.price} x {item.quantity}</div>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="font-bold">₱{item.price * item.quantity}</span>
                                <button onClick={() => removeFromCart(item.dishId)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between">
                      <span>历史订单总额</span>
                      <span>₱{roomTotal}</span>
                    </h4>
                    {selectedRoom.lastOrderTime && (
                      <p className="text-xs text-slate-400">
                        最近订单: {new Date(selectedRoom.lastOrderTime).toLocaleString('zh-CN')}
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-600 font-medium">Cart Total</span>
                        <span className="text-2xl font-bold text-orange-600">₱{cartTotal}</span>
                     </div>
                     <button 
                       onClick={handleSubmitOrder}
                       disabled={cartTotal === 0 || isLoading}
                       className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                     >
                       {isLoading ? (
                         <>
                           <Loader2 className="animate-spin" size={18} />
                           提交中...
                         </>
                       ) : (
                         <>
                           <Receipt size={18} /> Send to Kitchen
                         </>
                       )}
                     </button>
                  </div>
               </div>

               <div className="flex-1 bg-white p-4 overflow-y-auto">
                  <div className="mb-4">
                    <h4 className="font-bold text-slate-800">Menu 菜单</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                     {dishes.map(dish => (
                       <button
                         key={dish.id}
                         onClick={() => addToCart(dish)}
                         className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-400 transition-all text-left group flex flex-col h-full"
                       >
                          <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-2 relative shrink-0">
                            <ImageLazyLoad 
                              src={dish.imageUrl || '/placeholder-image.jpg'} 
                              alt={dish.name} 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <Plus className="text-white drop-shadow-md" size={24} />
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                             <div className="font-bold text-slate-800 text-sm line-clamp-1">{dish.name}</div>
                             <div className="text-orange-600 font-bold text-sm mt-1">₱{dish.price}</div>
                          </div>
                       </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelSystem;