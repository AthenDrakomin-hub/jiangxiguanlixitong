
import React, { useState, useEffect } from 'react';
import { ClipboardList, ChefHat, Utensils, Rocket, Banknote, Smartphone, QrCode, CircleDollarSign, Wallet, CheckCircle2, Clock, Printer, XCircle, BedDouble, Mic2, Archive, Receipt } from 'lucide-react';
import { Order, OrderStatus, OrderSource, PaymentMethod } from '../types';
import { PrinterService } from '../services/printer';
import auditLogger from '../services/auditLogger';

interface OrderManagementProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ orders, setOrders }) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [newOrderNotification, setNewOrderNotification] = useState<{count: number, timestamp: number} | null>(null);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 默认每页20条记录
  
  // 检查是否有新订单
  useEffect(() => {
    if (orders && orders.length > 0) {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000; // 5分钟内
      const recentOrders = orders.filter(order => 
        new Date(order.createdAt).getTime() > fiveMinutesAgo
      );
      
      if (recentOrders.length > 0) {
        setNewOrderNotification({
          count: recentOrders.length,
          timestamp: Date.now()
        });
        
        // 5秒后隐藏通知
        const timer = setTimeout(() => {
          setNewOrderNotification(null);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    // 如果是要支付，先打开支付模态框
    if (newStatus === OrderStatus.PAID) {
      setActiveOrderId(orderId);
      setPaymentModalOpen(true);
      return;
    }
    
    // 记录订单状态变更日志
    const order = orders.find(o => o.id === orderId);
    if (order) {
      auditLogger.log('info', 'ORDER_STATUS_CHANGE', `订单 ${orderId} 状态从 ${order.status} 变更为 ${newStatus}`, 'admin');
    }
    
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const confirmPayment = (method: PaymentMethod) => {
    if (!activeOrderId) return;
    
    // 记录支付日志
    auditLogger.log('info', 'ORDER_PAYMENT', `订单 ${activeOrderId} 通过 ${method} 方式完成支付`, 'admin');
    
    setOrders(prev => prev.map(o => {
        if (o.id === activeOrderId) {
            // 逻辑：外卖 -> 立即完成。堂食 -> 已上菜（保留在桌/活跃列表）。
            const isTakeout = o.source === 'TAKEOUT';
            const nextStatus = isTakeout ? OrderStatus.COMPLETED : OrderStatus.SERVED;
            
            // 支付时自动打印小票
            const paidOrder = { ...o, status: nextStatus, paymentMethod: method };
            PrinterService.printOrder(paidOrder);

            return paidOrder;
        }
        return o;
    }));
    
    setPaymentModalOpen(false);
    setActiveOrderId(null);
  };

  const handlePrintBill = (order: Order) => {
    PrinterService.printOrder(order);
  };

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return { label: '待处理 Pending', tagalog: 'Naghihintay', color: 'text-orange-600 bg-orange-50 border-orange-200' };
      case OrderStatus.COOKING: return { label: '烹饪中 Cooking', tagalog: 'Nagluluto', color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case OrderStatus.SERVED: return { label: '已上菜 Served', tagalog: 'Nai-serve na', color: 'text-green-600 bg-green-50 border-green-200' };
      case OrderStatus.PAID: return { label: '已支付 Paid', tagalog: 'Bayad na', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case OrderStatus.COMPLETED: return { label: '已完成 Completed', tagalog: 'Tapos na', color: 'text-slate-600 bg-slate-100 border-slate-200' };
      case OrderStatus.CANCELLED: return { label: '已取消 Cancelled', tagalog: 'Kinansela', color: 'text-red-600 bg-red-50 border-red-200' };
      default: return { label: status, tagalog: '', color: 'text-slate-600' };
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

  // 计算分页数据
  const filteredOrders = (orders || []).filter(o => filterStatus === 'All' || o.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  // 分页计算
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

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
      {/* 新订单通知横幅 */}
      {newOrderNotification && (
        <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-bounce flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-ping absolute"></div>
          <span className="font-bold">新订单提醒</span>
          <span>收到 {newOrderNotification.count} 个新订单</span>
          <button 
            onClick={() => setNewOrderNotification(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-slate-700" /> Order Center 订单中心
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage Orders / Pamahalaan ang mga Order</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('All')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                filterStatus === 'All' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All / Lahat
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
        {paginatedOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700">暂无订单 No Orders</h3>
            <p className="text-slate-500 text-sm mt-1">No orders match your filters</p>
          </div>
        ) : (
          <>
            {paginatedOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md animate-fade-in">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  
                  {/* Header Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-lg font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                         {order.tableNumber}
                      </span>
                      {getSourceBadge(order.source)}
                      <div className={`flex flex-col border rounded px-2.5 py-0.5 ${getStatusConfig(order.status).color}`}>
                         <span className="text-xs font-bold leading-tight">{getStatusConfig(order.status).label}</span>
                         <span className="text-[10px] opacity-80 leading-tight">{getStatusConfig(order.status).tagalog}</span>
                      </div>
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
                      {(order.items || []).map((item, idx) => (
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
                      <span className="text-sm text-slate-500">Total Amount / Kabuuan</span>
                      <div className={`text-3xl font-bold ${order.paymentMethod ? 'text-emerald-600' : 'text-slate-800'}`}>
                        ₱{order.totalAmount}
                        {order.paymentMethod && <span className="text-xs ml-1 text-emerald-500 font-medium">(PAID)</span>}
                      </div>
                      <div className="text-xs text-slate-400">参考价 Reference: ≈ ¥{(order.totalAmount / 8.2).toFixed(1)}</div>
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
                              <Printer size={16} /> Print / i-Print
                            </button>
                            <button 
                              onClick={() => handleStatusChange(order.id, OrderStatus.COOKING)}
                              className="flex flex-col items-center justify-center w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium"><ChefHat size={16} /> Accept / Tanggapin</div>
                            </button>
                         </>
                      )}
                      
                      {/* 2. Cooking -> Served */}
                      {order.status === OrderStatus.COOKING && (
                        <button 
                          onClick={() => handleStatusChange(order.id, OrderStatus.SERVED)}
                          className="flex flex-col items-center justify-center w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 size={16} /> Serve / I-serve</div>
                        </button>
                      )}

                      {/* 3. Served -> Paid/Complete */}
                      {order.status === OrderStatus.SERVED && (
                        <>
                          {/* If not paid yet, show Pay button */}
                          {!order.paymentMethod ? (
                            <button 
                              onClick={() => handleStatusChange(order.id, OrderStatus.PAID)}
                              className="flex flex-col items-center justify-center w-full py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm shadow-slate-200"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium"><Banknote size={16} /> Pay / Magbayad</div>
                            </button>
                          ) : (
                            // If paid but still Served (Dine-in scenario), show Finish button
                            <button 
                              onClick={() => handleStatusChange(order.id, OrderStatus.COMPLETED)}
                              className="flex flex-col items-center justify-center w-full py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium"><Archive size={16} /> Complete / Tapusin</div>
                            </button>
                          )}
                        </>
                      )}

                      {/* Cancel Option */}
                      {(order.status === OrderStatus.PENDING || order.status === OrderStatus.COOKING) && (
                        <button 
                           onClick={() => {
                               if(confirm('Cancel order? 确定取消订单吗?')) handleStatusChange(order.id, OrderStatus.CANCELLED);
                           }}
                           className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium mt-2"
                        >
                          <XCircle size={16} /> Cancel / Kanselahin
                        </button>
                      )}
                      
                      {/* History Print (Served, Paid, Completed) */}
                      {(order.status === OrderStatus.SERVED || order.status === OrderStatus.PAID || order.status === OrderStatus.COMPLETED) && (
                         <button 
                           onClick={() => handlePrintBill(order)}
                           className="flex items-center justify-center gap-2 w-full py-2 text-slate-400 hover:text-slate-600 text-sm"
                         >
                           <Receipt size={14} /> Reprint / I-print muli
                         </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-slate-500">
                  显示第 {startIndex + 1} 到 {Math.min(startIndex + itemsPerPage, filteredOrders.length)} 条记录，
                  共 {filteredOrders.length} 条记录
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      currentPage === 1 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    上一页
                  </button>
                  
                  {/* 页码按钮 */}
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // 只显示当前页前后几页，避免页码过多
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 3 || 
                      pageNum === currentPage + 3
                    ) {
                      // 显示省略号
                      return (
                        <span key={pageNum} className="px-3 py-1.5 text-slate-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      currentPage === totalPages 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Selection Modal - Bilingual */}
      {paymentModalOpen && activeOrderId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Banknote className="text-emerald-600" /> Cashier / Kahera
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
                <p className="text-slate-500 text-sm mb-1">Total Due / Kabuuang Bayarín</p>
                <div className="text-4xl font-bold text-slate-800">
                  ₱{orders.find(o => o.id === activeOrderId)?.totalAmount}
                </div>
              </div>

              <p className="text-sm font-bold text-slate-700 mb-3">Select Payment Method / Pumili ng Paraan ng Pagbabayad</p>
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
