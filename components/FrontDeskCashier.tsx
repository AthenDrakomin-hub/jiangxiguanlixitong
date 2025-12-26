import React, { useState, useMemo } from 'react';
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
  Calculator,
  CreditCard,
  PiggyBank,
  User,
  Clock,
  FileText,
  Printer,
} from 'lucide-react';
import { Order, OrderStatus, Expense, ExpenseCategory, PaymentMethod } from '../types.js';
import { PrinterService } from '../services/printer.js';
import { apiClient } from '../services/apiClient.js';
import { auditLogger } from '../services/auditLogger.js';
import { t } from '../utils/i18n.js';

interface FrontDeskCashierProps {
  orders: Order[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const FrontDeskCashier: React.FC<FrontDeskCashierProps> = ({
  orders,
  expenses,
  setExpenses,
}) => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: 0,
    category: 'operational' as ExpenseCategory,
    date: new Date().toISOString().split('T')[0],
  });

  // Calculate financial metrics for today
  const financialData = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    // Get today's completed orders (revenue)
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfDay && 
      order.status === 'COMPLETED'
    );

    // Get today's expenses
    const todayExpenses = expenses.filter(expense => 
      new Date(expense.date) >= startOfDay
    );

    // Calculate total revenue from completed orders
    const totalRevenue = todayOrders.reduce((sum, order) => {
      const orderTotal = order.items.reduce((itemSum, item) => 
        itemSum + (item.price * item.quantity), 0);
      return sum + orderTotal;
    }, 0);

    // Calculate total expenses
    const totalExpenses = todayExpenses.reduce((sum, expense) => 
      sum + expense.amount, 0
    );

    // Calculate net profit
    const netProfit = totalRevenue - totalExpenses;

    // Calculate pending orders (awaiting payment)
    const pendingOrders = orders.filter(order => 
      order.status === 'READY' || order.status === 'DELIVERED'
    );

    const pendingAmount = pendingOrders.reduce((sum, order) => {
      const orderTotal = order.items.reduce((itemSum, item) => 
        itemSum + (item.price * item.quantity), 0);
      return sum + orderTotal;
    }, 0);

    // Calculate cash flow (assuming initial cash is 0 for this example)
    const cashFlow = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      pendingAmount,
      pendingOrders,
      cashFlow,
    };
  }, [orders, expenses]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      description: expenseForm.description,
      amount: expenseForm.amount,
      category: expenseForm.category,
      date: expenseForm.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExpenses(prev => [...prev, newExpense]);
    setExpenseForm({
      description: '',
      amount: 0,
      category: 'operational',
      date: new Date().toISOString().split('T')[0],
    });
    setShowExpenseForm(false);
    auditLogger.log('expense_added', { expense: newExpense });
  };

  const handleCompletePayment = (order: Order) => {
    // In a real implementation, this would update the order status to 'COMPLETED'
    // For now, we'll just log the action
    console.log('Completing payment for order:', order.id);
    auditLogger.log('payment_completed', { orderId: order.id, amount: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) });
  };

  const handleShiftReport = () => {
    // Generate shift report
    alert(t('shift_report_generated'));
    auditLogger.log('shift_report', { 
      totalRevenue: financialData.totalRevenue, 
      totalExpenses: financialData.totalExpenses,
      netProfit: financialData.netProfit,
      pendingAmount: financialData.pendingAmount
    });
  };

  const handlePrintReport = () => {
    // Print financial report
    alert(t('financial_report_printed'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('cashier')}</h1>
          <p className="text-slate-600">{t('front_desk_cashier_desc')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Printer size={18} />
            {t('print_report')}
          </button>
        </div>
      </div>

      {/* Financial Stats Cards - Top Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('total_revenue')}</p>
              <p className="text-2xl font-bold text-slate-900">
                ₱{financialData.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('cash_flow')}</p>
              <p className="text-2xl font-bold text-slate-900">
                ₱{financialData.cashFlow.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Wallet className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('net_profit')}</p>
              <p className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₱{financialData.netProfit.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <ArrowUpRight className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Shift & Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-slate-900">{t('shift_actions')}</h2>
          <div className="space-y-4">
            <button
              onClick={handleShiftReport}
              className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
            >
              <FileText size={18} />
              {t('shift_report')}
            </button>
            
            <button
              onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="flex w-full items-center justify-center gap-2 rounded bg-orange-600 px-4 py-3 text-white hover:bg-orange-700"
            >
              <Plus size={18} />
              {t('add_expense')}
            </button>
          </div>

          {/* Expense Form - Toggleable */}
          {showExpenseForm && (
            <div className="mt-6 rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-semibold">{t('add_expense')}</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('description')}
                  </label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    className="w-full rounded border border-slate-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('amount')}
                  </label>
                  <input
                    type="number"
                    value={expenseForm.amount || ''}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: Number(e.target.value)})}
                    className="w-full rounded border border-slate-300 px-3 py-2"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('category')}
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value as ExpenseCategory})}
                    className="w-full rounded border border-slate-300 px-3 py-2"
                  >
                    <option value="operational">{t('operational')}</option>
                    <option value="maintenance">{t('maintenance')}</option>
                    <option value="utilities">{t('utilities')}</option>
                    <option value="supplies">{t('supplies')}</option>
                    <option value="salary">{t('salary')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('date')}
                  </label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    className="w-full rounded border border-slate-300 px-3 py-2"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    {t('add_expense')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExpenseForm(false)}
                    className="flex-1 items-center justify-center gap-2 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                  >
                    <ArrowUpRight size={18} />
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Pending Amount Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-slate-900">{t('pending_amount')}</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('awaiting_payment')}</p>
              <p className="text-3xl font-bold text-slate-900">
                ₱{financialData.pendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {financialData.pendingOrders.length} {t('pending_orders')}
          </p>
        </div>
      </div>

      {/* Bottom Section: Checkout List */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-slate-900">{t('checkout_list')}</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('room_number')}</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('source')}</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('time')}</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('amount')}</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {financialData.pendingOrders.length > 0 ? (
                financialData.pendingOrders.map(order => {
                  const orderTotal = order.items.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0);
                  
                  return (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-slate-500" />
                          {order.roomNumber || order.table || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.source === 'h5' ? t('h5_order') : t('manual_order')}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(order.createdAt).toLocaleTimeString('zh-CN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        ₱{orderTotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleCompletePayment(order)}
                          className="flex items-center gap-1 rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                        >
                          <CreditCard size={14} />
                          {t('checkout')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    {t('no_pending_orders')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Payment History */}
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold">{t('recent_payments')}</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {orders
              .filter(order => order.status === 'COMPLETED')
              .slice(-5) // Show last 5 completed orders
              .reverse() // Show most recent first
              .map(order => {
                const orderTotal = order.items.reduce((sum, item) => 
                  sum + (item.price * item.quantity), 0);
                
                return (
                  <div key={order.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center">
                      <User size={14} className="mr-2 text-slate-500" />
                      <span className="font-medium">
                        {order.roomNumber || order.table || 'N/A'}
                      </span>
                      <span className="ml-2 text-sm text-slate-600">
                        {new Date(order.updatedAt || order.createdAt).toLocaleTimeString('zh-CN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">₱{orderTotal.toLocaleString()}</span>
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                        {order.paymentMethod || t('cash')}
                      </span>
                    </div>
                  </div>
                );
              })}
            {orders.filter(order => order.status === 'COMPLETED').length === 0 && (
              <p className="text-slate-500">{t('no_recent_payments')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontDeskCashier;