
import React, { useState, useEffect } from 'react';
import { Mic2, Users, Clock, PlayCircle, SkipForward, Music2, Power, Receipt, GlassWater, Utensils, CheckCircle2, X, Plus, User, Banknote, Smartphone, QrCode, CircleDollarSign, Wallet, ClipboardList } from 'lucide-react';
import { KTVRoom, Dish, OrderItem, PaymentMethod } from '../types';

interface KTVSystemProps {
  rooms: KTVRoom[];
  setRooms: React.Dispatch<React.SetStateAction<KTVRoom[]>>;
  dishes: Dish[];
}

const KTVSystem: React.FC<KTVSystemProps> = ({ rooms, setRooms, dishes }) => {
  const [selectedRoom, setSelectedRoom] = useState<KTVRoom | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  
  const [openRoomData, setOpenRoomData] = useState({ guestName: '' });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const calculateTotal = (room: KTVRoom) => {
    if (!room.currentSession) {
      return {
        durationHours: 0,
        roomFee: 0,
        ordersFee: 0,
        total: 0
      };
    }
    
    const start = new Date(room.currentSession.startTime).getTime();
    const now = currentTime.getTime();
    const durationHours = (now - start) / (1000 * 60 * 60);
    const chargeableHours = Math.max(1, Math.ceil(durationHours));
    const roomFee = chargeableHours * room.hourlyRate;
    const ordersFee = room.currentSession.orders.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return {
      durationHours,
      roomFee,
      ordersFee,
      total: roomFee + ordersFee
    };
  };

  const getRoomDuration = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = currentTime.getTime();
    const diffMs = Math.max(0, now - start);
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleRoomClick = (room: KTVRoom) => {
    setSelectedRoom(room);
    setOpenRoomData({ guestName: '' });
    setShowPaymentSelector(false);
    setIsModalOpen(true);
  };

  const handleOpenRoom = () => {
    if (!selectedRoom || !openRoomData.guestName) return;
    
    setRooms(prev => prev.map(r => r.id === selectedRoom.id ? {
      ...r,
      status: 'InUse',
      currentSession: {
        guestName: openRoomData.guestName,
        startTime: new Date().toISOString(),
        orders: []
      },
      currentSong: 'Ready to play...'
    } : r));
    
    setIsModalOpen(false);
  };

  const initiateCheckout = () => {
    setShowPaymentSelector(true);
  };

  const confirmCheckout = (method: PaymentMethod) => {
    if (!selectedRoom || !selectedRoom.currentSession) return;
    
    const bill = calculateTotal(selectedRoom);
    
    setRooms(prev => prev.map(r => r.id === selectedRoom.id ? {
      ...r,
      status: 'Cleaning',
      currentSession: undefined,
      currentSong: undefined
    } : r));
    
    alert(`Checkout Success!\nMethod: ${method}\nAmount: ₱${bill.total.toFixed(2)}`);
    setIsModalOpen(false);
  };

  const handleFinishCleaning = (roomId: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'Available' } : r));
    if (selectedRoom?.id === roomId) {
        setSelectedRoom(prev => prev ? { ...prev, status: 'Available' } : null);
    }
  };

  const handleAddOrder = (dish: Dish) => {
    if (!selectedRoom || !selectedRoom.currentSession) return;

    const updateOrders = (currentOrders: OrderItem[]) => {
      const existingItem = currentOrders.find(o => o.dishId === dish.id);
      if (existingItem) {
        return currentOrders.map(o => o.dishId === dish.id ? { ...o, quantity: o.quantity + 1 } : o);
      } else {
        const newItem: OrderItem = {
           dishId: dish.id,
           dishName: dish.name,
           price: dish.price,
           quantity: 1
        };
        return [...currentOrders, newItem];
      }
    };

    setRooms(prev => prev.map(r => {
      if (r.id === selectedRoom.id && r.currentSession) {
        return { ...r, currentSession: { ...r.currentSession, orders: updateOrders(r.currentSession.orders) } };
      }
      return r;
    }));

    setSelectedRoom(prev => {
        if (!prev || !prev.currentSession) return prev;
        return { ...prev, currentSession: { ...prev.currentSession, orders: updateOrders(prev.currentSession.orders) } };
    });
  };

  const handleSkipSong = () => {
    if (!selectedRoom) return;
    const songs = ['Blue and White Porcelain', 'Legend of Phoenix', 'Ten Years', 'Monica', 'Last Dance', 'Sunny Day', 'King of Karaoke', 'Boundless Sea & Sky', 'Luxury Lady'];
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    
    const updateRoom = (r: KTVRoom) => r.id === selectedRoom.id ? { ...r, currentSong: randomSong } : r;

    setRooms(prev => prev.map(updateRoom));
    setSelectedRoom(prev => prev ? { ...prev, currentSong: randomSong } : null);
  };

  // Fixed error: Category is now a type (string), so we use string literals
  const ktvMenu = dishes.filter(d => d.category === '酒水' || d.category === '特色菜' || d.category === '凉菜');

  const getStatusColor = (status: KTVRoom['status']) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500 border-emerald-500 text-white';
      case 'InUse': return 'bg-purple-600 border-purple-600 text-white';
      case 'Cleaning': return 'bg-orange-500 border-orange-500 text-white';
      case 'Maintenance': return 'bg-slate-500 border-slate-500 text-white';
    }
  };

  const getStatusBadge = (status: KTVRoom['status']) => {
      switch (status) {
      case 'Available': return '空闲 Available';
      case 'InUse': return '使用中 In Use';
      case 'Cleaning': return '待清理 Cleaning';
      case 'Maintenance': return '维护中 Maint';
    }
  };

  const paymentMethods: { id: PaymentMethod; label: string; enLabel: string; icon: any; color: string }[] = [
    { id: 'CASH', label: '现金', enLabel: 'Cash', icon: Banknote, color: 'bg-green-100 text-green-700' },
    { id: 'ALIPAY', label: '支付宝', enLabel: 'AliPay', icon: Smartphone, color: 'bg-blue-100 text-blue-600' },
    { id: 'WECHAT', label: '微信', enLabel: 'WeChat', icon: QrCode, color: 'bg-emerald-100 text-emerald-600' },
    { id: 'USDT', label: 'USDT', enLabel: 'USDT', icon: CircleDollarSign, color: 'bg-teal-100 text-teal-600' },
    { id: 'GCASH', label: 'GCash', enLabel: 'GCash', icon: Wallet, color: 'bg-blue-500 text-white' },
    { id: 'MAYA', label: 'Maya', enLabel: 'Maya', icon: Wallet, color: 'bg-green-500 text-white' },
    { id: 'SIGN_BILL', label: '挂账', enLabel: 'Sign Bill', icon: ClipboardList, color: 'bg-yellow-100 text-yellow-700' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Mic2 className="text-purple-600" /> KTV 智能操控台 (Console)
           </h2>
           <p className="text-slate-500 text-sm mt-1">Room Management & Services</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> 空闲 Avail</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-600"></span> 使用中 In Use</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-400"></span> 待清理 Cleaning</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {rooms.map(room => (
          <div 
            key={room.id}
            onClick={() => handleRoomClick(room)}
            className={`
              relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden group shadow-sm hover:shadow-md
              ${room.status === 'Available' ? 'border-slate-200 bg-white hover:border-emerald-300' : ''}
              ${room.status === 'InUse' ? 'border-purple-200 bg-purple-50 hover:border-purple-300' : ''}
              ${room.status === 'Cleaning' ? 'border-orange-200 bg-orange-50 hover:border-orange-300' : ''}
              ${room.status === 'Maintenance' ? 'border-slate-200 bg-slate-100 opacity-60' : ''}
            `}
          >
            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold ${getStatusColor(room.status)}`}>
               {getStatusBadge(room.status)}
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xl font-bold text-slate-800">{room.name}</h3>
                 <span className="text-xs text-slate-400 px-2 py-1 bg-slate-100 rounded-lg">{room.type}</span>
              </div>
              
              <div className="space-y-3 min-h-[80px]">
                {room.status === 'Available' && (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 py-4">
                      <PlayCircle size={32} className="text-emerald-200" />
                      <span className="text-sm">点击开台 Click to Open</span>
                   </div>
                )}

                {room.status === 'InUse' && room.currentSession && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users size={14} className="text-purple-500" />
                      <span>{room.currentSession.guestName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={14} className="text-purple-500" />
                      <span>Used: {getRoomDuration(room.currentSession.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded w-fit">
                      <Music2 size={12} />
                      <span className="truncate max-w-[120px]">{room.currentSong}</span>
                    </div>
                  </>
                )}

                {room.status === 'Cleaning' && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 py-4">
                     <Utensils size={32} className="text-orange-200" />
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleFinishCleaning(room.id); }}
                       className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
                     >
                       完成清理 Done
                     </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
               <span className="text-xs text-slate-500">Rate: ₱{room.hourlyRate}/h</span>
               {room.status === 'InUse' && (
                 <span className="text-sm font-bold text-purple-600">₱{calculateTotal(room).total.toFixed(0)}</span>
               )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
               <div>
                 <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                   {selectedRoom.name} <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{selectedRoom.type}</span>
                 </h3>
                 <p className="text-xs text-slate-400">Rate 费率: ₱{selectedRoom.hourlyRate}/Hour</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
                 <X size={20} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6">
                
                {selectedRoom.status === 'Available' && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                      <Power size={40} />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-2">准备开台 Ready to Open</h4>
                    <p className="text-slate-500 mb-8 max-w-xs">Enter guest name to start timer.</p>
                    
                    <div className="w-full max-w-sm space-y-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Guest Name / 客人姓名"
                          value={openRoomData.guestName}
                          onChange={e => setOpenRoomData({ guestName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                        />
                      </div>
                      <button
                        onClick={handleOpenRoom}
                        disabled={!openRoomData.guestName}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                      >
                        立即开台 Open Session
                      </button>
                    </div>
                  </div>
                )}

                {selectedRoom.status === 'InUse' && selectedRoom.currentSession && !showPaymentSelector && (
                  <div className="flex flex-col lg:flex-row gap-6 lg:h-full">
                    
                    <div className="lg:w-1/3 space-y-4 shrink-0">
                      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3 mb-4 opacity-80">
                           <Clock size={16} />
                           <span>Duration 时长: {getRoomDuration(selectedRoom.currentSession.startTime)}</span>
                        </div>
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-slate-400">Total Total</span>
                           <span className="text-3xl font-bold">₱{calculateTotal(selectedRoom).total}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex justify-between border-t border-slate-700 pt-2 mt-2">
                           <span>Room 房费: ₱{calculateTotal(selectedRoom).roomFee}</span>
                           <span>Items 酒水: ₱{calculateTotal(selectedRoom).ordersFee}</span>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                        <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                          <Music2 size={18} /> Playing 正在播放
                        </h4>
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-100 mb-3">
                           <span className="font-medium text-slate-700">{selectedRoom.currentSong}</span>
                           <div className="flex gap-1">
                             <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse"></span>
                             <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse delay-75"></span>
                             <span className="w-1 h-4 bg-purple-400 rounded-full animate-pulse delay-150"></span>
                           </div>
                        </div>
                        <button 
                          onClick={handleSkipSong}
                          className="w-full py-2 bg-purple-200 text-purple-800 rounded-lg hover:bg-purple-300 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                        >
                          <SkipForward size={16} /> Skip Song 切歌
                        </button>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                          Orders ({selectedRoom.currentSession.orders.length})
                        </div>
                        <div className="max-h-48 overflow-y-auto p-2">
                           {selectedRoom.currentSession.orders.length === 0 ? (
                             <div className="text-center py-4 text-slate-400 text-sm">No items ordered</div>
                           ) : (
                             selectedRoom.currentSession.orders.map((item, idx) => (
                               <div key={idx} className="flex justify-between items-center p-2 text-sm border-b border-slate-50 last:border-0">
                                 <span className="text-slate-700">{item.dishName} x{item.quantity}</span>
                                 <span className="font-medium text-slate-900">₱{item.price * item.quantity}</span>
                               </div>
                             ))
                           )}
                        </div>
                      </div>

                      <button 
                        onClick={initiateCheckout}
                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                      >
                        <Receipt size={18} /> Checkout 结账
                      </button>
                    </div>

                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col">
                       <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <GlassWater size={18} /> Add Drinks/Snacks 加点酒水
                       </h4>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1 max-h-[400px]">
                          {ktvMenu.map(dish => (
                            <button
                              key={dish.id}
                              onClick={() => handleAddOrder(dish)}
                              className="bg-white p-3 rounded-lg border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all text-left flex flex-col gap-2 group"
                            >
                               <div className="aspect-video bg-slate-100 rounded-md overflow-hidden relative">
                                 <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <Plus className="text-white opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all drop-shadow-md" size={24} />
                                 </div>
                               </div>
                               <div>
                                 <div className="font-bold text-slate-800 text-sm line-clamp-1">{dish.name}</div>
                                 <div className="text-purple-600 font-bold text-sm">₱{dish.price}</div>
                               </div>
                            </button>
                          ))}
                       </div>
                    </div>

                  </div>
                )}
                
                {selectedRoom.status === 'InUse' && showPaymentSelector && (
                  <div className="text-center py-6">
                    <button onClick={() => setShowPaymentSelector(false)} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium">
                       &larr; Back 返回
                    </button>
                    
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">收银台 Cashier - {selectedRoom.name}</h3>
                    <p className="text-slate-500 mb-8">Select Payment Method 选择支付方式</p>
                    
                    <div className="text-5xl font-bold text-slate-900 mb-10">
                      ₱{calculateTotal(selectedRoom).total.toFixed(0)}
                      <div className="text-base font-normal mt-2 text-slate-500">参考价 Reference: ≈ ¥{(calculateTotal(selectedRoom).total / 8.2).toFixed(1)}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        {paymentMethods.map(method => {
                           const Icon = method.icon;
                           return (
                             <button
                               key={method.id}
                               onClick={() => confirmCheckout(method.id)}
                               className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${method.color} border-transparent hover:border-slate-300 hover:scale-[1.02] shadow-sm`}
                             >
                                <Icon size={32} className="mb-3 opacity-90" />
                                <div className="text-center leading-tight">
                                  <span className="font-bold text-sm block">{method.label}</span>
                                  <span className="text-xs opacity-75">{method.enLabel}</span>
                                </div>
                             </button>
                           );
                        })}
                    </div>
                  </div>
                )}

                {selectedRoom.status === 'Cleaning' && (
                  <div className="flex flex-col items-center justify-center py-12">
                     <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-orange-600 animate-pulse">
                        <Utensils size={40} />
                     </div>
                     <h4 className="text-2xl font-bold text-slate-800 mb-2">Cleaning 房间清理中</h4>
                     <p className="text-slate-500 mb-8">Please arrange cleaning staff.</p>
                     <button
                        onClick={() => { handleFinishCleaning(selectedRoom.id); setIsModalOpen(false); }}
                        className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 size={20} />
                        Mark as Cleaned 标记清理完毕
                      </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KTVSystem;
