
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
import { SignBillAccount, PaymentMethod, AccountStatus } from '../types';
import { apiClient } from '../services/apiClient';

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

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.approver?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAccount) {
        // 更新现有账户
        const updatedAccount: SignBillAccount = {
          ...editingAccount,
          ...formData,
          name: formData.name || editingAccount.name,
          cooperationMethod: formData.cooperationMethod || editingAccount.cooperationMethod,
          settlementMethod: formData.settlementMethod || editingAccount.settlementMethod,
          approver: formData.approver || editingAccount.approver,
          phoneNumber: formData.phoneNumber || editingAccount.phoneNumber,
          creditLimit: formData.creditLimit ?? editingAccount.creditLimit,
          currentDebt: formData.currentDebt ?? editingAccount.currentDebt,
          status: (formData.status as AccountStatus) || editingAccount.status,
        };
        
        await apiClient.put(`/sign_bill_accounts?id=${editingAccount.id}`, updatedAccount);
        
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === editingAccount.id ? updatedAccount : acc
          )
        );
      } else {
        // 创建新账户
        const newAccountData = {
          name: formData.name || '',
          cooperationMethod: formData.cooperationMethod || '协议单位',
          settlementMethod: formData.settlementMethod || '月结',
          approver: formData.approver || '',
          phoneNumber: formData.phoneNumber || '',
          creditLimit: formData.creditLimit || 0,
          currentDebt: formData.currentDebt || 0,
          status: (formData.status as AccountStatus) || 'Active',
          lastTransactionDate: new Date().toISOString(),
        };
        
        const response = await apiClient.post('/sign_bill_accounts', newAccountData);
        
        if (response.success && response.data) {
          setAccounts((prev) => [response.data, ...prev]);
        }
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('保存账户失败:', error);
      alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleTransaction = async () => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效金额');
      return;
    }

    const account = accounts.find(acc => acc.id === transactionModal.accountId);
    if (!account) return;

    const isSettle = transactionModal.type === 'settle';
    const newDebt = isSettle
      ? Math.max(0, account.currentDebt - amount)
      : account.currentDebt + amount;

    try {
      // 更新账户欠款
      const updatedAccount: SignBillAccount = {
        ...account,
        currentDebt: newDebt,
        lastTransactionDate: new Date().toISOString(),
      };
      
      await apiClient.put(`/sign_bill_accounts?id=${account.id}`, updatedAccount);

      // TODO: 记录交易历史到 expenses 或单独的 transactions 表
      // 包含 settleMethod 信息
      const transactionRecord = {
        accountId: account.id,
        accountName: account.name,
        type: transactionModal.type,
        amount: amount,
        paymentMethod: isSettle ? settleMethod : null,
        timestamp: new Date().toISOString(),
        previousDebt: account.currentDebt,
        newDebt: newDebt,
      };
      
      console.log('交易记录:', transactionRecord);
      // await apiClient.post('/expenses', transactionRecord); // 可选：记录到财务系统

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === account.id ? updatedAccount : acc
        )
      );

      setTransactionModal({ ...transactionModal, isOpen: false });
      setTransactionAmount('');
      setSettleMethod('CASH');
    } catch (error) {
      console.error('交易失败:', error);
      alert('操作失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* UI 保持原有美观设计，修正逻辑错误后的交互 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
           <FileSignature className="text-indigo-600" /> 财务签单系统
        </h2>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all">
          <Plus size={18} /> 新增账户
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <p className="text-slate-500 text-sm font-medium">挂账总额 Total Debt</p>
           <h3 className="text-3xl font-black text-rose-600 mt-2">₱ {totalDebt.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <p className="text-slate-500 text-sm font-medium">活跃单位 Active Units</p>
           <h3 className="text-3xl font-black text-slate-800 mt-2">{accounts.length}</h3>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="搜索单位、批准人..." 
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 列表渲染 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAccounts.map(account => (
          <div key={account.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h4 className="text-lg font-bold text-slate-800">{account.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase">{account.cooperationMethod}</span>
                    <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase">{account.settlementMethod}</span>
                  </div>
               </div>
               <button onClick={() => handleOpenModal(account)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
            </div>
            
            <div className="space-y-2 mb-6 text-sm text-slate-600">
               <div className="flex items-center gap-2"><UserCheck size={14} /> 批准人: {account.approver}</div>
               <div className="flex items-center gap-2"><Phone size={14} /> 电话: {account.phoneNumber}</div>
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-slate-50">
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">当前欠款 Current Debt</p>
                  <p className={`text-2xl font-black ${account.currentDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ₱ {account.currentDebt.toLocaleString()}
                  </p>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => setTransactionModal({ isOpen: true, type: 'charge', accountId: account.id })}
                    className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    <ArrowDownRight size={20} />
                  </button>
                  <button 
                    onClick={() => setTransactionModal({ isOpen: true, type: 'settle', accountId: account.id })}
                    className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <HandCoins size={20} />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* 交易弹窗 (包含结算方式选择) */}
      {transactionModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">
              {transactionModal.type === 'charge' ? '记账 (Add Charge)' : '还款 (Settle)'}
            </h3>
            <p className="text-center text-slate-500 text-sm mb-8">输入金额并确认方式</p>
            
            <div className="relative mb-6">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₱</span>
              <input 
                type="number" 
                autoFocus
                className="w-full pl-12 pr-6 py-5 bg-slate-50 rounded-2xl text-3xl font-black text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
              />
            </div>

            {transactionModal.type === 'settle' && (
              <div className="grid grid-cols-3 gap-2 mb-8">
                {(['CASH', 'USDT', 'ALIPAY', 'WECHAT', 'GCASH', 'MAYA'] as PaymentMethod[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setSettleMethod(m)}
                    className={`py-2 text-[9px] font-black rounded-lg border transition-all ${settleMethod === m ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-4">
               <button onClick={() => setTransactionModal({ ...transactionModal, isOpen: false })} className="flex-1 py-4 text-slate-500 font-bold">取消</button>
               <button onClick={handleTransaction} className={`flex-1 py-4 rounded-2xl text-white font-black shadow-lg ${transactionModal.type === 'charge' ? 'bg-rose-600 shadow-rose-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
                 确认
               </button>
            </div>
          </div>
        </div>
      )}

      {/* 账户编辑弹窗省略，逻辑与 handleSave 一致 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
           {/* ... 这里是你的表单代码 ... */}
           <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md">
              <h3 className="text-xl font-bold mb-6">账户设置</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <input 
                  placeholder="名称"
                  className="w-full p-3 bg-slate-50 rounded-xl"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  placeholder="批准人"
                  className="w-full p-3 bg-slate-50 rounded-xl"
                  value={formData.approver}
                  onChange={e => setFormData({...formData, approver: e.target.value})}
                />
                <input 
                  placeholder="电话"
                  className="w-full p-3 bg-slate-50 rounded-xl"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                />
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-500">取消</button>
                   <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">保存账户</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SignBillSystem;
