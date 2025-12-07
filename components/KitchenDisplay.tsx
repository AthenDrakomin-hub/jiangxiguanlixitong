import React from 'react';
import { ChefHat, Clock, CheckCircle2, AlertTriangle, LogOut } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface KitchenDisplayProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onBack: () => void;
}

interface KitchenOrderCardProps {
  order: Order;
  nextStatus: OrderStatus;
  buttonText: string;
  colorClass: string;
  onStatusChange: (id: string, status: OrderStatus) => void;
}

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, nextStatus, buttonText, colorClass, onStatusChange }) => {
  const getElapsedTime = (dateString: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
    return `${minutes} min`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border-l-4 border-l-transparent overflow-hidden flex flex-col h-full animate-fade-in" style={{ borderLeftColor: colorClass }}>
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
           <span className="text-2xl font-bold text-slate-800">#{order.tableNumber}</span>
           <span className="text-xs text-slate-500 block">ID: {order.id.slice(-4)}</span>
        </div>
        <div className="text-right">
           <div className={`font-mono font-bold ${getElapsedTime(order.createdAt).includes('min') && parseInt(getElapsedTime(order.createdAt)) > 15 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
             {getElapsedTime(order.createdAt)}
           </div>
           <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
         {order.items.map((item, idx) => (
           <div key={idx} className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 last:border-0">
             <span className="text-lg font-bold text-slate-800">{item.dishName}</span>
             <span className="text-xl font-bold bg-slate-100 px-3 py-1 rounded text-slate-700">x{item.quantity}</span>
           </div>
         ))}
         {order.notes && (
           <div className="mt-3 bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-100 font-bold flex gap-2 items-start">
             <AlertTriangle size={20} className="shrink-0 mt-0.5" />
             {order.notes}
           </div>
         )}
      </div>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={() => onStatusChange(order.id, nextStatus)}
          className={`w-full py-4 rounded-lg font-bold text-white text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${
            nextStatus === OrderStatus.COOKING ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {buttonText} {nextStatus === OrderStatus.COOKING ? <ChefHat size={24} /> : <CheckCircle2 size={24} />}
        </button>
      </div>
    </div>
  );
};

const KitchenDisplay: React.FC<KitchenDisplayProps> = ({ orders, onStatusChange, onBack }) => {
  // Filter only active orders for kitchen
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const cookingOrders = orders.filter(o => o.status === OrderStatus.COOKING).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
       <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
             <ChefHat size={32} /> 后厨显示系统 (KDS)
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-white/80 font-mono text-xl">
                {new Date().toLocaleTimeString()}
             </div>
             <button 
               onClick={onBack}
               className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
             >
               <LogOut size={18} />
               <span>退出 / Exit</span>
             </button>
          </div>
       </div>

       <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
          {/* Column 1: Pending */}
          <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col border border-slate-700/50">
             <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span> 待制作 (Pending)
                </h3>
                <span className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-bold">{pendingOrders.length}</span>
             </div>
             <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {pendingOrders.map(order => (
                   <KitchenOrderCard 
                      key={order.id} 
                      order={order} 
                      nextStatus={OrderStatus.COOKING} 
                      buttonText="开始制作" 
                      colorClass="#f97316"
                      onStatusChange={onStatusChange}
                   />
                ))}
                {pendingOrders.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                      <Clock size={64} />
                      <p className="mt-4 text-xl">暂无待制作订单</p>
                   </div>
                )}
             </div>
          </div>

          {/* Column 2: Cooking */}
          <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col border border-slate-700/50">
             <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <span className="w-3 h-3 bg-blue-500 rounded-full"></span> 制作中 (Cooking)
                </h3>
                <span className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-bold">{cookingOrders.length}</span>
             </div>
             <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cookingOrders.map(order => (
                   <KitchenOrderCard 
                      key={order.id} 
                      order={order} 
                      nextStatus={OrderStatus.SERVED} 
                      buttonText="完成出餐" 
                      colorClass="#3b82f6"
                      onStatusChange={onStatusChange}
                   />
                ))}
                 {cookingOrders.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                      <ChefHat size={64} />
                      <p className="mt-4 text-xl">灶台空闲中</p>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default KitchenDisplay;