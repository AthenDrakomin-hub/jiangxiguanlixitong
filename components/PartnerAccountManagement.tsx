import React, { useState, useEffect } from 'react';
import { User, Building2, Phone, CreditCard, DollarSign, Edit3, Trash2, Plus, Save, X } from 'lucide-react';
import { PartnerAccount } from '../types.js';
import { apiClient } from '../services/apiClient.js';

const PartnerAccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<PartnerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PartnerAccount | null>(null);
  const [formState, setFormState] = useState<Partial<PartnerAccount>>({
    name_cn: '',
    name_en: '',
    contact_person: '',
    phone: '',
    credit_limit: 0,
    notes: '',
  });

  // 加载合作伙伴账户数据
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.fetchCollection<PartnerAccount>('partner_accounts');
      setAccounts(response);
    } catch (err) {
      console.error('加载合作伙伴账户失败:', err);
      setError('加载合作伙伴账户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAccount) {
        // 更新现有账户
        const response = await apiClient.update('partner_accounts', editingAccount.id, formState);
        setAccounts(accounts.map(acc => acc.id === editingAccount.id ? { ...acc, ...response } : acc));
      } else {
        // 创建新账户
        const response = await apiClient.create('partner_accounts', formState);
        setAccounts([...accounts, response]);
      }
      
      // 重置表单
      setFormState({
        name_cn: '',
        name_en: '',
        contact_person: '',
        phone: '',
        credit_limit: 0,
        notes: '',
      });
      setShowForm(false);
      setEditingAccount(null);
    } catch (err) {
      console.error('保存合作伙伴账户失败:', err);
      setError('保存合作伙伴账户失败');
    }
  };

  const handleEdit = (account: PartnerAccount) => {
    setEditingAccount(account);
    setFormState({
      name_cn: account.name_cn,
      name_en: account.name_en,
      contact_person: account.contact_person,
      phone: account.phone,
      credit_limit: account.credit_limit,
      notes: account.notes,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个合作伙伴账户吗？')) {
      try {
        await apiClient.remove('partner_accounts', id);
        setAccounts(accounts.filter(acc => acc.id !== id));
      } catch (err) {
        console.error('删除合作伙伴账户失败:', err);
        setError('删除合作伙伴账户失败');
      }
    }
  };

  const handleNewAccount = () => {
    setEditingAccount(null);
    setFormState({
      name_cn: '',
      name_en: '',
      contact_person: '',
      phone: '',
      credit_limit: 0,
      notes: '',
    });
    setShowForm(true);
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
          <h2 className="text-2xl font-bold text-slate-800">合作单位管理</h2>
          <p className="mt-1 text-sm text-slate-500">管理可以挂账的合作单位信息</p>
        </div>
        <button
          onClick={handleNewAccount}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          <Plus size={16} />
          新增合作单位
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* 合作伙伴表单 */}
      {showForm && (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-800">
            {editingAccount ? '编辑合作单位' : '新增合作单位'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  单位中文名 *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="name_cn"
                    value={formState.name_cn || ''}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  单位英文名 *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="name_en"
                    value={formState.name_en || ''}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  联系人 *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="contact_person"
                    value={formState.contact_person || ''}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  联系电话 *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="phone"
                    value={formState.phone || ''}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  信用额度 *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="number"
                    name="credit_limit"
                    value={formState.credit_limit || 0}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  当前欠款
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="number"
                    value={editingAccount?.current_balance || 0}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 bg-gray-100"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                备注
              </label>
              <textarea
                name="notes"
                value={formState.notes || ''}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-slate-300 py-2 px-3"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAccount(null);
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                <X size={16} />
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

      {/* 合作伙伴列表 */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  单位名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  联系人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  联系电话
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  信用额度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  当前欠款
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-slate-900">{account.name_cn}</div>
                    <div className="text-sm text-slate-500">{account.name_en}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {account.contact_person}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {account.phone}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    ₱{account.credit_limit.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    ₱{account.current_balance.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      account.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : account.status === 'suspended' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {account.status === 'active' ? '启用' : account.status === 'suspended' ? '暂停' : '关闭'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {accounts.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">暂无合作单位</h3>
          <p className="mt-1 text-sm text-slate-500">
            点击"新增合作单位"按钮创建第一个合作单位。
          </p>
        </div>
      )}
    </div>
  );
};

export default PartnerAccountManagement;