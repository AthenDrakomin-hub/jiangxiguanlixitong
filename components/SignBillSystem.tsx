import React, { useState } from 'react';
import {
  FileSignature,
  Plus,
  Search,
  Edit2,
  Wallet,
  HandCoins,
  UserCheck,
  Phone,
  X,
  ArrowDownRight,
} from 'lucide-react';
import { SignBillAccount, PaymentMethod } from '../types';

interface SignBillSystemProps {
  accounts: SignBillAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<SignBillAccount[]>>;
}

const SignBillSystem: React.FC<SignBillSystemProps> = ({
  accounts,
  setAccounts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SignBillAccount | null>(
    null
  );
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    type: 'charge' | 'settle';
    accountId: string | null;
  }>({
    isOpen: false,
    type: 'charge',
    accountId: null,
  });
  const [transactionAmount, setTransactionAmount] = useState<string>('');
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('CASH');

  const [formData, setFormData] = useState<Partial<SignBillAccount>>({
    name: '',
    cooperationMethod: '协议单位',
    settlementMethod: '月结',
    approver: '',
    phoneNumber: '',
    creditLimit: 0,
    currentDebt: 0,
    status: 'Active',
  });

  const totalDebt = accounts.reduce(
    (sum, acc) => sum + (acc.status === 'Active' ? acc.currentDebt : 0),
    0
  );
  const activeCount = accounts.filter((a) => a.status === 'Active').length;

  const filteredAccounts = accounts.filter(
    (acc) =>
      (acc.name && acc.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (acc.approver &&
        acc.approver.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (account?: SignBillAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData(account);
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        cooperationMethod: '协议单位',
        settlementMethod: '月结',
        approver: '',
        phoneNumber: '',
        creditLimit: 0,
        currentDebt: 0,
        status: 'Active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === editingAccount.id
            ? ({ ...acc, ...formData } as SignBillAccount)
            : acc
        )
      );
    } else {
      const newAccount: SignBillAccount = {
        ...(formData as SignBillAccount),
        id: `SB-${Date.now()}`,
        currentDebt: formData.currentDebt || 0,
        lastTransactionDate: new Date().toISOString(),
      };
      setAccounts((prev) => [newAccount, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this account? 确定要删除该签单账户吗？')) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    }
  };

  const openTransactionModal = (
    accountId: string,
    type: 'charge' | 'settle'
  ) => {
    setTransactionModal({ isOpen: true, type, accountId });
    setTransactionAmount('');
    setSettleMethod('CASH');
  };

  const handleTransaction = () => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) return;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === transactionModal.accountId) {
          const newDebt =
            transactionModal.type === 'charge'
              ? acc.currentDebt + amount
              : Math.max(0, acc.currentDebt - amount);

          return {
            ...acc,
            currentDebt: newDebt,
            lastTransactionDate: new Date().toISOString(),
          };
        }
        return acc;
      })
    );

    setTransactionModal({ ...transactionModal, isOpen: false });
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <FileSignature className="text-indigo-600" /> 签单管理
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage Corporate Accounts & Settlements
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700"
        >
          <Plus size={20} />
          <span>New Account 新增账户</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Credit 挂账总额
            </p>
            <h3 className="mt-1 text-2xl font-bold text-red-600">
              ₱{totalDebt.toLocaleString()}
            </h3>
          </div>
          <div className="rounded-lg bg-red-50 p-3 text-red-600">
            <Wallet size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Active Accounts 合作单位
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-800">
              {activeCount}
            </h3>
          </div>
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Pending Settlement 待结算
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-800">
              {accounts.filter((a) => a.currentDebt > 0).length}
            </h3>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
            <HandCoins size={24} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row">
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search Name / 搜索单位或人名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 bg-slate-50/50 p-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {account.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700">
                      {account.cooperationMethod}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                      {account.settlementMethod}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenModal(account)}
                  className="p-1 text-slate-400 hover:text-indigo-600"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              <div className="mb-6 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UserCheck size={14} /> Approver 批准人:
                  </span>
                  <span className="font-medium text-slate-800">
                    {account.approver}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Phone size={14} /> Phone 电话:
                  </span>
                  <span className="font-mono">{account.phoneNumber}</span>
                </div>
                {account.creditLimit && account.creditLimit > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400">
                      Limit 额度:
                    </span>
                    <span className="font-mono">
                      ₱{account.creditLimit.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="mb-0.5 text-xs text-slate-400">
                    Current Debt 当前欠款
                  </p>
                  <p
                    className={`text-xl font-bold ${account.currentDebt > 0 ? 'text-red-600' : 'text-emerald-600'}`}
                  >
                    ₱{account.currentDebt.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openTransactionModal(account.id, 'charge')}
                    className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                    title="Charge 记账"
                  >
                    <ArrowDownRight size={20} />
                  </button>
                  <button
                    onClick={() => openTransactionModal(account.id, 'settle')}
                    className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100"
                    title="Settle 还款"
                  >
                    <HandCoins size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingAccount
                  ? 'Edit Account 编辑账户'
                  : 'New Account 新增账户'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name 单位/个人名称
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Construction Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Type 合作方式
                  </label>
                  <select
                    value={formData.cooperationMethod}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cooperationMethod: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="协议单位">Agreement 协议单位</option>
                    <option value="长期合作">Long-term 长期合作</option>
                    <option value="熟客挂帐">VIP 熟客挂帐</option>
                    <option value="临时挂帐">Temp 临时挂帐</option>
                    <option value="员工签单">Staff 员工签单</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Settlement 结算方式
                  </label>
                  <select
                    value={formData.settlementMethod}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        settlementMethod: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="月结">Monthly 月结</option>
                    <option value="季结">Quarterly 季结</option>
                    <option value="单笔结">Per Bill 单笔结</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Approver 批准人
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.approver}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        approver: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Phone 电话
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Initial Debt 初始欠款
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!!editingAccount}
                    value={formData.currentDebt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currentDebt: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Credit Limit 额度 (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.creditLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        creditLimit: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {editingAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editingAccount.id);
                      setIsModalOpen(false);
                    }}
                    className="mr-auto rounded-lg bg-red-50 px-4 py-2 text-red-600 transition-colors hover:bg-red-100"
                  >
                    Delete 删除
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancel 取消
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700"
                >
                  Save 保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {transactionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <h3 className="mb-2 text-xl font-bold text-slate-800">
              {transactionModal.type === 'charge'
                ? 'Add Charge 记账'
                : 'Settle Payment 结算还款'}
            </h3>
            <p className="mb-6 text-sm text-slate-500">Enter amount below</p>

            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                ₱
              </span>
              <input
                type="number"
                min="0"
                autoFocus
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>

            {transactionModal.type === 'settle' && (
              <div className="mb-6 text-left">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method 方式
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSettleMethod('CASH')}
                    className={`rounded border px-2 py-2 text-xs ${settleMethod === 'CASH' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 bg-white'}`}
                  >
                    现金 Cash
                  </button>
                  <button
                    onClick={() => setSettleMethod('USDT')}
                    className={`rounded border px-2 py-2 text-xs ${settleMethod === 'USDT' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white'}`}
                  >
                    USDT
                  </button>
                  <button
                    onClick={() => setSettleMethod('ALIPAY')}
                    className={`rounded border px-2 py-2 text-xs ${settleMethod === 'ALIPAY' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white'}`}
                  >
                    支付宝 Alipay
                  </button>
                  <button
                    onClick={() => setSettleMethod('WECHAT')}
                    className={`rounded border px-2 py-2 text-xs ${settleMethod === 'WECHAT' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white'}`}
                  >
                    微信 WeChat
                  </button>
                  <button
                    onClick={() => setSettleMethod('GCASH')}
                    className={`rounded border px-2 py-2 text-xs ${settleMethod === 'GCASH' ? 'border-blue-600 bg-blue-500 text-white' : 'border-slate-200 bg-white'}`}
                  >
                    GCash
                  </button>
                  <button
                    onClick={() => setSettleMethod('MAYA')}
                    className={`rounded border px-2 py-2 text-xs ${settleMethod === 'MAYA' ? 'border-green-600 bg-green-500 text-white' : 'border-slate-200 bg-white'}`}
                  >
                    Maya
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setTransactionModal({ ...transactionModal, isOpen: false })
                }
                className="flex-1 rounded-lg py-2 text-slate-600 transition-colors hover:bg-slate-100"
              >
                Cancel 取消
              </button>
              <button
                onClick={handleTransaction}
                className={`flex-1 rounded-lg py-2 font-medium text-white shadow-lg transition-colors ${
                  transactionModal.type === 'charge'
                    ? 'bg-red-600 shadow-red-200 hover:bg-red-700'
                    : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
                }`}
              >
                Confirm 确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignBillSystem;
