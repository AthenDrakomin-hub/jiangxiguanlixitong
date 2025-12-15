import React, { useState, useEffect } from 'react';
import {
  Mic2,
  Users,
  Clock,
  PlayCircle,
  SkipForward,
  Music2,
  Power,
  Receipt,
  GlassWater,
  Utensils,
  CheckCircle2,
  X,
  Plus,
  User,
  Banknote,
  Smartphone,
  QrCode,
  CircleDollarSign,
  Wallet,
  ClipboardList,
} from 'lucide-react';
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
        total: 0,
      };
    }

    const start = new Date(room.currentSession.startTime).getTime();
    const now = currentTime.getTime();
    const durationHours = (now - start) / (1000 * 60 * 60);
    const chargeableHours = Math.max(1, Math.ceil(durationHours));
    const roomFee = chargeableHours * room.hourlyRate;
    const ordersFee = room.currentSession.orders.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    return {
      durationHours,
      roomFee,
      ordersFee,
      total: roomFee + ordersFee,
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

    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? {
              ...r,
              status: 'InUse',
              currentSession: {
                guestName: openRoomData.guestName,
                startTime: new Date().toISOString(),
                orders: [],
              },
              currentSong: 'Ready to play...',
            }
          : r
      )
    );

    setIsModalOpen(false);
  };

  const initiateCheckout = () => {
    setShowPaymentSelector(true);
  };

  const confirmCheckout = (method: PaymentMethod) => {
    if (!selectedRoom || !selectedRoom.currentSession) return;

    const bill = calculateTotal(selectedRoom);

    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoom.id
          ? {
              ...r,
              status: 'Cleaning',
              currentSession: undefined,
              currentSong: undefined,
            }
          : r
      )
    );

    alert(
      `Checkout Success!\nMethod: ${method}\nAmount: ₱${bill.total.toFixed(2)}`
    );
    setIsModalOpen(false);
  };

  const handleFinishCleaning = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: 'Available' } : r))
    );
    if (selectedRoom?.id === roomId) {
      setSelectedRoom((prev) =>
        prev ? { ...prev, status: 'Available' } : null
      );
    }
  };

  const handleAddOrder = (dish: Dish) => {
    if (!selectedRoom || !selectedRoom.currentSession) return;

    const updateOrders = (currentOrders: OrderItem[]) => {
      const existingItem = currentOrders.find((o) => o.dishId === dish.id);
      if (existingItem) {
        return currentOrders.map((o) =>
          o.dishId === dish.id ? { ...o, quantity: o.quantity + 1 } : o
        );
      } else {
        const newItem: OrderItem = {
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          quantity: 1,
        };
        return [...currentOrders, newItem];
      }
    };

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === selectedRoom.id && r.currentSession) {
          return {
            ...r,
            currentSession: {
              ...r.currentSession,
              orders: updateOrders(r.currentSession.orders),
            },
          };
        }
        return r;
      })
    );

    setSelectedRoom((prev) => {
      if (!prev || !prev.currentSession) return prev;
      return {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          orders: updateOrders(prev.currentSession.orders),
        },
      };
    });
  };

  const handleSkipSong = () => {
    if (!selectedRoom) return;
    const songs = [
      'Blue and White Porcelain',
      'Legend of Phoenix',
      'Ten Years',
      'Monica',
      'Last Dance',
      'Sunny Day',
      'King of Karaoke',
      'Boundless Sea & Sky',
      'Luxury Lady',
    ];
    const randomSong = songs[Math.floor(Math.random() * songs.length)];

    const updateRoom = (r: KTVRoom) =>
      r.id === selectedRoom.id ? { ...r, currentSong: randomSong } : r;

    setRooms((prev) => prev.map(updateRoom));
    setSelectedRoom((prev) =>
      prev ? { ...prev, currentSong: randomSong } : null
    );
  };

  // Fixed error: Category is now a type (string), so we use string literals
  const ktvMenu = dishes.filter(
    (d) =>
      d.category === '酒水' || d.category === '特色菜' || d.category === '凉菜'
  );

  const getStatusColor = (status: KTVRoom['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500 border-emerald-500 text-white';
      case 'InUse':
        return 'bg-purple-600 border-purple-600 text-white';
      case 'Cleaning':
        return 'bg-orange-500 border-orange-500 text-white';
      case 'Maintenance':
        return 'bg-slate-500 border-slate-500 text-white';
    }
  };

  const getStatusBadge = (status: KTVRoom['status']) => {
    switch (status) {
      case 'Available':
        return '空闲 Available';
      case 'InUse':
        return '使用中 In Use';
      case 'Cleaning':
        return '待清理 Cleaning';
      case 'Maintenance':
        return '维护中 Maint';
    }
  };

  // 产品备注: 定义支付方式选项，为icon字段指定明确的组件类型
  const paymentMethods: {
    id: PaymentMethod;
    label: string;
    enLabel: string;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
  }[] = [
    {
      id: 'CASH',
      label: '现金',
      enLabel: 'Cash',
      icon: Banknote,
      color: 'bg-green-100 text-green-700',
    },
    {
      id: 'ALIPAY',
      label: '支付宝',
      enLabel: 'AliPay',
      icon: Smartphone,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'WECHAT',
      label: '微信',
      enLabel: 'WeChat',
      icon: QrCode,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'USDT',
      label: 'USDT',
      enLabel: 'USDT',
      icon: CircleDollarSign,
      color: 'bg-teal-100 text-teal-600',
    },
    {
      id: 'GCASH',
      label: 'GCash',
      enLabel: 'GCash',
      icon: Wallet,
      color: 'bg-blue-500 text-white',
    },
    {
      id: 'MAYA',
      label: 'Maya',
      enLabel: 'Maya',
      icon: Wallet,
      color: 'bg-green-500 text-white',
    },
    {
      id: 'SIGN_BILL',
      label: '挂账',
      enLabel: 'Sign Bill',
      icon: ClipboardList,
      color: 'bg-yellow-100 text-yellow-700',
    },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20 md:pb-0">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <Mic2 className="text-purple-600" /> KTV 智能操控台 (Console)
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Room Management & Services
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500"></span> 空闲
            Avail
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-600"></span> 使用中
            In Use
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-400"></span> 待清理
            Cleaning
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => handleRoomClick(room)}
            className={`
              group relative cursor-pointer overflow-hidden rounded-xl border-2 shadow-sm transition-all hover:shadow-md
              ${room.status === 'Available' ? 'border-slate-200 bg-white hover:border-emerald-300' : ''}
              ${room.status === 'InUse' ? 'border-purple-200 bg-purple-50 hover:border-purple-300' : ''}
              ${room.status === 'Cleaning' ? 'border-orange-200 bg-orange-50 hover:border-orange-300' : ''}
              ${room.status === 'Maintenance' ? 'border-slate-200 bg-slate-100 opacity-60' : ''}
            `}
          >
            <div
              className={`absolute right-0 top-0 rounded-bl-xl px-3 py-1 text-xs font-bold ${getStatusColor(room.status)}`}
            >
              {getStatusBadge(room.status)}
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">
                  {room.name}
                </h3>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-400">
                  {room.type}
                </span>
              </div>

              <div className="min-h-[80px] space-y-3">
                {room.status === 'Available' && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 py-4 text-slate-400">
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
                      <span>
                        Used: {getRoomDuration(room.currentSession.startTime)}
                      </span>
                    </div>
                    <div className="flex w-fit items-center gap-2 rounded bg-purple-100 px-2 py-1 text-xs text-purple-600">
                      <Music2 size={12} />
                      <span className="max-w-[120px] truncate">
                        {room.currentSong}
                      </span>
                    </div>
                  </>
                )}

                {room.status === 'Cleaning' && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 py-4 text-slate-400">
                    <Utensils size={32} className="text-orange-200" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFinishCleaning(room.id);
                      }}
                      className="rounded-lg bg-orange-500 px-3 py-1 text-sm text-white hover:bg-orange-600"
                    >
                      完成清理 Done
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
              <span className="text-xs text-slate-500">
                Rate: ₱{room.hourlyRate}/h
              </span>
              {room.status === 'InUse' && (
                <span className="text-sm font-bold text-purple-600">
                  ₱{calculateTotal(room).total.toFixed(0)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-4 md:p-6">
              <div>
                <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  {selectedRoom.name}{' '}
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-sm font-normal text-slate-500">
                    {selectedRoom.type}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Rate 费率: ₱{selectedRoom.hourlyRate}/Hour
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6">
                {selectedRoom.status === 'Available' && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Power size={40} />
                    </div>
                    <h4 className="mb-2 text-2xl font-bold text-slate-800">
                      准备开台 Ready to Open
                    </h4>
                    <p className="mb-8 max-w-xs text-slate-500">
                      Enter guest name to start timer.
                    </p>

                    <div className="w-full max-w-sm space-y-4">
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={20}
                        />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Guest Name / 客人姓名"
                          value={openRoomData.guestName}
                          onChange={(e) =>
                            setOpenRoomData({ guestName: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <button
                        onClick={handleOpenRoom}
                        disabled={!openRoomData.guestName}
                        className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        立即开台 Open Session
                      </button>
                    </div>
                  </div>
                )}

                {selectedRoom.status === 'InUse' &&
                  selectedRoom.currentSession &&
                  !showPaymentSelector && (
                    <div className="flex flex-col gap-6 lg:h-full lg:flex-row">
                      <div className="shrink-0 space-y-4 lg:w-1/3">
                        <div className="rounded-xl bg-slate-900 p-5 text-white shadow-lg">
                          <div className="mb-4 flex items-center gap-3 opacity-80">
                            <Clock size={16} />
                            <span>
                              Duration 时长:{' '}
                              {getRoomDuration(
                                selectedRoom.currentSession.startTime
                              )}
                            </span>
                          </div>
                          <div className="mb-2 flex items-end justify-between">
                            <span className="text-slate-400">Total Total</span>
                            <span className="text-3xl font-bold">
                              ₱{calculateTotal(selectedRoom).total}
                            </span>
                          </div>
                          <div className="mt-2 flex justify-between border-t border-slate-700 pt-2 text-xs text-slate-500">
                            <span>
                              Room 房费: ₱{calculateTotal(selectedRoom).roomFee}
                            </span>
                            <span>
                              Items 酒水: ₱
                              {calculateTotal(selectedRoom).ordersFee}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-purple-100 bg-purple-50 p-5">
                          <h4 className="mb-3 flex items-center gap-2 font-bold text-purple-900">
                            <Music2 size={18} /> Playing 正在播放
                          </h4>
                          <div className="mb-3 flex items-center justify-between rounded-lg border border-purple-100 bg-white p-3">
                            <span className="font-medium text-slate-700">
                              {selectedRoom.currentSong}
                            </span>
                            <div className="flex gap-1">
                              <span className="h-4 w-1 animate-pulse rounded-full bg-purple-400"></span>
                              <span className="h-4 w-1 animate-pulse rounded-full bg-purple-400 delay-75"></span>
                              <span className="h-4 w-1 animate-pulse rounded-full bg-purple-400 delay-150"></span>
                            </div>
                          </div>
                          <button
                            onClick={handleSkipSong}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-200 py-2 text-sm font-bold text-purple-800 transition-colors hover:bg-purple-300"
                          >
                            <SkipForward size={16} /> Skip Song 切歌
                          </button>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold uppercase text-slate-500">
                            Orders ({selectedRoom.currentSession.orders.length})
                          </div>
                          <div className="max-h-48 overflow-y-auto p-2">
                            {selectedRoom.currentSession.orders.length === 0 ? (
                              <div className="py-4 text-center text-sm text-slate-400">
                                No items ordered
                              </div>
                            ) : (
                              selectedRoom.currentSession.orders.map(
                                (item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between border-b border-slate-50 p-2 text-sm last:border-0"
                                  >
                                    <span className="text-slate-700">
                                      {item.dishName} x{item.quantity}
                                    </span>
                                    <span className="font-medium text-slate-900">
                                      ₱{item.price * item.quantity}
                                    </span>
                                  </div>
                                )
                              )
                            )}
                          </div>
                        </div>

                        <button
                          onClick={initiateCheckout}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700"
                        >
                          <Receipt size={18} /> Checkout 结账
                        </button>
                      </div>

                      <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
                          <GlassWater size={18} /> Add Drinks/Snacks 加点酒水
                        </h4>
                        <div className="grid max-h-[400px] flex-1 grid-cols-2 gap-3 overflow-y-auto pr-1 md:grid-cols-3">
                          {ktvMenu.map((dish) => (
                            <button
                              key={dish.id}
                              onClick={() => handleAddOrder(dish)}
                              className="group flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-purple-400 hover:shadow-md"
                            >
                              <div className="relative aspect-video overflow-hidden rounded-md bg-slate-100">
                                <img
                                  src={dish.imageUrl}
                                  alt={dish.name}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                                  <Plus
                                    className="scale-0 text-white opacity-0 drop-shadow-md transition-all group-hover:scale-100 group-hover:opacity-100"
                                    size={24}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="line-clamp-1 text-sm font-bold text-slate-800">
                                  {dish.name}
                                </div>
                                <div className="text-sm font-bold text-purple-600">
                                  ₱{dish.price}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                {selectedRoom.status === 'InUse' && showPaymentSelector && (
                  <div className="py-6 text-center">
                    <button
                      onClick={() => setShowPaymentSelector(false)}
                      className="absolute left-6 top-6 flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-600"
                    >
                      &larr; Back 返回
                    </button>

                    <h3 className="mb-2 text-2xl font-bold text-slate-800">
                      收银台 Cashier - {selectedRoom.name}
                    </h3>
                    <p className="mb-8 text-slate-500">
                      Select Payment Method 选择支付方式
                    </p>

                    <div className="mb-10 text-5xl font-bold text-slate-900">
                      ₱{calculateTotal(selectedRoom).total.toFixed(0)}
                      <div className="mt-2 text-base font-normal text-slate-500">
                        参考价 Reference: ≈ ¥
                        {(calculateTotal(selectedRoom).total / 8.2).toFixed(1)}
                      </div>
                    </div>

                    <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            onClick={() => confirmCheckout(method.id)}
                            className={`flex flex-col items-center justify-center rounded-xl border-2 p-6 transition-all ${method.color} border-transparent shadow-sm hover:scale-[1.02] hover:border-slate-300`}
                          >
                            {/* 产品备注: 移除不支持的className属性，只传递size属性给Lucide图标组件 */}
                            <div className="mb-3 opacity-90">
                              <Icon size={32} />
                            </div>
                            <div className="text-center leading-tight">
                              <span className="block text-sm font-bold">
                                {method.label}
                              </span>
                              <span className="text-xs opacity-75">
                                {method.enLabel}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedRoom.status === 'Cleaning' && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      <Utensils size={40} />
                    </div>
                    <h4 className="mb-2 text-2xl font-bold text-slate-800">
                      Cleaning 房间清理中
                    </h4>
                    <p className="mb-8 text-slate-500">
                      Please arrange cleaning staff.
                    </p>
                    <button
                      onClick={() => {
                        handleFinishCleaning(selectedRoom.id);
                        setIsModalOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-slate-800 px-8 py-3 font-bold text-white transition-colors hover:bg-slate-900"
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
