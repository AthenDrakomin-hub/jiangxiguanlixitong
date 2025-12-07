
import React, { useState, useEffect } from 'react';
import { Save, Bell, Store, Database, RotateCcw, Volume2, Monitor, Check, Cloud, HardDrive, Wifi, WifiOff, AlertTriangle, Printer, Github, GitBranch, DollarSign } from 'lucide-react';
import { StorageSettings } from '../types';
import { getStorageSettings, saveStorageSettings, testS3Connection, testGitHubConnection } from '../services/storage';

interface SettingsProps {
  onSettingsChange?: (settings: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ onSettingsChange }) => {
  const [storeInfo, setStoreInfo] = useState({
    name: '江西饭店',
    address: '江西省南昌市红谷滩新区',
    phone: '0791-88888888',
    openingHours: '10:00 - 22:00',
    kitchenPrinterUrl: ''
  });

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
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'none' | 'success' | 'failure'>('none');
  const [s3Provider, setS3Provider] = useState<string>('custom');

  const [showToast, setShowToast] = useState(false);
  
  // Load standard settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('jx_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.storeInfo) setStoreInfo(prev => ({ ...prev, ...parsed.storeInfo }));
      if (parsed.notifications) setNotifications(parsed.notifications);
      if (parsed.exchangeRate) setLocalFinancials(prev => ({ ...prev, exchangeRate: parsed.exchangeRate }));
      if (parsed.serviceChargeRate) setLocalFinancials(prev => ({ ...prev, serviceCharge: parsed.serviceChargeRate * 100 }));
    }
  }, []);

  const handleSave = () => {
    // Save UI settings
    const settings = {
      storeInfo,
      notifications,
      exchangeRate: localFinancials.exchangeRate,
      serviceChargeRate: localFinancials.serviceCharge / 100
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

  const handleResetData = () => {
    if (confirm('警告：此操作将清除浏览器中的所有本地数据（订单、菜单、财务）。如果已配置 GitHub 同步则不会影响云端。确定要继续吗？')) {
      localStorage.removeItem('jx_dishes');
      localStorage.removeItem('jx_orders');
      localStorage.removeItem('jx_expenses');
      localStorage.removeItem('jx_settings');
      localStorage.removeItem('jx_inventory');
      window.location.reload();
    }
  };

  const handleTestConnection = async () => {
    setIsTestLoading(true);
    setTestStatus('none');
    
    let success = false;
    if (storageSettings.type === 's3') {
      success = await testS3Connection(storageSettings.s3Config);
    } else if (storageSettings.type === 'github') {
      success = await testGitHubConnection(storageSettings.githubConfig);
    }
    
    setIsTestLoading(false);
    setTestStatus(success ? 'success' : 'failure');
  };

  const handleS3ProviderChange = (provider: string) => {
    setS3Provider(provider);
    let endpoint = '';
    let region = 'us-east-1';

    switch (provider) {
      case 'google':
        endpoint = 'https://storage.googleapis.com';
        region = 'auto';
        break;
      case 'cloudflare':
        endpoint = 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com';
        region = 'auto';
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

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">系统设置</h2>
           <p className="text-slate-500 text-sm mt-1">配置店铺信息、汇率及数据云同步</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95"
        >
          {showToast ? <Check size={20} /> : <Save size={20} />}
          <span>{showToast ? '已保存!' : '保存设置'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Store Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Store className="text-slate-400" size={20} /> 店铺基本信息
           </h3>
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">店铺名称 (H5标题)</label>
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
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
                   <input 
                     type="text" 
                     value={storeInfo.phone}
                     onChange={e => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">营业时间</label>
                   <input 
                     type="text" 
                     value={storeInfo.openingHours}
                     onChange={e => setStoreInfo({ ...storeInfo, openingHours: e.target.value })}
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                   />
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Printer size={14} /> 厨房打印机 (IP地址)
                 </label>
                 <input 
                   type="text" 
                   value={storeInfo.kitchenPrinterUrl}
                   onChange={e => setStoreInfo({ ...storeInfo, kitchenPrinterUrl: e.target.value })}
                   placeholder="例如: 192.168.1.100"
                   className="w-full px-4 py-2 border border-slate-200 rounded-lg font-mono text-sm"
                 />
              </div>
           </div>
        </div>

        {/* 2. System & Financial */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bell className="text-slate-400" size={20} /> 消息通知
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded shadow-sm"><Volume2 size={18} /></div>
                    <span className="text-sm font-medium text-slate-700">新订单提示音 Sound</span>
                 </div>
                 <input 
                    type="checkbox" 
                    checked={notifications.sound}
                    onChange={e => setNotifications({ ...notifications, sound: e.target.checked })}
                    className="w-5 h-5 text-slate-900 rounded focus:ring-slate-900"
                 />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded shadow-sm"><Monitor size={18} /></div>
                    <span className="text-sm font-medium text-slate-700">桌面弹窗通知 Desktop</span>
                 </div>
                 <input 
                    type="checkbox" 
                    checked={notifications.desktop}
                    onChange={e => setNotifications({ ...notifications, desktop: e.target.checked })}
                    className="w-5 h-5 text-slate-900 rounded focus:ring-slate-900"
                 />
              </div>
            </div>
          </div>

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
        </div>

        {/* 3. Data Storage & Sync */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Database size={120} />
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
                       <div className="font-bold text-sm">本机缓存 (默认)</div>
                       <div className="text-xs text-slate-500">速度快，单机使用</div>
                    </div>
                 </button>

                 <button 
                   onClick={() => setStorageSettings({ ...storageSettings, type: 'github' })}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${storageSettings.type === 'github' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
                 >
                    <Github size={20} className="text-slate-600" />
                    <div>
                       <div className="font-bold text-sm">GitHub 云同步</div>
                       <div className="text-xs text-slate-500">支持多端同步，免费</div>
                    </div>
                 </button>
                 
                 <button 
                   onClick={() => setStorageSettings({ ...storageSettings, type: 's3' })}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${storageSettings.type === 's3' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
                 >
                    <Cloud size={20} className="text-slate-600" />
                    <div>
                       <div className="font-bold text-sm">S3 对象存储</div>
                       <div className="text-xs text-slate-500">Google/Cloudflare/MinIO</div>
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
                             <RotateCcw size={14} /> 恢复出厂设置
                          </button>
                       </div>
                    </div>
                 )}

                 {storageSettings.type === 'github' && (
                    <div className="space-y-4 animate-in fade-in">
                       <h4 className="font-bold flex items-center gap-2"><Github size={18} /> GitHub 仓库配置</h4>
                       <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 mb-4">
                          推荐使用此方式。配置后，所有订单和菜单数据将自动保存到您的 GitHub 私有仓库，实现多台电脑/手机数据同步。
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
                 
                 {storageSettings.type !== 'local' && (
                    <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          {testStatus === 'success' && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><Wifi size={14} /> 连接成功 Connected</span>}
                          {testStatus === 'failure' && <span className="text-red-600 text-xs font-bold flex items-center gap-1"><WifiOff size={14} /> 连接失败 Failed</span>}
                       </div>
                       <button 
                         onClick={handleTestConnection}
                         disabled={isTestLoading}
                         className="text-sm font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 disabled:opacity-50"
                       >
                         {isTestLoading ? '测试中...' : '测试连接 Test'}
                       </button>
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-orange-800">
                 <strong>数据安全提示：</strong><br/>
                 强烈建议配置 GitHub 云同步，这样即使更换电脑或手机，您的营业数据也不会丢失。Token 请妥善保管。
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
