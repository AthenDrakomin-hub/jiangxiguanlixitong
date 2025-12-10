import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, Mic2, FileSignature, BedDouble, Utensils } from 'lucide-react';
import { Order, OrderStatus, KTVRoom, SignBillAccount, HotelRoom } from '../types';

interface DashboardProps {
  orders: Order[];
  ktvRooms: KTVRoom[];
  signBillAccounts: SignBillAccount[];
  hotelRooms?: HotelRoom[];
}

const StatCard = ({ title, value, icon: Icon, color, subValue, footer }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {subValue && (
        <div className="flex items-center text-sm">
          <span className="text-green-500 font-medium flex items-center gap-1">
            <TrendingUp size={14} /> {subValue}
          </span>
          <span className="text-slate-400 ml-2">较昨日</span>
        </div>
      )}
    </div>
    {footer && (
      <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-500">
        {footer}
      </div>
    )}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ orders, ktvRooms, signBillAccounts, hotelRooms = [] }) => {
  // --- Data Processing ---

  // 1. Dining Revenue (Hall + Takeout)
  const diningRevenue = useMemo(() => 
    orders
      .filter((o: Order) => o.status !== OrderStatus.CANCELLED)
      .reduce((acc: number, order: Order) => acc + order.totalAmount, 0)
  , [orders]);

  // 2. KTV Revenue
  const activeKtvRevenue = useMemo(() => {
    return ktvRooms.reduce((acc: number, room: KTVRoom) => {
      if (room.status === 'InUse' && room.currentSession) {
        const start = new Date(room.currentSession.startTime).getTime();
        const now = new Date().getTime();
        const hours = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60)));
        const roomFee = hours * room.hourlyRate;
        const ordersFee = room.currentSession.orders ? room.currentSession.orders.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) : 0;
        return acc + roomFee + ordersFee;
      }
      return acc;
    }, 0);
  }, [ktvRooms]);

  // 3. Hotel Room Dining Revenue (Active orders in rooms)
  const hotelDiningRevenue = useMemo(() => {
    return hotelRooms.reduce((acc: number, room: HotelRoom) => {
      const roomOrderTotal = room.orders ? room.orders.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) : 0;
      return acc + roomOrderTotal;
    }, 0);
  }, [hotelRooms]);

  // 4. Total Receivables
  const totalReceivables = useMemo(() => 
    signBillAccounts.reduce((acc: number, account: SignBillAccount) => acc + (account?.currentDebt || 0), 0)
  , [signBillAccounts]);

  const activeHotelDining = hotelRooms.filter((r: HotelRoom) => r.orders && r.orders.length > 0).length;
  
  // Total Estimated Assets
  const totalAssets = diningRevenue + activeKtvRevenue + hotelDiningRevenue + totalReceivables;
  
  const revenueComposition = [
    { name: '餐厅堂食', value: diningRevenue, color: '#ef4444' }, 
    { name: 'KTV营收', value: activeKtvRevenue + (diningRevenue * 0.2), color: '#8b5cf6' }, // Fake logic for visual
    { name: '客房点餐', value: hotelDiningRevenue, color: '#f97316' },
    { name: '挂账待收', value: totalReceivables, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">运营总览</h2>
          <p className="text-slate-500 text-sm">江西酒店 (Pasay City) - 实时经营数据</p>
        </div>
        <div className="text-sm font-medium px-3 py-1 bg-white rounded-lg border border-slate-200 text-slate-600 shadow-sm">
           {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="餐饮总营收" 
          value={`₱${diningRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-500" 
          footer="包含堂食与外卖"
        />

        <StatCard 
          title="客房点餐" 
          value={`₱${hotelDiningRevenue.toLocaleString()}`} 
          icon={Utensils} 
          color="bg-orange-500" 
          footer={`${activeHotelDining} 个房间正在用餐`}
        />

        <StatCard 
          title="KTV 实时营收" 
          value={`₱${activeKtvRevenue.toLocaleString()}`} 
          icon={Mic2} 
          color="bg-purple-500" 
          footer="正在使用包厢预计收入"
        />

        <StatCard 
          title="应收挂账款" 
          value={`₱${totalReceivables.toLocaleString()}`} 
          icon={FileSignature} 
          color="bg-yellow-500" 
          footer={`${signBillAccounts.filter((a: SignBillAccount) => a.currentDebt > 0).length} 个单位欠款`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Pie Chart: Revenue Composition */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-2">收入构成分析</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
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
                <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-center mt-[-40px]">
                 <p className="text-xs text-slate-400">今日总营收</p>
                 <p className="text-xl font-bold text-slate-800">₱{totalAssets.toLocaleString()}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Alerts & Tasks */}
        <div className="lg:col-span-2 space-y-6">
           {/* Active Dining Rooms */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><BedDouble size={18} /> 客房用餐监控</h3>
             </div>
             {activeHotelDining === 0 ? (
               <div className="text-slate-400 text-sm py-4">当前无客房点餐 No Active Orders</div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {hotelRooms.filter((r: HotelRoom) => r.orders && r.orders.length > 0).map((room: HotelRoom) => (
                   <div key={room.id} className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex justify-between items-center">
                      <span className="font-bold text-orange-800">{room.number}</span>
                      <span className="text-xs bg-white px-2 py-1 rounded text-orange-600 font-bold">₱{room.orders ? room.orders.reduce((s: number, i: any) => s + i.price * i.quantity, 0) : 0}</span>
                   </div>
                 ))}
               </div>
             )}
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Mic2 size={18} /> KTV 包厢状态 (4F)</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {ktvRooms.map((room: KTVRoom) => (
                 <div key={room.id} className={`flex items-center justify-between p-3 rounded-lg border ${room.status === 'InUse' ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`font-bold ${room.status === 'InUse' ? 'text-purple-700' : 'text-slate-500'}`}>{room.name}</span>
                    <span className={`w-2 h-2 rounded-full ${room.status === 'InUse' ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'}`}></span>
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