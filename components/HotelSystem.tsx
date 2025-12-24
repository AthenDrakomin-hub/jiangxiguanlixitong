import React, { useState, useEffect } from 'react';
import {
  Utensils,
  X,
  Plus,
  User,
  Receipt,
  ChefHat,
  Loader2,
} from 'lucide-react';
import {
  HotelRoom,
  Dish,
  OrderItem,
  Order,
  OrderStatus,
} from '../types.js';
import ImageLazyLoad from './ImageLazyLoad';
import { apiClient } from '../services/apiClient.js';
import { auditLogger } from '../services/auditLogger.js';

interface HotelSystemProps {
  dishes: Dish[];
  onPlaceOrder: (newOrder: Order) => void;
  systemSettings: {
    exchangeRate: number;
  };
}

const HotelSystem: React.FC<HotelSystemProps> = ({
  dishes,
  onPlaceOrder,
}) => {
  const [activeFloor, setActiveFloor] = useState<number>(2);
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('加载中...');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 初始化房间数据
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await apiClient.fetchCollection<HotelRoom>('hotel_rooms');
        setRooms(fetchedRooms);
      } catch (err) {
        console.error('获取房间数据失败:', err);
        setError('获取房间数据失败');
      }
    };
    
    fetchRooms();
  }, []);

  // Filter rooms by active floor
  const displayRooms = rooms.filter((r: HotelRoom) => r.floor === activeFloor);

  // Add item to cart
  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.dishId === dish.id);
      if (existingItem) {
        return prev.map((item) =>
          item.dishId === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: dish.id,
            dishId: dish.id,
            name: dish.name,
            quantity: 1,
            price: dish.price,
          },
        ];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (dishId: string) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.dishId === dishId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) =>
          item.dishId === dishId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter((item) => item.dishId !== dishId);
      }
    });
  };

  // Calculate cart total
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate room total - since HotelRoom doesn't have an orders property, we'll calculate based on orders in the system
  const roomTotal = 0; // Placeholder - actual room total would need to come from orders associated with this room

  // Sort rooms by room number
  const sortedRooms = [...displayRooms].sort((a, b) => {
    return parseInt(a.roomNumber) - parseInt(b.roomNumber);
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
    setError(null);

    try {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        tableId: selectedRoom.roomNumber,
        items: cart,
        status: OrderStatus.PENDING,
        total: cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        paid: false,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roomNumber: selectedRoom.roomNumber,
      };

      // 创建订单
      await apiClient.create('orders', newOrder);
      onPlaceOrder(newOrder);

      // 更新房间状态
      const updatedRoom = {
        ...selectedRoom,
        status: 'occupied' as const,
        updatedAt: new Date().toISOString(),
      };

      await apiClient.update('hotel_rooms', selectedRoom.id, updatedRoom);

      setRooms((prev) =>
        prev.map((r) => (r.id === selectedRoom.id ? updatedRoom : r))
      );

      auditLogger.log(
        'info',
        'ROOM_ORDER',
        `客房点餐: ${selectedRoom.roomNumber} - ₱${newOrder.total}`,
        'admin'
      );

      setSuccessMessage(
        `订单已发送至厨房！Order Sent!
房号: ${selectedRoom.roomNumber}`
      );
      setCart([]);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to submit order:', error);
      setError(
        '订单提交失败，请重试。Order submission failed, please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative mx-auto min-h-screen max-w-md overflow-hidden bg-slate-50 pb-24 font-sans shadow-2xl">
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
      {successMessage && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 transform rounded-lg border border-green-200 bg-green-50 px-6 py-3 text-green-700 shadow-lg">
          <div className="flex items-center gap-2">
            <Receipt size={18} />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-2xl">
            <Loader2 className="animate-spin text-orange-600" size={32} />
            <p className="font-medium text-slate-700">{loadingText}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <Utensils className="text-orange-500" /> 客房餐饮服务
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            为客房下单，订单将自动流转至后厨
          </p>
          <p className="mt-1 text-xs text-slate-500">
            房间号范围: 8201-8232 (2楼) 和 8301-8332 (3楼)
          </p>
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setActiveFloor(2)}
            className={`rounded-md px-6 py-2 text-sm font-bold transition-all ${activeFloor === 2 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            2楼 / 2F (82xx)
          </button>
          <button
            onClick={() => setActiveFloor(3)}
            className={`rounded-md px-6 py-2 text-sm font-bold transition-all ${activeFloor === 3 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            3楼 / 3F (83xx)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {sortedRooms.map((room) => {
          const hasOrders = false; // Placeholder - actual implementation would check for orders associated with this room
          return (
            <button
              key={room.id}
              onClick={() => handleRoomClick(room)}
              className={`
                relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 p-2 transition-all
                ${
                  hasOrders
                    ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-md'
                    : room.status === 'occupied'
                      ? 'border-blue-300 bg-blue-50 text-blue-900' // Occupied but no orders yet
                      : 'border-slate-200 bg-white text-slate-400 hover:border-orange-300'
                }
              `}
            >
              <span className="text-lg font-bold">{room.roomNumber}</span>
              {hasOrders && (
                <div className="mt-1 flex items-center gap-1 rounded-full bg-white/50 px-2 py-0.5 text-xs font-bold">
                  <Utensils size={10} />
                  <span>
                    ₱{0} {/* Placeholder - actual amount would come from orders associated with this room */}
                  </span>
                </div>
              )}
              {room.status === 'occupied' && !hasOrders && (
                <span className="mt-1 text-[10px] text-blue-500">
                  有历史订单
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  Room {selectedRoom.roomNumber}
                  <span
                    className={`rounded border px-2 py-0.5 text-xs ${selectedRoom.status === 'occupied' ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}
                  >
                    {selectedRoom.status === 'occupied' ? 'Occupied' : 'Vacant'}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
              <div className="flex w-full flex-col border-r border-slate-100 bg-white md:w-1/3">
                <div className="border-b border-slate-100 p-4">
                  <button
                    onClick={toggleRoomStatus}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-bold transition-colors ${
                      selectedRoom.status === 'occupied'
                        ? 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                        : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <User size={16} />
                    房间状态说明
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-orange-50/30 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <ChefHat size={16} /> New Order (待提交)
                  </h4>
                  {cart.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 py-4 text-center text-xs text-slate-400">
                      Select items from menu
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded bg-white p-2 text-sm shadow-sm"
                        >
                          <div>
                            <div className="font-medium text-slate-800">
                              {item.name}
                            </div>
                            <div className="text-xs text-orange-600">
                              ₱{item.price} x {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">
                              ₱{item.price * item.quantity}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.dishId)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50 p-4">
                  <h4 className="mb-2 flex justify-between text-xs font-bold uppercase text-slate-500">
                    <span>历史订单总额</span>
                    <span>₱{roomTotal}</span>
                  </h4>
                  {/* {selectedRoom.lastOrderTime && (
                    <p className="text-xs text-slate-400">
                      最近订单:{' '}
                      {new Date(selectedRoom.lastOrderTime).toLocaleString(
                        'zh-CN'
                      )}
                    </p>
                  )} */}
                </div>

                <div className="z-10 border-t border-slate-100 bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium text-slate-600">
                      Cart Total
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₱{cartTotal}
                    </span>
                  </div>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={cartTotal === 0 || isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
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

              <div className="flex-1 overflow-y-auto bg-white p-4">
                <div className="mb-4">
                  <h4 className="font-bold text-slate-800">Menu 菜单</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {dishes.map((dish) => (
                    <button
                      key={dish.id}
                      onClick={() => addToCart(dish)}
                      className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:border-orange-400 hover:shadow-md"
                    >
                      <div className="relative mb-2 aspect-video shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <ImageLazyLoad
                          src={dish.image || '/placeholder-image.jpg'}
                          alt={dish.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100">
                          <Plus
                            className="text-white drop-shadow-md"
                            size={24}
                          />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="line-clamp-1 text-sm font-bold text-slate-800">
                          {dish.name}
                        </div>
                        <div className="mt-1 text-sm font-bold text-orange-600">
                          ₱{dish.price}
                        </div>
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