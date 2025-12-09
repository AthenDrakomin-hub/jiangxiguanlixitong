
import React, { useState, useEffect } from 'react';
import { Save, Store, Printer, List, RotateCcw, ShieldCheck, GitBranch, Github, HardDrive, Cloud, Check, Plus, Trash2, CreditCard, DollarSign, AlertTriangle, AlertOctagon, Wifi, WifiOff, Info } from 'lucide-react';
import { getStorageSettings, saveStorageSettings, testS3Connection, testGitHubConnection } from '../services/storage';
import { StorageSettings, StoreInfo, PaymentConfig } from '../types';
import { PrinterService } from '../services/printer';

interface SettingsProps {
  onSettingsChange?: (settings: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ onSettingsChange }) => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: '江西饭店 (Jinjiang Star Hotel)',
    address: '5 Corner Lourdes Street and Roxas Boulevard, Pasay City',
    phone: '+639084156449',
    openingHours: '10:00 - 02:00',
    kitchenPrinterUrl: '',
    wifiSsid: 'jx88888888',
    wifiPassword: '',
    telegram: '@jx555999'
  });

  const [categories, setCategories] = useState<string[]>(['热菜', '凉菜', '汤羹', '主食', '酒水', '特色菜']);
  const [newCategory, setNewCategory] = useState('');

  const [notifications, setNotifications] = useState({
    sound: true,
    desktop: true
  });

  const [localFinancials, setLocalFinancials] = useState({
    exchangeRate: 8.2,
    serviceCharge: 10
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    enabledMethods: ['CASH'],
    aliPayEnabled: false,
    weChatEnabled: false,
    gCashEnabled: true,
    mayaEnabled: true
  });

  // Storage State
  const [storageSettings, setStorageSettings] = useState<StorageSettings>(getStorageSettings());
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'none' | 'success' | 'failure'>('none');
  const [s3Provider, setS3Provider] = useState<string>('custom');

  const [showToast, setShowToast] = useState(false);
  
  // Safety Confirmation State
  const [confirmModal, setConfirmModal] = useState<{
      open: boolean;
      level: 'low' | 'high'; // low = 2 clicks, high = type to confirm
      title: string;
      message: string;
      action: () => void;
  }>({ open: false, level: 'low', title: '', message: '', action: () => {} });
  
  const [confirmInput, setConfirmInput] = useState('');

  // Check if using Env Vars (for UI indication) - Safely
  const env = (import.meta as any).env || {};
  const usingGithubEnv = !!(env.VITE_GITHUB_TOKEN);
  const usingS3Env = !!(env.VITE_S3_ACCESS_KEY);

  // Load standard settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('jx_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.storeInfo) setStoreInfo(prev => ({ ...prev, ...parsed.storeInfo as StoreInfo }));
      if (parsed.notifications) setNotifications(parsed.notifications);
      if (parsed.exchangeRate) setLocalFinancials(prev => ({ ...prev, exchangeRate: parsed.exchangeRate }));
      if (parsed.serviceChargeRate) setLocalFinancials(prev => ({ ...prev, serviceCharge: parsed.serviceChargeRate * 100 }));
      if (parsed.payment) setPaymentConfig(prev => ({ ...prev, ...parsed.payment as PaymentConfig }));
      if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
    }

    // Auto-test connection if configured
    if (storageSettings.type !== 'local') {
        handleTestConnection(storageSettings);
    }
  }, []);

  const handleSave = () => {
    // Save UI settings
    const settings = {
      storeInfo,
      notifications,
      payment: paymentConfig,
      exchangeRate: localFinancials.exchangeRate,
      serviceChargeRate: localFinancials.serviceCharge / 100,
      categories
    };
    localStorage.setItem('jx_settings', JSON.stringify(settings));

    // Save Storage Settings
    saveStorageSettings(storageSettings);

    // Notify Parent
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
    
    // Re-test connection if storage settings changed
    if (storageSettings.type !== 'local') {
        handleTestConnection(storageSettings);
    }

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const executeReset = () => {
      localStorage.removeItem('jx_dishes');
      localStorage.removeItem('jx_orders');
      localStorage.removeItem('jx_expenses');
      localStorage.removeItem('jx_settings');
      localStorage.removeItem('jx_inventory');
      window.location.reload();
  };

  const handleResetData = () => {
      setConfirmInput('');
      setConfirmModal({
          open: true,
          level: 'high',
          title: '系统级警告 System Warning',
          message: '此操作将永久清除浏览器中的所有本地数据！包括订单、菜单和财务记录。如果是“本地存储”模式，数据将无法恢复。\n\n如需继续，请在下方输入 "RESET"',
          action: executeReset
      });
  };

  const handleTestConnection = async (currentSettings = storageSettings) => {
    setIsTestLoading(true);
    setTestStatus('none');
    
    let success = false;
    if (currentSettings.type === 's3') {
      success = await testS3Connection(currentSettings.s3Config);
    } else if (currentSettings.type === 'github') {
      success = await testGitHubConnection(currentSettings.githubConfig);
    }
    
    setIsTestLoading(false);
    setTestStatus(success ? 'success' : 'failure');
  };

  // Category Logic
  const handleAddCategory = () => {
      if(newCategory && !categories.includes(newCategory)) {
          setCategories([...categories, newCategory]);
          setNewCategory('');
      }
  };

  const handleRemoveCategory = (cat: string) => {
      setConfirmModal({
          open: true,
          level: 'low',
          title: '确认删除分类',
          message: `确定要删除分类 "${cat}" 吗？注意：属于该分类的菜品可能会显示异常。`,
          action: () => setCategories(categories.filter(c => c !== cat))
      });
  };

  const handleS3ProviderChange = (provider: string) => {
    setS3Provider(provider);
    let endpoint = '';
    let region = 'auto';

    switch (provider) {
      case 'google':
        endpoint = 'https://storage.googleapis.com';
        break;
      case 'cloudflare':
        endpoint = 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com';
        break;
      case 'minio':
        endpoint = 'http://localhost:9000';
        region = 'us-east-1';
        break;
    }

    setStorageSettings(prev => ({
      ...prev,
      s3Config: { ...prev.s3Config, endpoint, region }
    }));
  };

  const handleTestPrint = () => {
      const dummyOrder: any = {
          id: 'TEST-001',
          tableNumber: 'A1',
          source: 'LOBBY',
          createdAt: new Date().toISOString(),
          paymentMethod: 'CASH',
          totalAmount: 1234,
          items: [
              { dishName: 'Kung Pao Chicken', quantity: 1, price: 500 },
              { dishName: 'Rice', quantity: 2, price: 50 },
              { dishName: 'Cola', quantity: 2, price: 80 }
          ]
      };
      PrinterService.printOrder(dummyOrder);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">系统设置 Settings</h2>
           <p className="text-slate-500 text-sm mt-1">店铺信息、支付方式、云同步</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95"
        >
          {showToast ? <Check size={20} /> : <Save size={20} />}
          <span>{showToast ? '已保存!' : '保存设置 Save'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Store Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
             <span className="flex items-center gap-2"><Store className="text-slate-400" size={20} /> 店铺信息 (H5 Display)</span>
             <button onClick={handleTestPrint} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 text-slate-600 flex items-center gap-1">
               <Printer size={12} /> Test Print
             </button>
           </h3>
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">店铺名称 (Name)</label>
                <input 
                  type="text" 
                  value={storeInfo.name}
                  onChange={e => setStoreInfo({ ...storeInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">地址 (Address)</label>
                <input 
                  type="text" 
                  value={storeInfo.address}
                  onChange={e => setStoreInfo({ ...storeInfo, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">电话 (Phone)</label>
                   <input 
                     type="text" 
                     value={storeInfo.phone}
                     onChange={e => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Telegram</label>
                   <input 
                     type="text" 
                     value={storeInfo.telegram}
                     onChange={e => setStoreInfo({ ...storeInfo, telegram: e.target.value })}
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                   />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">WiFi SSID</label>
                   <input 
                     type="text" 
                     value={storeInfo.wifiSsid}
                     onChange={e => setStoreInfo({ ...storeInfo, wifiSsid: e.target.value })}
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">WiFi Password</label>
                   <input 
                     type="text" 
                     value={storeInfo.wifiPassword}
                     onChange={e => setStoreInfo({ ...storeInfo, wifiPassword: e.target.value })}
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                     placeholder="No password"
                   />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kitchen Printer URL / 厨房打印机地址</label>
                 <input 
                   type="text" 
                   value={storeInfo.kitchenPrinterUrl || ''}
                   onChange={e => setStoreInfo({ ...storeInfo, kitchenPrinterUrl: e.target.value })}
                   className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                   placeholder="e.g. 192.168.1.200 or /dev/usb/lp0"
                 />
              </div>
           </div>
        </div>

        {/* 2. Menu Categories */}
        {/* Moved to MenuManagement component for better organization */}

        {/* 3. Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard className="text-slate-400" size={20} /> H5 支付方式配置
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800 flex items-center gap-2">
                     💳 现金支付 Cash
                   </span>
                   <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">Always On</span>
                 </div>
                 <span className="text-sm text-slate-500">无需配置 / No Setup Required</span>
               </div>
               
               <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                 <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800 flex items-center gap-2">
                     📱 GCash
                   </span>
                   <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                     {paymentConfig.gCashEnabled ? 'ENABLED' : 'DISABLED'}
                   </span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-sm text-slate-500">菲律宾主流支付</span>
                   <input 
                      type="checkbox" 
                      checked={paymentConfig.gCashEnabled}
                      onChange={e => setPaymentConfig({ ...paymentConfig, gCashEnabled: e.target.checked })}
                      className="w-5 h-5 text-slate-900 rounded focus:ring-slate-900"
                   />
                 </div>
               </div>
               
               <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                 <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800 flex items-center gap-2">
                     💚 Maya
                   </span>
                   <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                     {paymentConfig.mayaEnabled ? 'ENABLED' : 'DISABLED'}
                   </span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-sm text-slate-500">菲律宾主流支付</span>
                   <input 
                      type="checkbox" 
                      checked={paymentConfig.mayaEnabled}
                      onChange={e => setPaymentConfig({ ...paymentConfig, mayaEnabled: e.target.checked })}
                      className="w-5 h-5 text-slate-900 rounded focus:ring-slate-900"
                   />
                 </div>
               </div>
               
               <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                 <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800 flex items-center gap-2">
                     🔵 Alipay 支付宝
                   </span>
                   <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                     {paymentConfig.aliPayEnabled ? 'ENABLED' : 'DISABLED'}
                   </span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-sm text-slate-500">中国用户首选</span>
                   <input 
                      type="checkbox" 
                      checked={paymentConfig.aliPayEnabled}
                      onChange={e => setPaymentConfig({ ...paymentConfig, aliPayEnabled: e.target.checked })}
                      className="w-5 h-5 text-slate-900 rounded focus:ring-slate-900"
                   />
                 </div>
               </div>
               
               <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                 <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800 flex items-center gap-2">
                     🟢 WeChat Pay 微信支付
                   </span>
                   <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                     {paymentConfig.weChatEnabled ? 'ENABLED' : 'DISABLED'}
                   </span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className="text-sm text-slate-500">中国用户首选</span>
                   <input 
                      type="checkbox" 
                      checked={paymentConfig.weChatEnabled}
                      onChange={e => setPaymentConfig({ ...paymentConfig, weChatEnabled: e.target.checked })}
                      className="w-5 h-5 text-slate-900 rounded focus:ring-slate-900"
                   />
                 </div>
               </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Info size={16} /> 支付配置说明
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 启用的支付方式将在客户下单时显示</li>
                <li>• 现金支付始终可用，无法禁用</li>
                <li>• 移动支付将引导客户至相应应用完成付款</li>
                <li>• 所有交易需手动确认收款</li>
              </ul>
            </div>
        </div>

        {/* 4. Financials */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               <DollarSign className="text-slate-400" size={20} /> 财务参数
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">汇率 (1 RMB = ? PHP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">1 :</span>
                    <input 
                        type="number" 
                        value={localFinancials.exchangeRate}
                        onChange={e => setLocalFinancials({ ...localFinancials, exchangeRate: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">服务费率 (%)</label>
                  <div className="relative">
                    <input 
                        type="number" 
                        value={localFinancials.serviceCharge}
                        onChange={e => setLocalFinancials({ ...localFinancials, serviceCharge: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                  </div>
               </div>
            </div>
        </div>

        {/* 5. Data Storage & Sync */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Cloud size={120} />
           </div>
           
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Cloud className="text-blue-500" size={20} /> 数据存储与云同步
           </h3>

           <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="w-full md:w-64 space-y-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">存储方式</label>
                 
                 <button 
                   onClick={() => setStorageSettings({ ...storageSettings, type: 'local' })}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${storageSettings.type === 'local' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
                 >
                    <HardDrive size={20} className="text-slate-600" />
                    <div>
                       <div className="font-bold text-sm">本机缓存</div>
                       <div className="text-xs text-slate-500">Local Only</div>
                    </div>
                 </button>

                 <button 
                   onClick={() => setStorageSettings({ ...storageSettings, type: 'github' })}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${storageSettings.type === 'github' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
                 >
                    <Github size={20} className="text-slate-600" />
                    <div>
                       <div className="font-bold text-sm">GitHub 云同步</div>
                       <div className="text-xs text-slate-500">Git Storage</div>
                    </div>
                 </button>
                 
                 <button 
                   onClick={() => setStorageSettings({ ...storageSettings, type: 's3' })}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${storageSettings.type === 's3' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
                 >
                    <Cloud size={20} className="text-slate-600" />
                    <div>
                       <div className="font-bold text-sm">S3 对象存储</div>
                       <div className="text-xs text-slate-500">Enterprise</div>
                    </div>
                 </button>
              </div>

              <div className="flex-1 bg-slate-50 rounded-xl p-6 border border-slate-200">
                 
                 {storageSettings.type === 'local' && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-4 py-6">
                       <HardDrive size={48} className="opacity-20" />
                       <p>数据存储在当前浏览器的 LocalStorage 中。<br/>清理浏览器缓存会导致数据丢失。</p>
                       <div className="flex gap-4">
                          <button onClick={handleResetData} className="text-red-600 hover:underline text-sm flex items-center gap-1">
                             <RotateCcw size={14} /> 恢复出厂设置 (Reset)
                          </button>
                       </div>
                    </div>
                 )}

                 {storageSettings.type === 'github' && (
                    <div className="space-y-4 animate-in fade-in">
                       <div className="flex justify-between items-center">
                          <h4 className="font-bold flex items-center gap-2"><Github size={18} /> GitHub 仓库配置</h4>
                          {usingGithubEnv && (
                             <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck size={12} /> Environment Configured
                             </span>
                          )}
                       </div>
                       <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 mb-4">
                          {usingGithubEnv 
                             ? '已检测到 Vercel 环境变量配置。系统将自动连接到指定仓库。' 
                             : '推荐使用此方式。配置后，所有订单和菜单数据将自动保存到您的 GitHub 私有仓库，实现多台电脑/手机数据同步。'}
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">用户名 (Owner)</label>
                            <input type="text" value={storageSettings.githubConfig.owner} onChange={e => setStorageSettings({...storageSettings, githubConfig: {...storageSettings.githubConfig, owner: e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">仓库名 (Repository)</label>
                            <input type="text" value={storageSettings.githubConfig.repo} onChange={e => setStorageSettings({...storageSettings, githubConfig: {...storageSettings.githubConfig, repo: e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300 text-sm" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">分支 (Branch)</label>
                            <div className="relative">
                               <GitBranch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                               <input type="text" value={storageSettings.githubConfig.branch} onChange={e => setStorageSettings({...storageSettings, githubConfig: {...storageSettings.githubConfig, branch: e.target.value}})} className="w-full pl-8 pr-3 py-2 rounded border border-slate-300 text-sm" />
                            </div>
                          </div>
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">访问令牌 (Token)</label>
                             <input type="password" value={storageSettings.githubConfig.token} onChange={e => setStorageSettings({...storageSettings, githubConfig: {...storageSettings.githubConfig, token: e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300 text-sm" placeholder="ghp_..." />
                          </div>
                       </div>
                    </div>
                 )}

                 {storageSettings.type === 's3' && (
                    <div className="space-y-4 animate-in fade-in">
                       <div className="flex justify-between items-center">
                          <h4 className="font-bold flex items-center gap-2"><Cloud size={18} /> S3 对象存储配置</h4>
                          {usingS3Env && (
                             <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck size={12} /> Environment Configured
                             </span>
                          )}
                          <select 
                             value={s3Provider} 
                             onChange={(e) => handleS3ProviderChange(e.target.value)}
                             className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                          >
                             <option value="custom">自定义 S3</option>
                             <option value="google">Google Cloud Storage</option>
                             <option value="cloudflare">Cloudflare R2</option>
                             <option value="minio">MinIO (自建)</option>
                          </select>
                       </div>
                       
                       <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 mb-4">
                          {usingS3Env 
                             ? '已检测到 S3 环境变量配置。系统将自动连接。' 
                             : '可连接 Cloudflare R2 (免费) 或 MinIO (自建)。'}
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Bucket Name</label>
                            <input type="text" value={storageSettings.s3Config.bucket} onChange={e => setStorageSettings({...storageSettings, s3Config: {...storageSettings.s3Config, bucket: e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Region</label>
                            <input type="text" value={storageSettings.s3Config.region} onChange={e => setStorageSettings({...storageSettings, s3Config: {...storageSettings.s3Config, region: e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300 text-sm" />
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Endpoint (服务器地址)</label>
                          <input type="text" value={storageSettings.s3Config.endpoint || ''} onChange={e => setStorageSettings({...storageSettings, s3Config: {...storageSettings.s3Config, endpoint: e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300 text-sm" placeholder="https://..." />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Access Key ID</label>
                            <input type="text" value={storageSettings.s3Config.accessKeyId} onChange={e => setStorageSettings({...storageSettings, s3Config: {...storageSettings.s3Config, accessKeyId: e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Secret Access Key</label>
                            <input type="password" value={storageSettings.s3Config.secretAccessKey} onChange={e => setStorageSettings({...storageSettings, s3Config: {...storageSettings.s3Config, secretAccessKey: e.target.value}})} className="w-full px-3 py-2 rounded border border-slate-300 text-sm" />
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>

           {storageSettings.type !== 'local' && (
                    <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          {testStatus === 'success' && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><Wifi size={14} /> 连接成功 Connected</span>}
                          {testStatus === 'failure' && <span className="text-red-600 text-xs font-bold flex items-center gap-1"><WifiOff size={14} /> 连接失败 Failed</span>}
                          {testStatus === 'none' && <span className="text-slate-400 text-xs flex items-center gap-1">Checking connection...</span>}
                       </div>
                       <button 
                         onClick={() => handleTestConnection(storageSettings)}
                         disabled={isTestLoading}
                         className="text-sm font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 disabled:opacity-50"
                       >
                         {isTestLoading ? '测试中...' : '重试 Test Again'}
                       </button>
                    </div>
                 )}

           <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-orange-800">
                 <strong>数据安全提示：</strong><br/>
                 GitHub 令牌 (Token) 已加密存储。如需更换设备，请确保已通过环境变量配置或记住您的 Token。
              </div>
           </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className={`p-6 ${confirmModal.level === 'high' ? 'bg-red-50' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-full ${confirmModal.level === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                            {confirmModal.level === 'high' ? <AlertOctagon size={32} /> : <AlertTriangle size={32} />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{confirmModal.title}</h3>
                    </div>
                    <p className="text-slate-600 mb-6 whitespace-pre-wrap leading-relaxed">{confirmModal.message}</p>
                    
                    {confirmModal.level === 'high' && (
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type "RESET" to confirm</label>
                            <input 
                                type="text" 
                                className="w-full border-2 border-red-200 rounded-lg px-4 py-2 focus:border-red-600 focus:outline-none font-mono"
                                placeholder="RESET"
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                            className="flex-1 px-4 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                        >
                            Cancel 取消
                        </button>
                        <button 
                            onClick={() => {
                                if (confirmModal.level === 'high' && confirmInput !== 'RESET') return;
                                confirmModal.action();
                                setConfirmModal({ ...confirmModal, open: false });
                            }}
                            disabled={confirmModal.level === 'high' && confirmInput !== 'RESET'}
                            className={`flex-1 px-4 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${
                                confirmModal.level === 'high' 
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed' 
                                    : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                            }`}
                        >
                            Confirm 确认
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
