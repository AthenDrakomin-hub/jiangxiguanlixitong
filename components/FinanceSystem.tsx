
import React, { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ClipboardCheck,
  X,
} from 'lucide-react';
import { Order, OrderStatus, Expense, ExpenseCategory } from '../types.js';
import { PrinterService } from '../services/printer.js';
import { apiClient } from '../services/apiClient.js';
import { auditLogger } from '../services/auditLogger.js';

interface FinanceSystemProps {
  orders: Order[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const COLORS = [
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#8b5cf6',
  '#64748b',
];

const FinanceSystem: React.FC<FinanceSystemProps> = ({
  orders,
  expenses,
  setExpenses,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    amount: 0,
    category: ExpenseCategory.INGREDIENTS,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== OrderStatus.CANCELLED)
        .reduce((acc, curr) => acc + curr.total, 0),
    [orders]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((acc, curr) => acc + curr.amount, 0),
    [expenses]
  );

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const chartData = useMemo(() => {
    const data: Record<
      string,
      { name: string; revenue: number; expense: number }
    > = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      data[key] = {
        name: d.toLocaleDateString('zh-CN', {
          month: 'numeric',
          day: 'numeric',
        }),
        revenue: 0,
        expense: 0,
      };
    }

    orders.forEach((o) => {
      if (o.status !== OrderStatus.CANCELLED) {
        const dateKey = o.createdAt.split('T')[0];
        if (data[dateKey]) data[dateKey].revenue += o.total;
      }
    });

    expenses.forEach((e) => {
      const dateKey = e.date.split('T')[0];
      if (data[dateKey]) data[dateKey].expense += e.amount;
    });

    return Object.values(data);
  }, [orders, expenses]);

  const expenseCategoryData = useMemo(() => {
    const catData: Record<string, number> = {};
    expenses.forEach((e) => {
      catData[e.category] = (catData[e.category] || 0) + e.amount;
    });
    return Object.entries(catData).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const transactions = useMemo(() => {
    const incomeList = orders
      .filter((o) => o.status !== OrderStatus.CANCELLED)
      .map((o) => ({
        id: o.id,
        type: 'income',
        category: '餐饮收入 Revenue',
        description: `Order #${o.id} - ${o.roomNumber || o.tableId}`,
        amount: o.total,
        date: o.createdAt,
      }));

    const expenseList = expenses.map((e) => ({
      id: e.id,
      type: 'expense',
      category: e.category,
      description: e.description,
      amount: e.amount,
      date: e.date,
    }));

    return [...incomeList, ...expenseList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [orders, expenses]);

  // Fixed: Update handoverData structure to match ShiftReport expected by printer
  const handoverData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(
      (o) => o.status === OrderStatus.COMPLETED && o.createdAt.startsWith(today)
    );

    const byMethod: Record<string, number> = {};
    let total = 0;

    todayOrders.forEach((o) => {
      const method = o.paymentMethod || 'UNKNOWN';
      byMethod[method] = (byMethod[method] || 0) + o.total;
      total += o.total;
    });

    return { 
      id: `SHIFT-${Date.now()}`,
      startTime: today + ' 00:00:00',
      endTime: new Date().toLocaleString(),
      orders: todayOrders,
      totalRevenue: total,
      total, // UI compatibility
      byMethod, 
      count: todayOrders.length 
    };
  }, [orders]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    try {
      setError(null);
      const now = new Date().toISOString();
      const expense: Expense = {
        id: `EXP-${Date.now()}`,
        amount: Number(newExpense.amount),
        category: newExpense.category as ExpenseCategory,
        description: newExpense.description || '',
        date: newExpense.date
          ? new Date(newExpense.date).toISOString()
          : now,
        createdAt: now,
        updatedAt: now,
      };

      await apiClient.create('expenses', expense);
      setExpenses((prev) => [expense, ...prev]);

      auditLogger.log(
        'info',
        'EXPENSE_CREATE',
        `添加支出: ${expense.category} - ₱${expense.amount}`,
        'admin'
      );

      setIsModalOpen(false);
      setNewExpense({
        amount: 0,
        category: ExpenseCategory.INGREDIENTS,
        description: '',
        date: new Date().toISOString().split('T')[0],
      });

      setSuccess('支出记录添加成功！');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('添加支出失败:', error);
      setError('添加支出失败，请重试');
    }
  };

  const handleExportCSV = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dataToExport = transactions.filter(
      (t) => new Date(t.date) >= thirtyDaysAgo
    );

    if (dataToExport.length === 0) {
      setError('No data in last 30 days');
      return;
    }

    const headers = ['ID,Type,Category,Description,Date,Amount'];

    const rows = dataToExport.map((t) => {
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
    link.setAttribute(
      'download',
      `finance_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <X size={18} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          <div className="flex items-center gap-2">
            <Plus size={18} />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">财务系统</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setIsHandoverOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700"
          >
            <ClipboardCheck size={18} /> Shift Report 交班
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Download size={18} />
            <span>Export 导出</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-slate-800"
          >
            <Plus size={18} />
            <span>Expense 记支出</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Revenue 总收入
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-800">
                ₱{totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-xs text-slate-400">Total Valid Orders</div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Expenses 总支出
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-800">
                ₱{totalExpenses.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-lg bg-red-100 p-3 text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="text-xs text-slate-400">Ingredients, Rent, etc.</div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Net Profit 净利润
              </p>
              <h3
                className={`mt-1 text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
              >
                ₱{netProfit.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <Wallet size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span
              className={
                profitMargin >= 0 ? 'text-emerald-500' : 'text-red-500'
              }
            >
              {profitMargin.toFixed(1)}%
            </span>
            <span className="text-slate-400">Margin 利润率</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Cash Flow 现金流
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-800">
                ₱{netProfit.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-xs text-slate-400">Estimate 预估值</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-6 text-lg font-bold text-slate-800">
            7-Day Trend 近7日收支
          </h3>
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₱${value}`}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue 收入"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense 支出"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
                <Legend iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-slate-800">
            Expense Mix 支出构成
          </h3>
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800">
            Recent Transactions 近期明细
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Type 类型</th>
                <th className="px-6 py-4 font-medium">Category 类目</th>
                <th className="px-6 py-4 font-medium">Description 描述</th>
                <th className="px-6 py-4 font-medium">Date 日期</th>
                <th className="px-6 py-4 text-right font-medium">
                  Amount 金额
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 10).map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        t.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {t.type === 'income' ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      {t.type === 'income' ? 'Inc 收入' : 'Exp 支出'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">
                    {t.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(t.date).toLocaleDateString('zh-CN')}{' '}
                    {new Date(t.date).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td
                    className={`px-6 py-4 text-right text-sm font-bold ${
                      t.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}₱{t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No Data / 暂无数据
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                Add Expense 记支出
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Amount 金额 (₱)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newExpense.amount || ''}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      amount: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Category 类目
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      category: e.target.value as ExpenseCategory,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2"
                >
                  {Object.values(ExpenseCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description 描述
                </label>
                <input
                  type="text"
                  required
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg py-2 text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancel 取消
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-slate-900 py-2 font-medium text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-slate-800"
                >
                  Confirm 确认记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isHandoverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-0">
            <div className="flex items-start justify-between bg-slate-900 p-6 text-white">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <ClipboardCheck /> 交接班报表 Shift Report
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setIsHandoverOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <span className="font-bold text-slate-600">
                  Total Revenue 营收总额
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  ₱{handoverData.totalRevenue.toLocaleString()}
                </span>
              </div>

              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-800">
                Breakdown 按支付方式汇总
              </h4>
              <div className="mb-6 space-y-2">
                {Object.entries(handoverData.byMethod).map(
                  ([method, amount]) => (
                    <div
                      key={method}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">
                          {method}
                        </span>
                      </div>
                      <span className="font-bold text-slate-800">
                        ₱{amount.toLocaleString()}
                      </span>
                    </div>
                  )
                )}
                {Object.keys(handoverData.byMethod).length === 0 && (
                  <div className="py-4 text-center text-sm text-slate-400">
                    No paid orders today
                  </div>
                )}
              </div>

              <div className="mb-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                <p>• Range: {handoverData.startTime} - {handoverData.endTime}</p>
                <p>• Includes: Dining, Room, KTV, Takeout</p>
                <p>• Orders: {handoverData.count}</p>
              </div>

              <button
                onClick={() => PrinterService.printShiftReport(handoverData)}
                className="w-full rounded-xl bg-slate-800 py-3 font-bold text-white hover:bg-slate-900"
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