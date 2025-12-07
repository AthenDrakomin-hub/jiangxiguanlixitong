import React, { useState, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Wallet, DollarSign, Plus, 
  ArrowUpRight, ArrowDownRight, Download, ClipboardCheck, X
} from 'lucide-react';
import { Order, OrderStatus, Expense, ExpenseCategory } from '../types';

interface FinanceSystemProps {
  orders: Order[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#64748b'];

const FinanceSystem: React.FC<FinanceSystemProps> = ({ orders, expenses, setExpenses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    amount: 0,
    category: ExpenseCategory.INGREDIENTS,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const totalRevenue = useMemo(() => 
    orders
      .filter(o => o.status !== OrderStatus.CANCELLED)
      .reduce((acc, curr) => acc + curr.totalAmount, 0)
  , [orders]);

  const totalExpenses = useMemo(() => 
    expenses.reduce((acc, curr) => acc + curr.amount, 0)
  , [expenses]);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const chartData = useMemo(() => {
    const data: Record<string, { name: string; revenue: number; expense: number }> = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      data[key] = { 
        name: d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }), 
        revenue: 0, 
        expense: 0 
      };
    }

    orders.forEach(o => {
      if (o.status !== OrderStatus.CANCELLED) {
        const dateKey = o.createdAt.split('T')[0];
        if (data[dateKey]) data[dateKey].revenue += o.totalAmount;
      }
    });

    expenses.forEach(e => {
      const dateKey = e.date.split('T')[0];
      if (data[dateKey]) data[dateKey].expense += e.amount;
    });

    return Object.values(data);
  }, [orders, expenses]);

  const expenseCategoryData = useMemo(() => {
    const catData: Record<string, number> = {};
    expenses.forEach(e => {
      catData[e.category] = (catData[e.category] || 0) + e.amount;
    });
    return Object.entries(catData).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const transactions = useMemo(() => {
    const incomeList = orders
      .filter(o => o.status !== OrderStatus.CANCELLED)
      .map(o => ({
        id: o.id,
        type: 'income',
        category: '餐饮收入 Revenue',
        description: `Order #${o.id} - ${o.tableNumber}`,
        amount: o.totalAmount,
        date: o.createdAt
      }));

    const expenseList = expenses.map(e => ({
      id: e.id,
      type: 'expense',
      category: e.category,
      description: e.description,
      amount: e.amount,
      date: e.date
    }));

    return [...incomeList, ...expenseList].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [orders, expenses]);

  const handoverData = useMemo(() => {
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(o => o.status === OrderStatus.PAID && o.createdAt.startsWith(today));
      
      const byMethod: Record<string, number> = {};
      let total = 0;

      todayOrders.forEach(o => {
          const method = o.paymentMethod || 'UNKNOWN';
          byMethod[method] = (byMethod[method] || 0) + o.totalAmount;
          total += o.totalAmount;
      });

      return { total, byMethod, count: todayOrders.length };
  }, [orders]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    const expense: Expense = {
      id: `EXP-${Date.now()}`,
      amount: Number(newExpense.amount),
      category: newExpense.category as ExpenseCategory,
      description: newExpense.description || '',
      date: newExpense.date ? new Date(newExpense.date).toISOString() : new Date().toISOString()
    };

    setExpenses(prev => [expense, ...prev]);
    setIsModalOpen(false);
    setNewExpense({
      amount: 0,
      category: ExpenseCategory.INGREDIENTS,
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleExportCSV = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dataToExport = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);

    if (dataToExport.length === 0) {
      alert("No data in last 30 days");
      return;
    }

    const headers = ['ID,Type,Category,Description,Date,Amount'];
    
    const rows = dataToExport.map(t => {
      const safeDesc = `"${t.description.replace(/"/g, '""')}"`;
      const typeStr = t.type === 'income' ? 'Income' : 'Expense';
      const dateStr = new Date(t.date).toLocaleDateString('zh-CN');
      return `${t.id},${typeStr},${t.category},${safeDesc},${dateStr},${t.amount}`;
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n'); 
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `finance_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">财务系统</h2>
        <div className="flex gap-3">
          <button 
             onClick={() => setIsHandoverOpen(true)}
             className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
             <ClipboardCheck size={18} /> Shift Report 交班
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            <span>Export 导出</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
          >
            <Plus size={18} />
            <span>Expense 记支出</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Revenue 总收入</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">₱{totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-xs text-slate-400">Total Valid Orders</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Expenses 总支出</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">₱{totalExpenses.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="text-xs text-slate-400">Ingredients, Rent, etc.</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Net Profit 净利润</p>
              <h3 className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ₱{netProfit.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Wallet size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className={profitMargin >= 0 ? 'text-emerald-500' : 'text-red-500'}>
              {profitMargin.toFixed(1)}%
            </span>
            <span className="text-slate-400">Margin 利润率</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Cash Flow 现金流</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">₱{(netProfit).toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-xs text-slate-400">Estimate 预估值</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">7-Day Trend 近7日收支</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue 收入" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expense" name="Expense 支出" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                <Legend iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Expense Mix 支出构成</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseCategoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Recent Transactions 近期明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Type 类型</th>
                <th className="px-6 py-4 font-medium">Category 类目</th>
                <th className="px-6 py-4 font-medium">Description 描述</th>
                <th className="px-6 py-4 font-medium">Date 日期</th>
                <th className="px-6 py-4 font-medium text-right">Amount 金额</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 10).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      t.type === 'income' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {t.type === 'income' ? 'Inc 收入' : 'Exp 支出'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{t.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{t.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(t.date).toLocaleDateString('zh-CN')} {new Date(t.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${
                    t.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}₱{t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="p-8 text-center text-slate-400">No Data / 暂无数据</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add Expense 记支出</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount 金额 (₱)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newExpense.amount || ''}
                  onChange={e => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category 类目</label>
                <select
                    value={newExpense.category}
                    onChange={e => setNewExpense(prev => ({ ...prev, category: e.target.value as ExpenseCategory }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {Object.values(ExpenseCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description 描述</label>
                <input
                  type="text"
                  required
                  value={newExpense.description}
                  onChange={e => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel 取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/10"
                >
                  Confirm 确认记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isHandoverOpen && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-0 overflow-hidden">
             <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
                <div>
                   <h3 className="text-xl font-bold flex items-center gap-2"><ClipboardCheck /> 交接班报表 Shift Report</h3>
                   <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleDateString()}</p>
                </div>
                <button onClick={() => setIsHandoverOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
             </div>
             
             <div className="p-6">
                <div className="flex items-center justify-between mb-6 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                   <span className="text-slate-600 font-bold">Total Revenue 营收总额</span>
                   <span className="text-2xl font-bold text-emerald-600">₱{handoverData.total.toLocaleString()}</span>
                </div>
                
                <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Breakdown 按支付方式汇总</h4>
                <div className="space-y-2 mb-6">
                   {Object.entries(handoverData.byMethod).map(([method, amount]) => (
                      <div key={method} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-700">{method}</span>
                         </div>
                         <span className="font-bold text-slate-800">₱{amount.toLocaleString()}</span>
                      </div>
                   ))}
                   {Object.keys(handoverData.byMethod).length === 0 && (
                      <div className="text-center text-slate-400 text-sm py-4">No paid orders today</div>
                   )}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 mb-6">
                   <p>• Range: Today 00:00 - Now</p>
                   <p>• Includes: Dining, Room, KTV, Takeout</p>
                   <p>• Orders: {handoverData.count}</p>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900"
                >
                   Print Report 打印交班小票
                </button>
             </div>
          </div>
         </div>
      )}
    </div>
  );
};

export default FinanceSystem;