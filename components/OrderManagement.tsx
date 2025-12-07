
import React, { useState } from 'react';
import { Clock, CheckCircle2, ChefHat, Banknote, XCircle, Search, Filter, ClipboardList, BellPlus, Printer, Receipt, BedDouble, Utensils, Rocket, Mic2, QrCode, Smartphone, CreditCard, Wallet, CircleDollarSign, ShoppingBasket } from 'lucide-react';
import { Order, OrderStatus, OrderSource, PaymentMethod } from '../types';

interface OrderManagementProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ orders, setOrders }) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    // If trying to pay, open payment modal first
    if (newStatus === OrderStatus.PAID) {
      setActiveOrderId(orderId);
      setPaymentModalOpen(true);
      return;
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const confirmPayment = (method: PaymentMethod) => {
    if (!activeOrderId) return;
    setOrders(prev => prev.map(o => o.id === activeOrderId ? { ...o, status: OrderStatus.PAID, paymentMethod: method } : o));
    setPaymentModalOpen(false);
    setActiveOrderId(null);
  };

  const handlePrintBill = (order: Order) => {
    alert(`Printing Bill / 正在打印小票 #${order.id}\n\nTable: ${order.tableNumber}\nAmount: ₱${order.totalAmount}\n\n(Simulated Printer Command Sent)`);
  };

  const handleSimulateOrder = () => {
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      tableNumber: ['A1', 'A2', 'B1', 'C3', 'VIP1'][Math.floor(Math.random() * 5)],
      source: 'LOBBY',
      items: [
        { dishId: '99', dishName: 'Test Item / 测试菜品', quantity: 1, price: 500 }
      ],
      status: OrderStatus.PENDING,
      totalAmount: 500,
      createdAt: new Date().toISOString(),
      notes: 'System Test Order'
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return { label: '待处理 Pending', color: 'text-orange-600 bg-orange-50 border-orange-200' };
      case OrderStatus.COOKING: return { label: '烹饪中 Cooking', color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case OrderStatus.SERVED: return { label: '已上菜 Served', color: 'text-green-600 bg-green-50 border-green-200' };
      case OrderStatus.PAID: return { label: '已支付 Paid', color: 'text-slate-600 bg-slate-100 border-slate-200' };
      case OrderStatus.CANCELLED: return { label: '已取消 Cancelled', color: 'text-red-600 bg-red-50 border-red-200' };
      default: return { label: status, color: 'text-slate-600' };
    }
  };

  const getSourceBadge = (source: OrderSource) => {
    switch (source) {
      case 'ROOM_SERVICE': return <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold"><BedDouble size={12} /> 客房 Room</span>;
      case 'KTV': return <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold"><Mic2 size={12} /> KTV</span>;
      case 'TAKEOUT': return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold"><Rocket size={12} /> 外卖 Takeout</span>;
      default: return <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold"><Utensils size={12} /> 堂食 Dine-in</span>;
    }
  };

  const filteredOrders = orders.filter(o => filterStatus === 'All' || o.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Payment methods configuration
  const paymentMethods: { id: PaymentMethod; label: string; enLabel: string; icon: any; color: string }[] = [
    { id: 'CASH', label: '现金', enLabel: 'Cash', icon: Banknote, color: 'bg-green-100 text-green-700' },
    { id: 'ALIPAY', label: '支付宝', enLabel: 'Alipay', icon: Smartphone, color: 'bg-blue-100 text-blue-600' },
    { id: 'WECHAT', label: '微信支付', enLabel: 'WeChat', icon: QrCode, color: 'bg-emerald-100 text-emerald-600' },
    { id: 'USDT', label: 'USDT', enLabel: 'Crypto', icon: CircleDollarSign, color: 'bg-teal-100 text-teal-600' },
    { id: 'GCASH', label: 'GCash', enLabel: 'GCash', icon: Wallet, color: 'bg-blue-500 text-white' },
    { id: 'MAYA', label: 'Maya', enLabel: 'Maya', icon: Wallet, color: 'bg-green-500 text-white' },
    { id: 'SIGN_BILL', label: '挂账/签单', enLabel: 'Sign Bill', icon: ClipboardList, color: 'bg-yellow-100 text-yellow-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <ClipboardList className="text-slate-700" /> 订单中心
           </h2>
           <p className="text-slate-500 text-sm mt-1">处理所有餐饮订单 / Manage Orders</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleSimulateOrder}
            className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors border border-slate-200 shadow-sm"
          >
            <BellPlus size={16} />
            <span>模拟测试</span>
          </button>

          <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto">
             <button
                onClick={() => setFilterStatus('All')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  filterStatus === 'All' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
             >
                全部 All
             </button>
             {Object.values(OrderStatus).map((status) => {
               const conf = getStatusConfig(status as OrderStatus);
               return (
                 <button
                   key={status}
                   onClick={() => setFilterStatus(status as OrderStatus | 'All')}
                   className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                     filterStatus === status 
                       ? 'bg-slate-900 text-white shadow-sm' 
                       : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                   }`}
                 >
                   {conf.label.split(' ')[1]} 
                 </button>
               );
             })}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">暂无订单 No Orders</h3>
            <p className="text-slate-500">当前没有需要处理的订单</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusConf = getStatusConfig(order.status);
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md animate-fade-in">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  
                  {/* Header Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-lg font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                         {order.tableNumber}
                      </span>
                      {getSourceBadge(order.source)}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConf.color}`}>
                        {statusConf.label}
                      </span>
                      {order.paymentMethod && (
                        <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                          <CheckCircle2 size={10} /> {order.paymentMethod}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto lg:ml-0">#{order.id.slice(-6)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <Clock size={14} />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-2 max-w-2xl">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-1 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold min-w-[2rem] text-center">x{item.quantity}</span>
                            <span className="text-slate-700 font-medium">{item.dishName}</span>
                          </div>
                          <span className="text-slate-500">₱{item.price * item.quantity}</span>
                        </div>
                      ))}
                      {order.notes && (
                        <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100 flex gap-2">
                          <span className="font-bold shrink-0">备注 Note:</span> 
                          <span>{order.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Total */}
                  <div className="flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
                    <div className="text-right mb-4">
                      <span className="text-sm text-slate-500">Total Amount 总额</span>
                      <div className="text-3xl font-bold text-slate-800">₱{order.totalAmount}</div>
                      <div className="text-xs text-slate-400">≈ ¥{(order.totalAmount / 8.2).toFixed(1)}</div>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      {/* Workflow Buttons - Bilingual */}
                      
                      {/* 1. Receive & Print (Pending) */}
                      {order.status === OrderStatus.PENDING && (
                         <>
                           <button 
                              onClick={() => handlePrintBill(order)}
                              className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                            >
                              <Printer size={16} /> 打印 Print
                            </button>
                            <button 
                              onClick={() => handleStatusChange(order.id, OrderStatus.COOKING)}
                              className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-200"
                            >
                              <ChefHat size={16} /> 接单 Accept
                            </button>
                         </>
                      )}
                      
                      {/* 2. Cooking -> Served */}
                      {order.status === OrderStatus.COOKING && (
                        <button 
                          onClick={() => handleStatusChange(order.id, OrderStatus.SERVED)}
                          className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm shadow-emerald-200"
                        >
                          <CheckCircle2 size={16} /> 上菜 Serve
                        </button>
                      )}

                      {/* 3. Served -> Paid */}
                      {order.status === OrderStatus.SERVED && (
                        <button 
                          onClick={() => handleStatusChange(order.id, OrderStatus.PAID)}
                          className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium shadow-sm shadow-slate-200"
                        >
                          <Banknote size={16} /> 收款 Pay
                        </button>
                      )}

                      {/* Cancel Option */}
                      {(order.status === OrderStatus.PENDING || order.status === OrderStatus.COOKING) && (
                        <button 
                           onClick={() => handleStatusChange(order.id, OrderStatus.CANCELLED)}
                           className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium mt-2"
                        >
                          <XCircle size={16} /> 取消 Cancel
                        </button>
                      )}
                      
                      {/* History Print */}
                      {(order.status === OrderStatus.SERVED || order.status === OrderStatus.PAID) && (
                         <button 
                           onClick={() => handlePrintBill(order)}
                           className="flex items-center justify-center gap-2 w-full py-2 text-slate-400 hover:text-slate-600 text-sm"
                         >
                           <Receipt size={14} /> 补打 Reprint
                         </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Selection Modal - Bilingual */}
      {paymentModalOpen && activeOrderId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Banknote className="text-emerald-600" /> 收银台 Cashier
              </h3>
              <button 
                onClick={() => setPaymentModalOpen(false)}
                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-slate-500 text-sm mb-1">应收金额 Total Due</p>
                <div className="text-4xl font-bold text-slate-800">
                  ₱{orders.find(o => o.id === activeOrderId)?.totalAmount}
                </div>
              </div>

              <p className="text-sm font-bold text-slate-700 mb-3">选择支付方式 Select Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => confirmPayment(method.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${method.color} border-transparent hover:border-slate-300 hover:scale-[1.02] hover:shadow-sm`}
                    >
                      <Icon size={28} className="mb-2 opacity-90" />
                      <div className="text-center leading-tight">
                        <span className="font-bold text-sm block">{method.label}</span>
                        <span className="text-xs opacity-75">{method.enLabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderManagement;
