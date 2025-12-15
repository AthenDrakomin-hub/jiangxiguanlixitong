import React from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
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

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  nextStatus,
  buttonText,
  colorClass,
  onStatusChange,
}) => {
  const getElapsedTime = (dateString: string) => {
    const minutes = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / 60000
    );
    return `${minutes} min`;
  };

  return (
    <div
      className="animate-fade-in flex h-full flex-col overflow-hidden rounded-xl border-l-4 border-l-transparent bg-white shadow-md"
      style={{ borderLeftColor: colorClass }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
        <div>
          <span className="text-2xl font-bold text-slate-800">
            #{order.tableNumber}
          </span>
          <span className="block text-xs text-slate-500">
            ID: {order.id.slice(-4)}
          </span>
        </div>
        <div className="text-right">
          <div
            className={`font-mono font-bold ${getElapsedTime(order.createdAt).includes('min') && parseInt(getElapsedTime(order.createdAt)) > 15 ? 'animate-pulse text-red-600' : 'text-slate-600'}`}
          >
            {getElapsedTime(order.createdAt)}
          </div>
          <div className="text-xs text-slate-400">
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b border-dashed border-slate-200 py-2 last:border-0"
          >
            <span className="text-lg font-bold text-slate-800">
              {item.dishName}
            </span>
            <span className="rounded bg-slate-100 px-3 py-1 text-xl font-bold text-slate-700">
              x{item.quantity}
            </span>
          </div>
        ))}
        {order.notes && (
          <div className="mt-3 flex items-start gap-2 rounded border border-yellow-100 bg-yellow-50 p-3 font-bold text-yellow-800">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" />
            {order.notes}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-4">
        <button
          onClick={() => onStatusChange(order.id, nextStatus)}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-4 text-lg font-bold text-white transition-transform active:scale-95 ${
            nextStatus === OrderStatus.COOKING
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {buttonText}{' '}
          {nextStatus === OrderStatus.COOKING ? (
            <ChefHat size={24} />
          ) : (
            <CheckCircle2 size={24} />
          )}
        </button>
      </div>
    </div>
  );
};

const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
  orders,
  onStatusChange,
  onBack,
}) => {
  // Filter only active orders for kitchen
  const pendingOrders = orders
    .filter((o) => o.status === OrderStatus.PENDING)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  const cookingOrders = orders
    .filter((o) => o.status === OrderStatus.COOKING)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
          <ChefHat size={32} /> Kitchen Display (KDS)
        </h2>
        <div className="flex items-center gap-4">
          <div className="font-mono text-xl text-white/80">
            {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
          >
            <LogOut size={18} />
            <span>Exit / Lumabas</span>
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-6 overflow-hidden">
        {/* Column 1: Pending */}
        <div className="flex flex-col rounded-2xl border border-slate-700/50 bg-slate-800/50 p-4">
          <div className="mb-4 flex items-center justify-between px-2">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
              <span className="h-3 w-3 animate-pulse rounded-full bg-orange-500"></span>{' '}
              Pending / Naghihintay
            </h3>
            <span className="rounded-full bg-slate-700 px-3 py-1 text-sm font-bold text-white">
              {pendingOrders.length}
            </span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {pendingOrders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                nextStatus={OrderStatus.COOKING}
                buttonText="Start Cooking / Simulan"
                colorClass="#f97316"
                onStatusChange={onStatusChange}
              />
            ))}
            {pendingOrders.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-slate-500 opacity-50">
                <Clock size={64} />
                <p className="mt-4 text-xl">No pending orders / Walang order</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Cooking */}
        <div className="flex flex-col rounded-2xl border border-slate-700/50 bg-slate-800/50 p-4">
          <div className="mb-4 flex items-center justify-between px-2">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
              <span className="h-3 w-3 rounded-full bg-blue-500"></span> Cooking
              / Nagluluto
            </h3>
            <span className="rounded-full bg-slate-700 px-3 py-1 text-sm font-bold text-white">
              {cookingOrders.length}
            </span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {cookingOrders.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                nextStatus={OrderStatus.SERVED}
                buttonText="Serve / I-serve"
                colorClass="#3b82f6"
                onStatusChange={onStatusChange}
              />
            ))}
            {cookingOrders.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-slate-500 opacity-50">
                <ChefHat size={64} />
                <p className="mt-4 text-xl">Kitchen Idle</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplay;
