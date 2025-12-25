import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Download,
  Eye,
  User,
  Clock,
  FileText,
  Wallet,
  X,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { Order, Expense, ExpenseCategory, PaymentMethod, User as UserType } from '../types.js';
import { t } from '../utils/i18n.js';

interface DataViewerProps {
  orders: Order[];
  expenses: Expense[];
  users: UserType[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'error';
}

const DataViewer: React.FC<DataViewerProps> = ({ orders, expenses, users }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'finance' | 'audit'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState<Order | null>(null);

  // Mock audit logs - in a real implementation, these would come from an API
  const mockAuditLogs: AuditLog[] = [
    {
      id: 'audit_1',
      timestamp: new Date().toISOString(),
      user: 'admin',
      action: 'order_modified',
      details: 'Modified order #1001 amount from ₱800 to ₱500',
      severity: 'warning'
    },
    {
      id: 'audit_2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'staff_01',
      action: 'order_voided',
      details: 'Voided H5 order #1024',
      severity: 'info'
    },
    {
      id: 'audit_3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'manager',
      action: 'expense_added',
      details: 'Added expense: ₱500 for ice procurement',
      severity: 'info'
    }
  ];

  // Filter orders based on search term and date range
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchTerm === '' || 
        order.id.includes(searchTerm) ||
        (order.roomNumber && order.roomNumber.includes(searchTerm)) ||
        (order.table && order.table.includes(searchTerm)) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDate = !dateRange || 
        (new Date(order.createdAt) >= new Date(dateRange.start) && 
         new Date(order.createdAt) <= new Date(dateRange.end));
      
      return matchesSearch && matchesDate;
    });
  }, [orders, searchTerm, dateRange]);

  // Filter expenses based on search term and date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = searchTerm === '' || 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateRange || 
        (new Date(expense.date) >= new Date(dateRange.start) && 
         new Date(expense.date) <= new Date(dateRange.end));
      
      return matchesSearch && matchesDate;
    });
  }, [expenses, searchTerm, dateRange]);

  // Filter audit logs based on search term and date range
  const filteredAuditLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateRange || 
        (new Date(log.timestamp) >= new Date(dateRange.start) && 
         new Date(log.timestamp) <= new Date(dateRange.end));
      
      return matchesSearch && matchesDate;
    });
  }, [mockAuditLogs, searchTerm, dateRange]);

  // Calculate order total
  const getOrderTotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : userId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('data_viewer')}</h1>
          <p className="text-slate-600">{t('data_viewer_desc')}</p>
        </div>
        <div className="mt-4 flex items-center gap-2 md:mt-0">
          <button className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            <Download size={18} />
            {t('export_data')}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2"
            />
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 hover:bg-slate-50">
              <Calendar size={16} />
              <span>{t('filter_date')}</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'orders'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          {t('order_logs')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'finance'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('finance')}
        >
          {t('finance_logs')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'audit'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('audit')}
        >
          {t('audit_trails')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="rounded-lg bg-white p-6 shadow">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">{t('order_logs')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('order_id')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('time')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('location')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('source')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('amount')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('payment_status')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('staff')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => {
                      const orderTotal = getOrderTotal(order);
                      const statusClass = 
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800';
                      
                      return (
                        <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{order.id}</td>
                          <td className="px-4 py-3">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            {order.roomNumber || order.table || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            {order.source === 'h5' ? t('h5_order') : t('manual_order')}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {formatCurrency(orderTotal)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded px-2 py-1 text-xs ${statusClass}`}>
                              {t(order.status.toLowerCase() as any)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {order.staffId ? getUserName(order.staffId) : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setShowOrderDetail(order)}
                              className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-blue-700 hover:bg-blue-200"
                            >
                              <Eye size={14} />
                              {t('view_details')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                        {t('no_orders_found')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">{t('finance_logs')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('transaction_id')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('type')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('amount')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('payment_method')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('location')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('time')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('staff')}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Income records */}
                  {filteredOrders
                    .filter(order => order.status === 'COMPLETED')
                    .map(order => {
                      const orderTotal = getOrderTotal(order);
                      return (
                        <tr key={`income_${order.id}`} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{order.id}</td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                              {t('income')}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-700">
                            +{formatCurrency(orderTotal)}
                          </td>
                          <td className="px-4 py-3">
                            {order.paymentMethod || t('cash')}
                          </td>
                          <td className="px-4 py-3">
                            {order.roomNumber || order.table || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            {order.staffId ? getUserName(order.staffId) : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  
                  {/* Expense records */}
                  {filteredExpenses.map(expense => (
                    <tr key={`expense_${expense.id}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{expense.id}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                          {t('expense')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-red-700">
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {t('expense')}
                      </td>
                      <td className="px-4 py-3">
                        {expense.category}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(expense.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {expense.id} {/* In a real implementation, this would be the user who added the expense */}
                      </td>
                    </tr>
                  ))}
                  
                  {filteredOrders.filter(order => order.status === 'COMPLETED').length === 0 && 
                   filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                        {t('no_finance_records')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">{t('audit_trails')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('timestamp')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('user')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('action')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('details')}</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">{t('severity')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.length > 0 ? (
                    filteredAuditLogs.map(log => {
                      const severityClass = 
                        log.severity === 'error' ? 'bg-red-100 text-red-800' :
                        log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800';
                      
                      return (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3">{formatDate(log.timestamp)}</td>
                          <td className="px-4 py-3 font-medium">{log.user}</td>
                          <td className="px-4 py-3">
                            <span className="rounded bg-slate-100 px-2 py-1 text-xs">
                              {t(log.action as any) || log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3">{log.details}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded px-2 py-1 text-xs ${severityClass}`}>
                              {t(log.severity)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                        {t('no_audit_logs')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {t('order_details')} - {showOrderDetail.id}
              </h3>
              <button
                onClick={() => setShowOrderDetail(null)}
                className="rounded-full p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">{t('location')}</p>
                  <p className="font-medium">
                    {showOrderDetail.roomNumber || showOrderDetail.table || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t('source')}</p>
                  <p className="font-medium">
                    {showOrderDetail.source === 'h5' ? t('h5_order') : t('manual_order')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t('time')}</p>
                  <p className="font-medium">
                    {formatDate(showOrderDetail.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t('payment_method')}</p>
                  <p className="font-medium">
                    {showOrderDetail.paymentMethod || t('cash')}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="mb-2 font-semibold">{t('order_items')}</h4>
                <div className="space-y-2">
                  {showOrderDetail.items.map((item, index) => (
                    <div key={index} className="flex justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-slate-600">
                          {item.quantity} x ₱{item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="w-1/3">
                    <div className="flex justify-between border-t pt-2">
                      <p className="font-semibold">{t('total')}</p>
                      <p className="font-semibold">
                        {formatCurrency(getOrderTotal(showOrderDetail))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataViewer;