
import React, { useState } from 'react';
import { FileSignature, Plus, Search, Edit2, Wallet, HandCoins, UserCheck, Phone, X, ArrowDownRight, Banknote, Smartphone, QrCode, CircleDollarSign, CreditCard } from 'lucide-react';
import { SignBillAccount, PaymentMethod } from '../types';

interface SignBillSystemProps {
  accounts: SignBillAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<SignBillAccount[]>>;
}

const SignBillSystem: React.FC<SignBillSystemProps> = ({ accounts, setAccounts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SignBillAccount | null>(null);
  const [transactionModal, setTransactionModal] = useState<{ isOpen: boolean; type: 'charge' | 'settle'; accountId: string | null }>({
    isOpen: false,
    type: 'charge',
    accountId: null
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
    status: 'Active'
  });

  const totalDebt = accounts.reduce((sum, acc) => sum + (acc.status === 'Active' ? acc.currentDebt : 0), 0);
  const activeCount = accounts.filter(a => a.status === 'Active').length;

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.approver.toLowerCase().includes(searchTerm.toLowerCase())
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
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      setAccounts(prev => prev.map(acc => acc.id === editingAccount.id ? { ...acc, ...formData } as SignBillAccount : acc));
    } else {
      const newAccount: SignBillAccount = {
        ...formData as SignBillAccount,
        id: `SB-${Date.now()}`,
        currentDebt: formData.currentDebt || 0,
        lastTransactionDate: new Date().toISOString()
      };
      setAccounts(prev => [newAccount, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this account? 确定要删除该签单账户吗？')) {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    }
  };

  const openTransactionModal = (accountId: string, type: 'charge' | 'settle') => {
    setTransactionModal({ isOpen: true, type, accountId });
    setTransactionAmount('');
    setSettleMethod('CASH');
  };

  const handleTransaction = () => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    setAccounts(prev => prev.map(acc => {
      if (acc.id === transactionModal.accountId) {
        const newDebt = transactionModal.type === 'charge' 
          ? acc.currentDebt + amount 
          : Math.max(0, acc.currentDebt - amount);
        
        return {
          ...acc,
          currentDebt: newDebt,
          lastTransactionDate: new Date().toISOString()
        };
      }
      return acc;
    }));
    
    setTransactionModal({ ...transactionModal, isOpen: false });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <FileSignature className="text-indigo-600" /> 签单管理
           </h2>
           <p className="text-slate-500 text-sm mt-1">Manage Corporate Accounts & Settlements</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          <span>New Account 新增账户</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Credit 挂账总额</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">₱{totalDebt.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <Wallet size={24} />
          </div>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Active Accounts 合作单位</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{activeCount}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
            <p className="text-sm font-medium text-slate-500">Pending Settlement 待结算</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {accounts.filter(a => a.currentDebt > 0).length}
            </h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
            <HandCoins size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search Name / 搜索单位或人名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-slate-50/50">
          {filteredAccounts.map(account => (
            <div key={account.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{account.name}</h3>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{account.cooperationMethod}</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{account.settlementMethod}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenModal(account)}
                  className="text-slate-400 hover:text-indigo-600 p-1"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-600 mb-6">
                 <div className="flex items-center justify-between">
                   <span className="flex items-center gap-2"><UserCheck size={14} /> Approver 批准人:</span>
                   <span className="font-medium text-slate-800">{account.approver}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="flex items-center gap-2"><Phone size={14} /> Phone 电话:</span>
                   <span className="font-mono">{account.phoneNumber}</span>
                 </div>
                 {account.creditLimit && account.creditLimit > 0 && (
                   <div className="flex items-center justify-between">
                     <span className="flex items-center gap-2 text-slate-400">Limit 额度:</span>
                     <span className="font-mono">₱{account.creditLimit.toLocaleString()}</span>
                   </div>
                 )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                   <p className="text-xs text-slate-400 mb-0.5">Current Debt 当前欠款</p>
                   <p className={`text-xl font-bold ${account.currentDebt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                     ₱{account.currentDebt.toLocaleString()}
                   </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openTransactionModal(account.id, 'charge')}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Charge 记账"
                  >
                    <ArrowDownRight size={20} />
                  </button>
                  <button 
                    onClick={() => openTransactionModal(account.id, 'settle')}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingAccount ? 'Edit Account 编辑账户' : 'New Account 新增账户'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name 单位/个人名称</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Construction Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type 合作方式</label>
                  <select 
                     value={formData.cooperationMethod}
                     onChange={e => setFormData(prev => ({ ...prev, cooperationMethod: e.target.value }))}
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="协议单位">Agreement 协议单位</option>
                    <option value="长期合作">Long-term 长期合作</option>
                    <option value="熟客挂帐">VIP 熟客挂帐</option>
                    <option value="临时挂帐">Temp 临时挂帐</option>
                    <option value="员工签单">Staff 员工签单</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Settlement 结算方式</label>
                  <select 
                     value={formData.settlementMethod}
                     onChange={e => setFormData(prev => ({ ...prev, settlementMethod: e.target.value }))}
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="月结">Monthly 月结</option>
                    <option value="季结">Quarterly 季结</option>
                    <option value="单笔结">Per Bill 单笔结</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Approver 批准人</label>
                  <input
                    type="text"
                    required
                    value={formData.approver}
                    onChange={e => setFormData(prev => ({ ...prev, approver: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone 电话</label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Debt 初始欠款</label>
                  <input
                    type="number"
                    min="0"
                    disabled={!!editingAccount}
                    value={formData.currentDebt}
                    onChange={e => setFormData(prev => ({ ...prev, currentDebt: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Credit Limit 额度 (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.creditLimit}
                    onChange={e => setFormData(prev => ({ ...prev, creditLimit: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                {editingAccount && (
                  <button
                    type="button"
                    onClick={() => { handleDelete(editingAccount.id); setIsModalOpen(false); }}
                    className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors mr-auto"
                  >
                    Delete 删除
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel 取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-200"
                >
                  Save 保存
                </button>
              </div>
            </form>
           </div>
        </div>
      )}

      {transactionModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {transactionModal.type === 'charge' ? 'Add Charge 记账' : 'Settle Payment 结算还款'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Enter amount below
            </p>
            
            <div className="relative mb-6">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₱</span>
               <input 
                 type="number"
                 min="0"
                 autoFocus
                 value={transactionAmount}
                 onChange={e => setTransactionAmount(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 text-2xl font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                 placeholder="0.00"
               />
            </div>

            {transactionModal.type === 'settle' && (
              <div className="mb-6 text-left">
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method 方式</label>
                <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setSettleMethod('CASH')} className={`px-2 py-2 text-xs rounded border ${settleMethod === 'CASH' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-200'}`}>现金 Cash</button>
                   <button onClick={() => setSettleMethod('USDT')} className={`px-2 py-2 text-xs rounded border ${settleMethod === 'USDT' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-slate-200'}`}>USDT</button>
                   <button onClick={() => setSettleMethod('ALIPAY')} className={`px-2 py-2 text-xs rounded border ${settleMethod === 'ALIPAY' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200'}`}>支付宝 Alipay</button>
                   <button onClick={() => setSettleMethod('WECHAT')} className={`px-2 py-2 text-xs rounded border ${settleMethod === 'WECHAT' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200'}`}>微信 WeChat</button>
                   <button onClick={() => setSettleMethod('GCASH')} className={`px-2 py-2 text-xs rounded border ${settleMethod === 'GCASH' ? 'bg-blue-500 border-blue-600 text-white' : 'bg-white border-slate-200'}`}>GCash</button>
                   <button onClick={() => setSettleMethod('MAYA')} className={`px-2 py-2 text-xs rounded border ${settleMethod === 'MAYA' ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-slate-200'}`}>Maya</button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setTransactionModal({ ...transactionModal, isOpen: false })}
                className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel 取消
              </button>
              <button
                onClick={handleTransaction}
                className={`flex-1 py-2 text-white rounded-lg transition-colors font-medium shadow-lg ${
                  transactionModal.type === 'charge' 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
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
