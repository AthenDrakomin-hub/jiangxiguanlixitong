import React, { useState, useEffect } from 'react';
import {
  Utensils,
  X,
  Plus,
  User,
  Receipt,
  ChefHat,
  Loader2,
  Mic2,
  CreditCard,
} from 'lucide-react';
import {
  HotelRoom,
  Dish,
  OrderItem,
  Order,
  OrderStatus,
  PartnerAccount,
} from '../types.js';
import { formatCurrency } from '../utils/i18n.js';
import ImageLazyLoad from './ImageLazyLoad';
import { apiClient } from '../services/apiClient.js';
import { auditLogger } from '../services/auditLogger.js';
import { t } from '../utils/i18n.js';

interface HotelSystemProps {
  dishes: Dish[];
  orders: Order[]; // 添加订单数据
  onPlaceOrder: (newOrder: Order) => void;
  systemSettings: {
    exchangeRate: number;
  };
}

const HotelSystem: React.FC<HotelSystemProps> = ({
  dishes,
  orders = [],
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
  const [partnerAccounts, setPartnerAccounts] = useState<PartnerAccount[]>([]);
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PartnerAccount | null>(null);
  const [isProcessingCharge, setIsProcessingCharge] = useState(false);

  // 初始化房间数据和合作伙伴账户数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 获取房间数据
        const fetchedRooms = await apiClient.fetchCollection<HotelRoom>('hotel_rooms');
        
        // 生成默认的客房房间（8201-8232 和 8301-8332）
        const defaultRooms: HotelRoom[] = [];
        
        // 生成2楼房间 (8201-8232)
        for (let i = 1; i <= 32; i++) {
          const roomNumber = `82${i.toString().padStart(2, '0')}`;
          const existingRoom = fetchedRooms.find(r => r.roomNumber === roomNumber);
          
          if (existingRoom) {
            defaultRooms.push({
              ...existingRoom,
              status: 'vacant'
            });
          } else {
            defaultRooms.push({
              id: `room-${roomNumber}`,
              roomNumber: roomNumber,
              floor: 2,
              status: 'vacant', // 简化为vacant（空闲，无餐饮订单）
              type: 'standard',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
        
        // 生成3楼房间 (8301-8332)
        for (let i = 1; i <= 32; i++) {
          const roomNumber = `83${i.toString().padStart(2, '0')}`;
          const existingRoom = fetchedRooms.find(r => r.roomNumber === roomNumber);
          
          if (existingRoom) {
            defaultRooms.push({
              ...existingRoom,
              status: 'vacant'
            });
          } else {
            defaultRooms.push({
              id: `room-${roomNumber}`,
              roomNumber: roomNumber,
              floor: 3,
              status: 'vacant', // 简化为vacant（空闲，无餐饮订单）
              type: 'standard',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
        
        // 添加特殊房间
        const specialRooms: HotelRoom[] = [
          {
            id: 'vip-mudan',
            roomNumber: '牡丹', // 4楼包间吃饭
            floor: 4,
            status: 'vacant', // 简化为vacant（空闲，无餐饮订单）
            type: 'dining-vip',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'vip-lianhua',
            roomNumber: '莲花', // 4楼包间吃饭
            floor: 4,
            status: 'vacant', // 简化为vacant（空闲，无餐饮订单）
            type: 'dining-vip',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'vip-xingguang',
            roomNumber: '星光', // KTV包间
            floor: 4, // KTV楼层
            status: 'vacant', // 简化为vacant（空闲，无餐饮订单）
            type: 'ktv',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
        
        // 合并所有房间
        const allRooms = [...defaultRooms, ...specialRooms];
        setRooms(allRooms);
        
        // 获取合作伙伴账户数据
        const fetchedPartnerAccounts = await apiClient.fetchCollection<PartnerAccount>('partner_accounts');
        setPartnerAccounts(fetchedPartnerAccounts);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败');
        
        // 如果API失败，生成默认房间
        const defaultRooms: HotelRoom[] = [];
        
        // 生成2楼房间 (8201-8232)
        for (let i = 1; i <= 32; i++) {
          const roomNumber = `82${i.toString().padStart(2, '0')}`;
          defaultRooms.push({
            id: `room-${roomNumber}`,
            roomNumber: roomNumber,
            floor: 2,
            status: 'vacant', // 简化为vacant（空闲，无餐饮订单）
            type: 'standard',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        
        // 生成3楼房间 (8301-8332)
        for (let i = 1; i <= 32; i++) {
          const roomNumber = `83${i.toString().padStart(2, '0')}`;
          defaultRooms.push({
            id: `room-${roomNumber}`,
            roomNumber: roomNumber,
            floor: 3,
            status: 'vacant', // 简化为vacant（空闲，无餐饮订单）
            type: 'standard',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        
        // 添加特殊房间
        const specialRooms: HotelRoom[] = [
          {
            id: 'vip-mudan',
            roomNumber: '牡丹',
            floor: 4,
            status: 'vacant', // 简化为vacant（空闲，无餐饮订单）
            type: 'dining-vip',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'vip-lianhua',
            roomNumber: '莲花',
            floor: 4,
            status: 'vacant', // 简化为vacant（空闲，无餐饮订单）
            type: 'dining-vip',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'vip-xingguang',
            roomNumber: '星光',
            floor: 4,
            status: 'vacant', // 简化为vacant（空闲，无餐饮订单）
            type: 'ktv',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
        
        const allRooms = [...defaultRooms, ...specialRooms];
        setRooms(allRooms);
        
        // 设置空的合作伙伴账户数组
        setPartnerAccounts([]);
      }
    };
    
    initializeData();
  }, []);

  // Filter rooms by active floor (0 for KTV, 2 for 82xx, 3 for 83xx, 4 for VIP dining)
  const displayRooms = rooms.filter((r: HotelRoom) => {
    return r.floor === activeFloor;
  });

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
    // For standard rooms, sort by number
    const aNum = parseInt(a.roomNumber.replace(/\D/g, '')) || 0;
    const bNum = parseInt(b.roomNumber.replace(/\D/g, '')) || 0;
    return aNum - bNum;
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

  // 处理挂账功能
  const handleChargeToAccount = async () => {
    if (!selectedRoom || cart.length === 0 || !selectedAccount) return;

    setIsProcessingCharge(true);
    setLoadingText(t('正在处理挂账...'));
    setError(null);

    try {
      // 创建订单，标记为挂账
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
        paymentMethod: `挂账-${selectedAccount.name_en}`, // 标记为挂账
      };

      // 创建订单
      await apiClient.create('orders', newOrder);
      onPlaceOrder(newOrder);

      // 更新合作伙伴账户的当前欠款
      const updatedAccount = {
        ...selectedAccount,
        current_balance: selectedAccount.current_balance + newOrder.total,
        updatedAt: new Date().toISOString(),
      };

      await apiClient.update('partner_accounts', selectedAccount.id, updatedAccount);
      
      // 更新本地状态
      setPartnerAccounts(prev => 
        prev.map(acc => acc.id === selectedAccount.id ? updatedAccount : acc)
      );

      auditLogger.log(
        'info',
        'CHARGE_TO_ACCOUNT',
        `${t('挂账订单')}: ${selectedAccount.name_cn} - ₱${newOrder.total}`,
        'staff'
      );

      setSuccessMessage(
        `${t('挂账成功！')}!
${t('单位')}: ${selectedAccount.name_cn}
${t('金额')}: ₱${newOrder.total}`
      );
      setCart([]);
      setSelectedAccount(null);
      setIsAccountSelectorOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to charge to account:', error);
      setError(
        `${t('挂账失败，请重试。')}`
      );
    } finally {
      setIsProcessingCharge(false);
    }
  };

  // 处理普通订单提交
  const handleSubmitOrder = async () => {
    if (!selectedRoom || cart.length === 0) return;

    setIsLoading(true);
    setLoadingText(t('正在提交订单...'));
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

      // 注意：在餐饮服务模式下，我们不改变房间的数据库状态
      // 房间状态将通过订单状态来动态判断

      auditLogger.log(
        'info',
        'ROOM_ORDER',
        `${t('客房点餐')}: ${selectedRoom.roomNumber} - ₱${newOrder.total}`,
        'admin'
      );

      setSuccessMessage(
        `${t('订单已发送至厨房！')}!
${t('房号')}: ${selectedRoom.roomNumber}`
      );
      setCart([]);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to submit order:', error);
      setError(
        `${t('订单提交失败，请重试。')} ${t('Order submission failed, please try again.')}`
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
            <Utensils className="text-orange-500" /> {t('hotel')}服务
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('为客房下单，订单将自动流转至后厨')}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t('房间号范围: 8201-8232 (2楼) 和 8301-8332 (3楼)')}
          </p>
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setActiveFloor(2)}
            className={`rounded-md px-3 py-2 text-sm font-bold transition-all ${activeFloor === 2 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            2F (82xx)
          </button>
          <button
            onClick={() => setActiveFloor(3)}
            className={`rounded-md px-3 py-2 text-sm font-bold transition-all ${activeFloor === 3 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            3F (83xx)
          </button>
          <button
            onClick={() => setActiveFloor(4)}
            className={`rounded-md px-3 py-2 text-sm font-bold transition-all ${activeFloor === 4 ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            4F (KTV/VIP)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {sortedRooms.map((room) => {
          // 检查此房间是否有进行中的订单
          const hasPendingOrders = orders.some(order => 
            order.roomNumber === room.roomNumber && 
            (order.status === OrderStatus.PENDING || 
             order.status === OrderStatus.COOKING || 
             order.status === OrderStatus.READY)
          );
          
          // Determine room type and styling
          let roomClass = '';
          let icon = null;
          
          if (room.type === 'dining-vip') {
            // VIP dining rooms get special styling with utensils icon
            roomClass = hasPendingOrders 
              ? 'bg-rose-200 border-rose-500 text-rose-900' 
              : 'bg-rose-100 border-rose-400 text-rose-900';
            icon = <Utensils size={16} className="text-rose-600" />;
          } else {
            // Regular rooms (including former KTV rooms)
            roomClass = hasPendingOrders
              ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-md'
              : 'border-slate-200 bg-white text-slate-400 hover:border-orange-300';
          }
          
          return (
            <button
              key={room.id}
              onClick={() => handleRoomClick(room)}
              className={`
                relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 p-2 transition-all
                ${roomClass}
              `}
            >
              {(room.type === 'dining-vip') && icon}
              <span className="text-lg font-bold">{room.type === 'standard' ? `${t('Kuwarto')} ${room.roomNumber}` : room.roomNumber}</span>
              {hasPendingOrders && (
                <div className="mt-1 flex items-center gap-1 rounded-full bg-white/50 px-2 py-0.5 text-xs font-bold">
                  <Utensils size={10} />
                  <span>
                    ₱{orders
                      .filter(order => order.roomNumber === room.roomNumber && 
                              (order.status === OrderStatus.PENDING || 
                               order.status === OrderStatus.COOKING || 
                               order.status === OrderStatus.READY))
                      .reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </span>
                </div>
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
                  {selectedRoom.type === 'vip' ? selectedRoom.roomNumber : `${t('Kuwarto')} ${selectedRoom.roomNumber}`}
                  <span
                    className={`rounded border px-2 py-0.5 text-xs ${selectedRoom.status === 'occupied' ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}
                  >
                    {selectedRoom.status === 'occupied' ? t('Occupied') : t('Vacant')}
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
                              {formatCurrency(item.price, 'PHP')} x {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">
                              {formatCurrency(item.price * item.quantity, 'PHP')}
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
                    <span>{formatCurrency(roomTotal, 'PHP')}</span>
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
                      {formatCurrency(cartTotal, 'PHP')}
                    </span>
                  </div>
                  
                  {/* 挂账账户选择器 */}
                  {isAccountSelectorOpen && (
                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-bold text-slate-800">{t('选择挂账单位')}</h4>
                        <button 
                          onClick={() => setIsAccountSelectorOpen(false)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className="max-h-40 overflow-y-auto">
                        {partnerAccounts.map((account) => (
                          <div
                            key={account.id}
                            onClick={() => setSelectedAccount(account)}
                            className={`mb-2 cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedAccount?.id === account.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className="font-medium text-slate-800">{account.name_en}</div>
                            <div className="text-sm text-slate-600">{account.name_cn}</div>
                            <div className="text-xs text-slate-500">
                              {t('当前欠款')}: {formatCurrency(account.current_balance, 'PHP')} / {formatCurrency(account.credit_limit, 'PHP')}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {selectedAccount && (
                        <button
                          onClick={handleChargeToAccount}
                          disabled={isProcessingCharge}
                          className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {isProcessingCharge ? (
                            <>
                              <Loader2 className="mr-2 inline animate-spin" size={16} />
                              {t('处理中...')}
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 inline" size={16} />
                              {t('确认挂账')} - {formatCurrency(cartTotal, 'PHP')}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* 主要操作按钮 */}
                  <div className="space-y-2">
                    <button
                      onClick={handleSubmitOrder}
                      disabled={cartTotal === 0 || isLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          {t('提交中...')}
                        </>
                      ) : (
                        <>
                          <Receipt size={18} /> {t('Send to Kitchen')}
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setIsAccountSelectorOpen(true)}
                      disabled={cartTotal === 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2 font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CreditCard size={16} /> {t('挂账')}
                    </button>
                  </div>
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
                          {formatCurrency(dish.price, 'PHP')}
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