import React, { useState, useEffect } from 'react';
import {
  Save,
  CreditCard,
  Banknote,
  Wallet,
  Coins,
  Plus,
  Trash2,
  Edit3,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { PaymentMethod as PaymentMethodCode } from '../types';

// 支付方式完整数据接口
interface PaymentMethodData {
  id: string;
  name: string;
  englishName: string;
  isEnabled: boolean;
  qrCodeUrl?: string;
  accountInfo?: string;
  paymentType: PaymentMethodCode;  // 使用 types.ts 的联合类型
  currency: string;
  exchangeRate: number;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

const PaymentManagement: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<
    Omit<PaymentMethodData, 'id' | 'createdAt' | 'updatedAt'>
  >({
    name: '',
    englishName: '',
    isEnabled: true,
    qrCodeUrl: '',
    accountInfo: '',
    paymentType: 'CASH',
    currency: 'PHP',
    exchangeRate: 1.0,
    sortOrder: 0,
  });

  // Load payment methods from API
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.fetchAll();
      
      if (response.paymentMethods && Array.isArray(response.paymentMethods)) {
        // 简化类型转换，信任 API 返回的数据结构
        const methods = response.paymentMethods as PaymentMethodData[];
        setPaymentMethods(methods.sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('加载支付方式失败:', error);
      setError('加载支付方式失败: ' + (error instanceof Error ? error.message : '未知错误'));
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMethod) {
        // 更新支付方式
        await apiClient.update('payment_methods', editingMethod.id, {
          ...formData,
          id: editingMethod.id,
        });
      } else {
        // 创建新支付方式
        const newMethod = {
          ...formData,
          id: `PM-${Date.now()}`,
        };
        await apiClient.create('payment_methods', newMethod);
      }

      // 重置表单并重新加载数据
      resetForm();
      await loadPaymentMethods();
    } catch (error) {
      console.error('保存支付方式失败:', error);
      alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const resetForm = () => {
    setEditingMethod(null);
    setShowForm(false);
    setFormData({
      name: '',
      englishName: '',
      isEnabled: true,
      qrCodeUrl: '',
      accountInfo: '',
      paymentType: 'CASH',
      currency: 'PHP',
      exchangeRate: 1.0,
      sortOrder: 0,
    });
  };

  const handleEdit = (method: PaymentMethodData) => {
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
      sortOrder: method.sortOrder,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个支付方式吗？此操作无法撤销。')) {
      return;
    }

    try {
      await apiClient.delete('payment_methods', id);
      await loadPaymentMethods();
    } catch (error) {
      console.error('删除支付方式失败:', error);
      alert('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'CASH':
        return <Banknote size={16} />;
      case 'MOBILE_WALLET':
        return <Wallet size={16} />;
      case 'CRYPTO':
        return <Coins size={16} />;
      case 'BANK_TRANSFER':
        return <CreditCard size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  const getPaymentTypeName = (type: string) => {
    switch (type) {
      case 'CASH':
        return '现金';
      case 'MOBILE_WALLET':
        return '移动钱包';
      case 'CRYPTO':
        return '加密货币';
      case 'BANK_TRANSFER':
        return '银行转账';
      case 'CREDIT_CARD':
        return '信用卡';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">加载失败</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={loadPaymentMethods}
                className="mt-2 text-sm font-medium text-red-800 underline hover:text-red-900"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">支付方式管理</h2>
          <p className="mt-1 text-sm text-slate-500">配置和管理所有支付方式</p>
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
              paymentType: 'CASH',
              currency: 'PHP',
              exchangeRate: 1.0,
              sortOrder: paymentMethods.length,
            });
            setError(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          添加支付方式
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-800">
            {editingMethod ? '编辑支付方式' : '添加新支付方式'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  支付方式名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  英文名称
                </label>
                <input
                  type="text"
                  value={formData.englishName}
                  onChange={(e) =>
                    setFormData({ ...formData, englishName: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  支付类型 *
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentType: e.target.value as PaymentMethodCode,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                >
                  <option value="CASH">现金 (Cash)</option>
                  <option value="WECHAT">微信支付 (WeChat Pay)</option>
                  <option value="ALIPAY">支付宝 (Alipay)</option>
                  <option value="USDT">USDT (加密货币)</option>
                  <option value="GCASH">GCash (菲律宾)</option>
                  <option value="MAYA">Maya (菲律宾)</option>
                  <option value="UNIONPAY">银联 (UnionPay)</option>
                  <option value="CREDIT_CARD">信用卡 (Credit Card)</option>
                  <option value="SIGN_BILL">挂账 (Sign Bill)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  货币
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  汇率
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.exchangeRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exchangeRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  排序
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  QR码URL
                </label>
                <input
                  type="text"
                  value={formData.qrCodeUrl || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, qrCodeUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  账户信息
                </label>
                <input
                  type="text"
                  value={formData.accountInfo || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, accountInfo: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, isEnabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label className="ml-2 block text-sm text-slate-700">
                  启用此支付方式
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
              >
                <Save size={16} />
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      {paymentMethods.length > 0 ? (
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                  >
                    支付方式
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                  >
                    类型
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                  >
                    货币/汇率
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                  >
                    状态
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paymentMethods
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((method) => (
                    <tr key={method.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getPaymentTypeIcon(method.paymentType)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {method.name}
                            </div>
                            {method.englishName && (
                              <div className="text-sm text-slate-500">
                                {method.englishName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {getPaymentTypeName(method.paymentType)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {method.currency} ({method.exchangeRate})
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {method.isEnabled ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                            启用
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                            禁用
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(method)}
                          className="mr-3 text-slate-600 hover:text-slate-900"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(method.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">
            暂无支付方式
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            点击&quot;添加支付方式&quot;按钮创建新的支付方式。
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
