import React, { useState, useEffect } from 'react';
import { Save, Store, Printer, Cloud, Check, DollarSign, AlertTriangle, Wifi, Info, Upload } from 'lucide-react';
import { getStorageSettings, saveStorageSettings } from '../services/storage';
import { StorageSettings, StoreInfo } from '../types';
import { PrinterService } from '../services/printer';
import DataManagement from './DataManagement';

interface SettingsProps {
  onSettingsChange?: (settings: any) => void;
}

// 系统版本信息 - 硬编码
const SYSTEM_VERSION = 'v1.0.0';
const SYSTEM_NAME = '江西酒店管理系统';
const SYSTEM_CODE = 'JX-HMS-2025';

const Settings: React.FC<SettingsProps> = ({ onSettingsChange }) => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: '江西酒店 (Jinjiang Star Hotel)',
    address: '5 Corner Lourdes Street and Roxas Boulevard, Pasay City',
    phone: '+639084156449',
    openingHours: '10:00 - 02:00',
    kitchenPrinterUrl: '',
    wifiSsid: 'jx88888888',
    wifiPassword: '',
    telegram: '@jx555999'
  });

  const [categories, setCategories] = useState<string[]>(['热菜', '凉菜', '汤羹', '主食', '酒水', '特色菜']);

  const [notifications, setNotifications] = useState({
    sound: true,
    desktop: true
  });

  const [localFinancials, setLocalFinancials] = useState({
    exchangeRate: 8.2,
    serviceCharge: 10
  });

  // Storage State
  const [storageSettings, setStorageSettings] = useState<StorageSettings>(getStorageSettings());
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

  // Load standard settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('jx_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.storeInfo) setStoreInfo(prev => ({ ...prev, ...parsed.storeInfo as StoreInfo }));
      if (parsed.notifications) setNotifications(parsed.notifications);
      if (parsed.exchangeRate) setLocalFinancials(prev => ({ ...prev, exchangeRate: parsed.exchangeRate }));
      if (parsed.serviceChargeRate) setLocalFinancials(prev => ({ ...prev, serviceCharge: parsed.serviceChargeRate * 100 }));
      if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
    }

    // Auto-test connection if configured
    // Removed connection testing as we're only using Vercel Blob Storage now
  }, []);

  const handleSave = () => {
    // Save UI settings
    const settings = {
      storeInfo,
      notifications,
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

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // const executeReset = () => {
  //     localStorage.removeItem('jx_dishes');
  //     localStorage.removeItem('jx_orders');
  //     localStorage.removeItem('jx_expenses');
  //     localStorage.removeItem('jx_settings');
  //     localStorage.removeItem('jx_inventory');
  //     window.location.reload();
  // };

  // const handleResetData = () => {
  //     setConfirmInput('');
  //     setConfirmModal({
  //         open: true,
  //         level: 'high',
  //         title: '系统级警告 System Warning',
  //         message: '此操作将永久清除浏览器中的所有本地数据！包括订单、菜单和财务记录。如果是“本地存储”模式，数据将无法恢复。\n\n如需继续，请在下方输入 "RESET"',
  //         action: executeReset
  //     });
  // };

  const handleTestConnection = async () => {
    // Connection testing removed as we're only using Vercel Blob Storage now
    // All connections are handled automatically by the Vercel Blob Storage client
    // Return a resolved promise to satisfy async signature
    return Promise.resolve();
  };

  // Category Logic


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

  // 添加同步状态
  // const [isSyncing, setIsSyncing] = useState(false);
  // const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 添加手动同步函数
  // const handleManualSync = async () => {
  //   // Manual sync removed as we're only using Vercel Blob Storage now
  //   // All data is automatically synced by the Vercel Blob Storage client
  //   setIsSyncing(true);
  //   setSyncStatus('idle');
  //   
  //   try {
  //     // Simulate sync process
  //     await new Promise(resolve => setTimeout(resolve, 1000));
  //     setSyncStatus('success');
  //     setTimeout(() => setSyncStatus('idle'), 3000);
  //   } catch (error) {
  //     console.error('Sync error:', error);
  //     setSyncStatus('error');
  //   } finally {
  //     setIsSyncing(false);
  //   }
  // };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">系统设置 Settings</h2>
           <p className="text-slate-500 text-sm mt-1">全局配置与权限管理</p>
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
             <span className="flex items-center gap-2"><Store className="text-slate-400" size={20} /> 店铺信息</span>
             <button onClick={handleTestPrint} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 text-slate-600 flex items-center gap-1">
               <Printer size={12} /> Test Print
             </button>
           </h3>
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">店铺名称</label>
                <input 
                  type="text" 
                  value={storeInfo.name}
                  onChange={e => setStoreInfo({ ...storeInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">地址</label>
                <input 
                  type="text" 
                  value={storeInfo.address}
                  onChange={e => setStoreInfo({ ...storeInfo, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">电话</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Kitchen Printer URL</label>
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

        {/* 2. System Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Info className="text-slate-400" size={20} /> 系统信息
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800">系统名称</span>
                 </div>
                 <span className="text-sm text-slate-500">{SYSTEM_NAME}</span>
               </div>
               
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800">系统版本</span>
                 </div>
                 <span className="text-sm text-slate-500">{SYSTEM_VERSION}</span>
               </div>
               
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800">系统编码</span>
                 </div>
                 <span className="text-sm text-slate-500">{SYSTEM_CODE}</span>
               </div>
               
               <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                 <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800">数据存储</span>
                 </div>
                 <span className="text-sm text-slate-500">Vercel Blob Storage</span>
               </div>
               
               <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                 <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800">部署环境</span>
                 </div>
                 <span className="text-sm text-slate-500">Production</span>
               </div>
            </div>
        </div>

        {/* 3. Financial Parameters */}
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

        {/* 4. Data Storage */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Cloud size={120} />
           </div>
           
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Cloud className="text-blue-500" size={20} /> 数据存储
           </h3>

           <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
             <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
               <Info size={16} /> 系统数据存储说明
             </h4>
             <p className="text-sm text-blue-700">
               本系统现在使用 Vercel Blob Storage 作为主要数据存储方案，所有数据（菜单、订单、财务等）都实时存储在云端存储中。
             </p>
           </div>

           <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="w-full md:w-64 space-y-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">存储方式</label>
                 
                 <button 
                   onClick={() => setStorageSettings({ ...storageSettings, type: 'blob' })}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${storageSettings.type === 'blob' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
                 >
                    <Cloud size={20} className="text-slate-600" />
                    <div>
                       <div className="font-bold text-sm">Vercel Blob Storage</div>
                       <div className="text-xs text-slate-500">Cloud Storage</div>
                    </div>
                 </button>
              </div>

              <div className="flex-1 bg-slate-50 rounded-xl p-6 border border-slate-200">
                 
                 {storageSettings.type === 'blob' && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-4 py-6">
                       <Cloud size={48} className="opacity-20" />
                       <p>数据存储在 Vercel Blob Storage 中。<br/>所有数据实时备份到云端，确保数据安全。</p>
                    </div>
                 )}
              </div>
           </div>
           
           <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-xs font-bold flex items-center gap-1"><Wifi size={14} /> 连接成功 Connected</span>
              </div>
              <button 
                onClick={() => handleTestConnection()}
                disabled={true}
                className="text-sm font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 disabled:opacity-50"
              >
                自动连接 Automatic Connection
              </button>
           </div>
        </div>

      </div>

      {/* Data Management */}
      <DataManagement onDataUpdate={() => window.location.reload()} />

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className={`p-6 ${confirmModal.level === 'high' ? 'bg-red-50' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-full ${confirmModal.level === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                            <AlertTriangle size={32} />
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