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
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { PaymentMethod as PaymentMethodType } from '../types';

// 定义支付方式接口，包含所有必要字段
interface PaymentMethod {
  id: string;
  name: string;
  englishName: string;
  isEnabled: boolean;
  qrCodeUrl?: string;
  accountInfo?: string;
  paymentType: PaymentMethodType;
  currency: string;
  exchangeRate: number;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

const PaymentManagement: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<
    Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>
  >({
    name: '',
    englishName: '',
    isEnabled: true,
    qrCodeUrl: '',
    accountInfo: '',
    paymentType: 'CASH', // 使用types.ts中定义的类型
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
      // 产品备注: 为apiClient.fetchAll()的返回值指定明确的类型，避免使用any
      const response = await apiClient.fetchAll();
      if (response.paymentMethods) {
        // 注意：这里的paymentMethods是从API返回的实际数据，需要正确处理
        // API返回的数据结构可能与组件内部定义的PaymentMethod类型不完全一致
        // 需要进行类型转换，确保数据结构匹配

        // 如果response.paymentMethods是对象数组，直接使用
        if (
          Array.isArray(response.paymentMethods) &&
          response.paymentMethods.length > 0
        ) {
          // 检查第一个元素是否具有PaymentMethod的必要属性
          const firstItem = response.paymentMethods[0];
          if (
            typeof firstItem === 'object' &&
            firstItem !== null &&
            'id' in firstItem
          ) {
            // 假设API返回的数据结构与我们的PaymentMethod接口兼容
            // 进行显式类型转换以解决类型不匹配问题
            setPaymentMethods(
              response.paymentMethods as unknown as PaymentMethod[]
            );
          } else {
            // 如果数据结构不匹配，需要进行转换
            const convertedMethods: PaymentMethod[] =
              response.paymentMethods.map((method: unknown, index) => {
                // 类型守卫检查
                if (typeof method === 'object' && method !== null) {
                  const m = method as Record<string, unknown>;
                  return {
                    id: (m.id as string) || `PM-${index}`,
                    name: (m.name as string) || String(method),
                    englishName:
                      (m.englishName as string) ||
                      (m.name as string) ||
                      String(method),
                    isEnabled:
                      typeof m.isEnabled === 'boolean' ? m.isEnabled : true,
                    qrCodeUrl: (m.qrCodeUrl as string) || '',
                    accountInfo: (m.accountInfo as string) || '',
                    paymentType: (m.paymentType as PaymentMethodType) || 'CASH',
                    currency: (m.currency as string) || 'PHP',
                    exchangeRate:
                      typeof m.exchangeRate === 'number' ? m.exchangeRate : 1.0,
                    sortOrder:
                      typeof m.sortOrder === 'number' ? m.sortOrder : index,
                    createdAt: (m.createdAt as string) || undefined,
                    updatedAt: (m.updatedAt as string) || undefined,
                  };
                }
                // 如果不是对象，创建基本对象
                return {
                  id: `PM-${index}`,
                  name: String(method),
                  englishName: String(method),
                  isEnabled: true,
                  qrCodeUrl: '',
                  accountInfo: '',
                  paymentType: 'CASH',
                  currency: 'PHP',
                  exchangeRate: 1.0,
                  sortOrder: index,
                };
              });

            setPaymentMethods(
              convertedMethods.sort((a, b) => a.sortOrder - b.sortOrder)
            );
          }
        } else {
          // 如果没有数据或不是数组，设置为空数组
          setPaymentMethods([]);
        }
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      // 发生错误时设置为空数组，避免白屏
      setPaymentMethods([]);
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
          id: editingMethod.id,
        });
      } else {
        // Create new payment method
        const newMethod = {
          ...formData,
          id: `PM-${Date.now()}`,
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
        paymentType: 'CASH',
        currency: 'PHP',
        exchangeRate: 1.0,
        sortOrder: 0,
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
      sortOrder: method.sortOrder,
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
                      paymentType: e.target.value as PaymentMethodType,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                >
                  <option value="CASH">现金</option>
                  <option value="WECHAT">微信支付</option>
                  <option value="ALIPAY">支付宝</option>
                  <option value="USDT">USDT</option>
                  <option value="GCASH">GCash</option>
                  <option value="MAYA">Maya</option>
                  <option value="UNIONPAY">银联</option>
                  <option value="CREDIT_CARD">信用卡</option>
                  <option value="SIGN_BILL">挂账</option>
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
                onClick={() => setShowForm(false)}
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
