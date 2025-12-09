import React, { useState, useEffect } from 'react';
import { Save, CreditCard, Banknote, Wallet, Coins, Plus, Trash2, Edit3 } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface PaymentMethod {
  id: string;
  name: string;
  englishName: string;
  isEnabled: boolean;
  qrCodeUrl?: string;
  accountInfo?: string;
  paymentType: 'CASH' | 'MOBILE_WALLET' | 'CRYPTO' | 'BANK_TRANSFER' | 'CREDIT_CARD';
  currency: string;
  exchangeRate: number;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

const PaymentManagement: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    englishName: '',
    isEnabled: true,
    qrCodeUrl: '',
    accountInfo: '',
    paymentType: 'MOBILE_WALLET',
    currency: 'PHP',
    exchangeRate: 1.0000,
    sortOrder: 0
  });

  // Load payment methods from API
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response: any = await apiClient.fetchAll();
      if (response.paymentMethods) {
        setPaymentMethods(response.paymentMethods.sort((a: PaymentMethod, b: PaymentMethod) => a.sortOrder - b.sortOrder));
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMethod) {
        // Update existing payment method
        await apiClient.update('payment_methods', editingMethod.id, {
          ...formData,
          id: editingMethod.id
        });
      } else {
        // Create new payment method
        const newMethod = {
          ...formData,
          id: `PM-${Date.now()}`
        };
        await apiClient.create('payment_methods', newMethod);
      }
      
      // Reset form and reload data
      setEditingMethod(null);
      setShowForm(false);
      setFormData({
        name: '',
        englishName: '',
        isEnabled: true,
        qrCodeUrl: '',
        accountInfo: '',
        paymentType: 'MOBILE_WALLET',
        currency: 'PHP',
        exchangeRate: 1.0000,
        sortOrder: 0
      });
      
      loadPaymentMethods();
    } catch (error) {
      console.error('Failed to save payment method:', error);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      englishName: method.englishName,
      isEnabled: method.isEnabled,
      qrCodeUrl: method.qrCodeUrl || '',
      accountInfo: method.accountInfo || '',
      paymentType: method.paymentType,
      currency: method.currency,
      exchangeRate: method.exchangeRate,
      sortOrder: method.sortOrder
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个支付方式吗？')) {
      try {
        await apiClient.delete('payment_methods', id);
        loadPaymentMethods();
      } catch (error) {
        console.error('Failed to delete payment method:', error);
      }
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'CASH': return <Banknote size={16} />;
      case 'MOBILE_WALLET': return <Wallet size={16} />;
      case 'CRYPTO': return <Coins size={16} />;
      case 'BANK_TRANSFER': return <CreditCard size={16} />;
      default: return <CreditCard size={16} />;
    }
  };

  const getPaymentTypeName = (type: string) => {
    switch (type) {
      case 'CASH': return '现金';
      case 'MOBILE_WALLET': return '移动钱包';
      case 'CRYPTO': return '加密货币';
      case 'BANK_TRANSFER': return '银行转账';
      case 'CREDIT_CARD': return '信用卡';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">支付方式管理</h2>
          <p className="text-slate-500 text-sm mt-1">配置和管理所有支付方式</p>
        </div>
        <button 
          onClick={() => {
            setEditingMethod(null);
            setShowForm(true);
            setFormData({
              name: '',
              englishName: '',
              isEnabled: true,
              qrCodeUrl: '',
              accountInfo: '',
              paymentType: 'MOBILE_WALLET',
              currency: 'PHP',
              exchangeRate: 1.0000,
              sortOrder: paymentMethods.length
            });
          }}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          <Plus size={16} />
          添加支付方式
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingMethod ? '编辑支付方式' : '添加新支付方式'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">支付方式名称 *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">英文名称</label>
                <input 
                  type="text" 
                  value={formData.englishName}
                  onChange={(e) => setFormData({...formData, englishName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">支付类型 *</label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({...formData, paymentType: e.target.value as any})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="CASH">现金</option>
                  <option value="MOBILE_WALLET">移动钱包</option>
                  <option value="CRYPTO">加密货币</option>
                  <option value="BANK_TRANSFER">银行转账</option>
                  <option value="CREDIT_CARD">信用卡</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">货币</label>
                <input 
                  type="text" 
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">汇率</label>
                <input 
                  type="number" 
                  step="0.0001"
                  value={formData.exchangeRate}
                  onChange={(e) => setFormData({...formData, exchangeRate: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">排序</label>
                <input 
                  type="number" 
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">二维码URL</label>
              <input 
                type="text" 
                value={formData.qrCodeUrl}
                onChange={(e) => setFormData({...formData, qrCodeUrl: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="https://example.com/qrcode.png"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">账户信息</label>
              <textarea 
                value={formData.accountInfo}
                onChange={(e) => setFormData({...formData, accountInfo: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                rows={3}
                placeholder="账户号码、钱包地址等"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isEnabled"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({...formData, isEnabled: e.target.checked})}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="isEnabled" className="text-sm text-slate-700">启用此支付方式</label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button 
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                <Save size={16} />
                保存支付方式
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">支付方式</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">货币/汇率</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paymentMethods.map((method) => (
                <tr key={method.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        {getPaymentTypeIcon(method.paymentType)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{method.name}</div>
                        {method.englishName && (
                          <div className="text-sm text-slate-500">{method.englishName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{getPaymentTypeName(method.paymentType)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{method.currency}</div>
                    {method.exchangeRate !== 1.0000 && (
                      <div className="text-sm text-slate-500">汇率: {method.exchangeRate.toFixed(4)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {method.isEnabled ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        启用
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                        禁用
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(method)}
                        className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <Edit3 size={14} />
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(method.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {paymentMethods.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">暂无支付方式</h3>
            <p className="mt-1 text-sm text-slate-500">点击"添加支付方式"按钮创建新的支付方式。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;