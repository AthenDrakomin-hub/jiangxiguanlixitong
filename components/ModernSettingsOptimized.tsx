import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient.js';
import SettingsNavigation from './SettingsNavigation';
import { useCloudSync } from '../hooks/useCloudSync';

interface SystemSettings {
  storeInfo: {
    name: string;
    address: string;
    phone: string;
    openingHours: string;
    kitchenPrinterUrl: string;
    wifiSsid: string;
    wifiPassword: string;
    telegram: string;
    h5PageTitle: string;
    h5PageDescription: string;
    h5PageKeywords: string;
  };
  notifications: {
    sound: boolean;
    desktop: boolean;
  };
  payment: {
    enabledMethods: string[];
    aliPayEnabled: boolean;
    weChatEnabled: boolean;
    gCashEnabled: boolean;
    mayaEnabled: boolean;
  };
  exchangeRate: number;
  serviceChargeRate: number;
  categories: string[];
  h5PageSettings: {
    enableCustomStyling: boolean;
    customHeaderColor: string;
    customButtonColor: string;
    showStoreInfo: boolean;
    showWiFiInfo: boolean;
  };
}

const ModernSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('常规');
  const [dbType, setDbType] = useState<string>('memory');
  const [dbConfig, setDbConfig] = useState<any>({});
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { 
    performSecureSync, 
    performRestore, 
    performBackup, 
    checkCloudStatus,
    loading: cloudLoading,
    status: cloudStatus 
  } = useCloudSync();

  // 初始化数据库配置
  const initDbConfig = async () => {
    try {
      const response = await apiClient.get('/db-config');
      if (response.success) {
        setDbConfig(response.config);
        setDbType(response.config.type || 'memory');
      }
    } catch (error) {
      console.error('获取数据库配置失败:', error);
    }
  };

  // 加载系统设置
  const loadSettings = async () => {
    try {
      const settings = await apiClient.fetchSystemSettings();
      if (settings) {
        setSystemSettings(settings);
      } else {
        // 默认设置
        setSystemSettings({
          storeInfo: {
            name: '江西酒店 (Jinjiang Star Hotel)',
            address: '5 Corner Lourdes Street and Roxas Boulevard, Pasay City',
            phone: '+639084156449',
            openingHours: '10:00 - 02:00',
            kitchenPrinterUrl: '',
            wifiSsid: 'ChangeMe_WIFI_SSID',
            wifiPassword: '',
            telegram: '@jx555999',
            h5PageTitle: '江西酒店 - 在线点餐',
            h5PageDescription: '江西酒店在线点餐系统，为您提供便捷的客房送餐和大厅点餐服务',
            h5PageKeywords: '江西酒店,在线点餐,客房送餐,餐厅服务',
          },
          notifications: {
            sound: true,
            desktop: true,
          },
          payment: {
            enabledMethods: ['CASH'],
            aliPayEnabled: false,
            weChatEnabled: false,
            gCashEnabled: true,
            mayaEnabled: true,
          },
          exchangeRate: 8.2,
          serviceChargeRate: 0.1,
          categories: ['热菜', '凉菜', '汤类', '主食', '酒水', '小吃'],
          h5PageSettings: {
            enableCustomStyling: true,
            customHeaderColor: '#4F46E5',
            customButtonColor: '#DC2626',
            showStoreInfo: true,
            showWiFiInfo: true,
          },
        });
      }
    } catch (error) {
      console.error('加载系统设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initDbConfig();
    loadSettings();
  }, []);

  // 保存设置
  const handleSave = async () => {
    if (!systemSettings) return;

    try {
      await apiClient.saveSystemSettings(systemSettings);
      setIsSuccess(true);
      setMessage('设置保存成功！');
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('保存设置失败:', error);
      setIsSuccess(false);
      setMessage('设置保存失败：' + error.message);
    }
  };

  // 测试数据库连接
  const handleTestConnection = async () => {
    try {
      const response = await apiClient.get('/test-connection');
      if (response.success) {
        setMessage('数据库连接测试成功！');
        setIsSuccess(true);
      } else {
        setMessage('数据库连接测试失败：' + response.message);
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('数据库连接测试失败：' + error.message);
      setIsSuccess(false);
    }
  };

  // 切换数据库类型
  const handleDbTypeChange = async (type: string) => {
    setDbType(type);
    
    try {
      const newConfig = { ...dbConfig, type };
      const response = await apiClient.post('/db-config', newConfig);
      
      if (response.success) {
        setMessage(`数据库类型已切换为 ${type}`);
        setIsSuccess(true);
      } else {
        setMessage('数据库类型切换失败：' + response.message);
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('数据库类型切换失败：' + error.message);
      setIsSuccess(false);
    }
  };

  // 初始化系统数据
  const handleInitSystem = async () => {
    if (!window.confirm('确定要初始化系统数据吗？这将创建默认的酒店房间、KTV房间等数据。')) {
      return;
    }

    try {
      const result = await apiClient.seed();
      if (result.success) {
        setMessage('系统数据初始化成功！');
        setIsSuccess(true);
      } else {
        setMessage('系统数据初始化失败：' + result.message);
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('系统数据初始化失败：' + error.message);
      setIsSuccess(false);
    }
  };

  // 渲染常规设置
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">店铺信息</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">店铺名称</label>
            <input
              type="text"
              value={systemSettings?.storeInfo.name || ''}
              onChange={(e) => setSystemSettings(prev => ({
                ...prev!,
                storeInfo: { ...prev!.storeInfo, name: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">联系电话</label>
            <input
              type="text"
              value={systemSettings?.storeInfo.phone || ''}
              onChange={(e) => setSystemSettings(prev => ({
                ...prev!,
                storeInfo: { ...prev!.storeInfo, phone: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">营业时间</label>
            <input
              type="text"
              value={systemSettings?.storeInfo.openingHours || ''}
              onChange={(e) => setSystemSettings(prev => ({
                ...prev!,
                storeInfo: { ...prev!.storeInfo, openingHours: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WIFI名称</label>
            <input
              type="text"
              value={systemSettings?.storeInfo.wifiSsid || ''}
              onChange={(e) => setSystemSettings(prev => ({
                ...prev!,
                storeInfo: { ...prev!.storeInfo, wifiSsid: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">支付设置</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">启用支付方式</label>
            {['CASH', 'GCASH', 'MAYA', 'ALIPAY', 'WECHAT'].map(method => (
              <label key={method} className="flex items-center">
                <input
                  type="checkbox"
                  checked={systemSettings?.payment.enabledMethods.includes(method) || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSystemSettings(prev => ({
                        ...prev!,
                        payment: {
                          ...prev!.payment,
                          enabledMethods: [...prev!.payment.enabledMethods, method]
                        }
                      }));
                    } else {
                      setSystemSettings(prev => ({
                        ...prev!,
                        payment: {
                          ...prev!.payment,
                          enabledMethods: prev!.payment.enabledMethods.filter(m => m !== method)
                        }
                      }));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{method}</span>
              </label>
            ))}
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="gCashEnabled"
                checked={systemSettings?.payment.gCashEnabled || false}
                onChange={(e) => setSystemSettings(prev => ({
                  ...prev!,
                  payment: { ...prev!.payment, gCashEnabled: e.target.checked }
                }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="gCashEnabled" className="ml-2 text-sm text-gray-700">启用GCash</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="mayaEnabled"
                checked={systemSettings?.payment.mayaEnabled || false}
                onChange={(e) => setSystemSettings(prev => ({
                  ...prev!,
                  payment: { ...prev!.payment, mayaEnabled: e.target.checked }
                }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="mayaEnabled" className="ml-2 text-sm text-gray-700">启用Maya</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          保存设置
        </button>
      </div>
    </div>
  );

  // 渲染数据库设置
  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">数据库配置</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">数据库类型</label>
            <select
              value={dbType}
              onChange={(e) => handleDbTypeChange(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="memory">内存数据库 (开发)</option>
              <option value="neon">Neon PostgreSQL (生产)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              当前数据库模式: {dbType === 'memory' ? '内存模式 (数据不会持久化)' : 'Neon PostgreSQL (数据持久化)'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">连接状态</label>
            <div className="mt-1 flex items-center">
              <div className={`h-3 w-3 rounded-full ${dbType === 'memory' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
              <span className="ml-2 text-sm text-gray-700">
                {dbType === 'memory' ? '开发模式' : '生产模式'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleTestConnection}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            测试连接
          </button>
          <button
            onClick={handleInitSystem}
            className="ml-4 rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            初始化系统数据
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染云运维设置
  const renderCloudOpsSettings = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-emerald-800">云运维控制台</h3>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-emerald-200 bg-white p-4">
            <h4 className="mb-2 font-semibold text-emerald-800">数据同步</h4>
            <p className="mb-3 text-sm text-slate-600">将本地数据同步到云端</p>
            <button
              onClick={async () => {
                const result = await performSecureSync();
                if (result.success) {
                  alert(result.message);
                } else {
                  alert(result.message);
                }
              }}
              disabled={cloudLoading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {cloudLoading && cloudStatus.includes('同步') ? '同步中...' : '同步到云端'}
            </button>
          </div>
          
          <div className="rounded-lg border border-emerald-200 bg-white p-4">
            <h4 className="mb-2 font-semibold text-emerald-800">数据备份</h4>
            <p className="mb-3 text-sm text-slate-600">创建云端数据快照</p>
            <button
              onClick={async () => {
                const result = await performBackup();
                if (result.success) {
                  alert(result.message);
                } else {
                  alert(result.message);
                }
              }}
              disabled={cloudLoading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {cloudLoading && cloudStatus.includes('备份') ? '备份中...' : '创建备份'}
            </button>
          </div>
          
          <div className="rounded-lg border border-emerald-200 bg-white p-4">
            <h4 className="mb-2 font-semibold text-emerald-800">数据恢复</h4>
            <p className="mb-3 text-sm text-slate-600">从快照恢复数据</p>
            <input
              type="text"
              id="restoreSnapshotId"
              placeholder="输入快照ID"
              className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={async () => {
                const snapshotId = (document.getElementById('restoreSnapshotId') as HTMLInputElement)?.value;
                if (!snapshotId) {
                  alert('请输入快照ID');
                  return;
                }
                if (window.confirm(`确定要从快照 ${snapshotId} 恢复数据吗？此操作不可逆！`)) {
                  const result = await performRestore(snapshotId);
                  if (result.success) {
                    alert(result.message);
                  } else {
                    alert(result.message);
                  }
                }
              }}
              disabled={cloudLoading}
              className="w-full rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {cloudLoading && cloudStatus.includes('恢复') ? '恢复中...' : '恢复数据'}
            </button>
          </div>
          
          <div className="rounded-lg border border-emerald-200 bg-white p-4">
            <h4 className="mb-2 font-semibold text-emerald-800">状态检查</h4>
            <p className="mb-3 text-sm text-slate-600">检查云端数据同步状态</p>
            <button
              onClick={async () => {
                const result = await checkCloudStatus();
                alert(result.message);
              }}
              disabled={cloudLoading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {cloudLoading && cloudStatus.includes('检查') ? '检查中...' : '检查状态'}
            </button>
          </div>
        </div>
        
        {cloudStatus && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">状态: {cloudStatus}</p>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染安全设置
  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">审计日志</h3>
        <div className="text-sm text-gray-600">
          <p>系统将自动记录所有敏感操作，包括数据同步、备份、恢复等操作。</p>
          <p className="mt-2">审计日志包含操作人、操作时间、操作类型和相关快照ID。</p>
        </div>
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">权限管理</h3>
        <div className="text-sm text-gray-600">
          <p>敏感操作（如数据恢复、系统初始化）需要管理员权限。</p>
          <p className="mt-2">API端点已添加Basic认证保护。</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="mt-1 text-sm text-gray-600">管理酒店系统的各项配置</p>
      </div>

      {message && (
        <div className={`mb-4 rounded-md p-4 ${isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="flex rounded-lg border border-gray-200 bg-white shadow">
        <SettingsNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="flex-1 p-6">
          {activeSection === '常规' && renderGeneralSettings()}
          {activeSection === '数据库' && renderDatabaseSettings()}
          {activeSection === '云运维' && renderCloudOpsSettings()}
          {activeSection === '安全' && renderSecuritySettings()}
        </div>
      </div>
    </div>
  );
};

export default ModernSettings;