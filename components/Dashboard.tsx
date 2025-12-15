import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Mic2,
  FileSignature,
  BedDouble,
  Utensils,
} from 'lucide-react';
import {
  Order,
  OrderStatus,
  KTVRoom,
  SignBillAccount,
  HotelRoom,
} from '../types';

interface DashboardProps {
  orders: Order[];
  ktvRooms: KTVRoom[];
  signBillAccounts: SignBillAccount[];
  hotelRooms?: HotelRoom[];
}

interface OrderItem {
  price: number;
  quantity: number;
  // 可以根据需要添加其他属性
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subValue,
  footer,
}: any) => (
  <div className="card-hover flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
    <div>
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`rounded-lg p-3 ${color} transition-smooth`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {subValue && (
        <div className="flex items-center text-sm">
          <span className="flex items-center gap-1 font-medium text-green-500">
            <TrendingUp size={14} /> {subValue}
          </span>
          <span className="ml-2 text-slate-400">较昨日</span>
        </div>
      )}
    </div>
    {footer && (
      <div className="mt-4 border-t border-slate-50 pt-4 text-xs text-slate-500">
        {footer}
      </div>
    )}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({
  orders,
  ktvRooms,
  signBillAccounts,
  hotelRooms = [],
}) => {
  // --- Data Processing ---

  // 1. Dining Revenue (Hall + Takeout)
  const diningRevenue = useMemo(
    () =>
      orders
        .filter((o: Order) => o.status !== OrderStatus.CANCELLED)
        .reduce((acc: number, order: Order) => acc + order.totalAmount, 0),
    [orders]
  );

  // 2. KTV Revenue
  const activeKtvRevenue = useMemo(() => {
    return ktvRooms.reduce((acc: number, room: KTVRoom) => {
      if (room.status === 'InUse' && room.currentSession) {
        const start = new Date(room.currentSession.startTime).getTime();
        const now = new Date().getTime();
        const hours = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60)));
        const roomFee = hours * room.hourlyRate;
        const ordersFee = room.currentSession.orders
          ? room.currentSession.orders.reduce(
              (sum: number, item: OrderItem) => sum + item.price * item.quantity,
              0
            )
          : 0;
        return acc + roomFee + ordersFee;
      }
      return acc;
    }, 0);
  }, [ktvRooms]);

  // 3. Hotel Room Dining Revenue (Active orders in rooms)
  const hotelDiningRevenue = useMemo(() => {
    return hotelRooms.reduce((acc: number, room: HotelRoom) => {
      const roomOrderTotal = room.orders
        ? room.orders.reduce(
            (sum: number, item: OrderItem) => sum + item.price * item.quantity,
            0
          )
        : 0;
      return acc + roomOrderTotal;
    }, 0);
  }, [hotelRooms]);

  // 4. Total Receivables
  const totalReceivables = useMemo(
    () =>
      signBillAccounts.reduce(
        (acc: number, account: SignBillAccount) =>
          acc + (account?.currentDebt || 0),
        0
      ),
    [signBillAccounts]
  );

  const activeHotelDining = hotelRooms.filter(
    (r: HotelRoom) => r.orders && r.orders.length > 0
  ).length;

  // Total Estimated Assets
  const totalAssets =
    diningRevenue + activeKtvRevenue + hotelDiningRevenue + totalReceivables;

  const revenueComposition = [
    { name: '餐厅堂食', value: diningRevenue, color: '#ef4444' },
    {
      name: 'KTV营收',
      value: activeKtvRevenue + diningRevenue * 0.2,
      color: '#8b5cf6',
    }, // Fake logic for visual
    { name: '客房点餐', value: hotelDiningRevenue, color: '#f97316' },
    { name: '挂账待收', value: totalReceivables, color: '#f59e0b' },
  ];

  return (
    <div className="fade-in space-y-6">
      <div className="slide-in-left mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">运营总览</h2>
          <p className="text-sm text-slate-500">
            江西酒店 (Pasay City) - 实时经营数据
          </p>
        </div>
        <div className="transition-smooth rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
          {new Date().toLocaleDateString('zh-CN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="slide-in-left">
          <StatCard
            title="餐饮总营收"
            value={`₱${diningRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-emerald-500"
            footer="包含堂食与外卖"
          />
        </div>

        <div className="slide-in-left delay-75">
          <StatCard
            title="客房点餐"
            value={`₱${hotelDiningRevenue.toLocaleString()}`}
            icon={Utensils}
            color="bg-orange-500"
            footer={`${activeHotelDining} 个房间正在用餐`}
          />
        </div>

        <div className="slide-in-right delay-100">
          <StatCard
            title="KTV 实时营收"
            value={`₱${activeKtvRevenue.toLocaleString()}`}
            icon={Mic2}
            color="bg-purple-500"
            footer="正在使用包厢预计收入"
          />
        </div>

        <div className="slide-in-right delay-150">
          <StatCard
            title="应收挂账款"
            value={`₱${totalReceivables.toLocaleString()}`}
            icon={FileSignature}
            color="bg-yellow-500"
            footer={`${signBillAccounts.filter((a: SignBillAccount) => a.currentDebt > 0).length} 个单位欠款`}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="fade-in mt-6 grid grid-cols-1 gap-6 delay-200 lg:grid-cols-3">
        {/* Pie Chart: Revenue Composition */}
        <div className="card-hover rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-bold text-slate-800">
            收入构成分析
          </h3>
          <div className="relative h-64 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={revenueComposition}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `₱${value.toLocaleString()}`}
                />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="mt-[-40px] text-center">
                <p className="text-xs text-slate-400">今日总营收</p>
                <p className="text-xl font-bold text-slate-800">
                  ₱{totalAssets.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Tasks */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Dining Rooms */}
          <div className="card-hover rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <BedDouble size={18} /> 客房用餐监控
              </h3>
            </div>
            {activeHotelDining === 0 ? (
              <div className="py-4 text-sm text-slate-400">
                当前无客房点餐 No Active Orders
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {hotelRooms
                  .filter((r: HotelRoom) => r.orders && r.orders.length > 0)
                  .map((room: HotelRoom) => (
                    <div
                      key={room.id}
                      className="transition-smooth transform-scale-hover flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3"
                    >
                      <span className="font-bold text-orange-800">
                        {room.number}
                      </span>
                      <span className="rounded bg-white px-2 py-1 text-xs font-bold text-orange-600">
                        ₱
                        {room.orders
                          ? room.orders.reduce(
                              (
                                s: number,
                                i: { price: number; quantity: number }
                              ) => s + i.price * i.quantity,
                              0
                            )
                          : 0}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="card-hover rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <Mic2 size={18} /> KTV 包厢状态 (4F)
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {ktvRooms.map((room: KTVRoom) => (
                <div
                  key={room.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${room.status === 'InUse' ? 'border-purple-200 bg-purple-50' : 'border-slate-100 bg-slate-50'}`}
                >
                  <span
                    className={`font-bold ${room.status === 'InUse' ? 'text-purple-700' : 'text-slate-500'}`}
                  >
                    {room.name}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${room.status === 'InUse' ? 'animate-pulse bg-purple-500' : 'bg-slate-300'}`}
                  ></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
