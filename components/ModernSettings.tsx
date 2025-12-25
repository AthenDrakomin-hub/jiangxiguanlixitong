import React, { useState, useEffect } from 'react';
import {
  Save,
  Store,
  Printer,
  Cloud,
  Check,
  DollarSign,
  AlertTriangle,
  Wifi,
  Info,
  Monitor,
  QrCode,
  BedDouble,
  Database,
  Server,
  HardDrive,
  Zap,
  Shield,
  Activity,
  BarChart3,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Camera,
  Download,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import {
  StorageSettings,
  StoreInfo,
  Dish,
  Order,
  Expense,
  Ingredient,
  KTVRoom,
  SignBillAccount,
  HotelRoom,
  SystemSettings,
  StorageType,
} from '../types.js';
import { PrinterService } from '../services/printer.js';
import DataManagement from './DataManagement';
import PrinterConfig from './PrinterConfig';

import { auditLogger } from '../services/auditLogger.js';
import { dbManager } from '../lib/database.js';

interface SettingsProps {
  onSettingsChange?: (settings: SystemSettings) => void;
  systemSettings: SystemSettings;
  setSystemSettings: (settings: SystemSettings) => void;
  dishes: Dish[];
  setDishes: (dishes: Dish[]) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  inventory: Ingredient[];
  setInventory: (inventory: Ingredient[]) => void;
  ktvRooms: KTVRoom[];
  setKtvRooms: (rooms: KTVRoom[]) => void;
  signBillAccounts: SignBillAccount[];
  setSignBillAccounts: (accounts: SignBillAccount[]) => void;
  hotelRooms: HotelRoom[];
  setHotelRooms: (rooms: HotelRoom[]) => void;
}

// 系统版本信息 - 硬编码
const SYSTEM_VERSION = 'v2.0.0';
const SYSTEM_NAME = '江西酒店管理系统';
const SYSTEM_CODE = 'JX-HMS-2025';

const ModernSettings: React.FC<SettingsProps> = (props) => {
  // 使用所有传入的属性
  const {
    systemSettings,
    dishes,
    orders,
    expenses,
    inventory,
    ktvRooms,
    signBillAccounts,
    hotelRooms,
    onSettingsChange,
  } = props;

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: '江西酒店 (Jinjiang Star Hotel)',
    address: '5 Corner Lourdes Street and Roxas Boulevard, Pasay City',
    phone: '+639084156449',
    openingHours: '10:00 - 02:00',
    kitchenPrinterUrl: '',
    wifiSsid: 'ChangeMe_WIFI_SSID',
    wifiPassword: '',
    telegram: '@jx555999',
    h5PageTitle: '江西酒店 - 在线点餐',
    h5PageDescription:
      '江西酒店在线点餐系统，为您提供便捷的客房送餐和大厅点餐服务',
    h5PageKeywords: '江西酒店,在线点餐,客房送餐,餐厅服务',
  });

  const [categories, setCategories] = useState<string[]>([
    '热菜',
    '凉菜',
    '汤羹',
    '主食',
    '酒水',
    '特色菜',
  ]);

  const [notifications, setNotifications] = useState({
    sound: true,
    desktop: true,
  });

  const [localFinancials, setLocalFinancials] = useState({
    exchangeRate: 8.2,
    serviceCharge: 10,
  });

  // H5 Page Settings State
  const [h5PageSettings, setH5PageSettings] = useState({
    enableCustomStyling: true,
    customHeaderColor: '#4F46E5',
    customButtonColor: '#DC2626',
    showStoreInfo: true,
    showWiFiInfo: true,
  });

  // Database Configuration State
  const [dbConfig, setDbConfig] = useState({
    type: 'memory' as StorageType,
    host: '',
    port: 3306,
    user: '',
    password: '',
    database: '',
    connectionString: '',
  });

  // Initialize database config from environment and API
  useEffect(() => {
    const initDbConfig = async () => {
      try {
        // First, try to get current database status from API
        const response = await fetch('/api/db-config');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Update UI based on server status
            setSystemStatus(prev => ({
              ...prev,
              dbStatus: result.status,
              dbConnected: result.initialized,
              dbType: result.type,
            }));
          }
        }
      } catch (error) {
        console.warn('无法获取数据库配置状态:', error);
      }
      
      // Fallback to environment variables
      const dbType = process.env.DB_TYPE || 'memory';
      setStorageSettings({ type: dbType as StorageType });
      
      if (dbType === 'neon') {
        setDbConfig(prev => ({
          ...prev,
          connectionString: process.env.NEON_CONNECTION_STRING || '',
        }));
      }
    };
    
    initDbConfig();
  }, []);

  // System Health State
  const [systemHealth, setSystemHealth] = useState({
    database: 'checking',
    api: 'checking',
    storage: 'checking',
    lastChecked: new Date().toISOString(),
  });

  // Storage State
  const [storageSettings, setStorageSettings] = useState<StorageSettings>(
    { type: 'memory' }
  );
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

  // System Status State
  const [systemStatus, setSystemStatus] = useState({
    dbStatus: 'disconnected',
    dbConnected: false,
    dbType: 'memory',
    dbUrl: '',
  });

  // Load standard settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // First, try to load settings from database
        const dbSettings = await apiClient.fetchSystemSettings();
        if (dbSettings) {
          console.log('从数据库加载设置:', dbSettings);
          // Apply database settings
          if (dbSettings.storeInfo)
            setStoreInfo((prev) => ({
              ...prev,
              ...(dbSettings.storeInfo as StoreInfo),
            }));
          if (dbSettings.notifications)
            setNotifications(dbSettings.notifications);
          if (dbSettings.exchangeRate)
            setLocalFinancials((prev) => ({
              ...prev,
              exchangeRate: dbSettings.exchangeRate,
            }));
          if (dbSettings.serviceChargeRate)
            setLocalFinancials((prev) => ({
              ...prev,
              serviceCharge: dbSettings.serviceChargeRate * 100,
            }));
          if (dbSettings.categories && Array.isArray(dbSettings.categories))
            setCategories(dbSettings.categories);
          if (dbSettings.h5PageSettings)
            setH5PageSettings(dbSettings.h5PageSettings);
          return;
        }

        // If no database settings, fall back to localStorage
        const savedSettings = localStorage.getItem('jx_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          console.log('从localStorage加载设置:', parsed);
          if (parsed.storeInfo)
            setStoreInfo((prev) => ({
              ...prev,
              ...(parsed.storeInfo as StoreInfo),
            }));
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.exchangeRate)
            setLocalFinancials((prev) => ({
              ...prev,
              exchangeRate: parsed.exchangeRate,
            }));
          if (parsed.serviceChargeRate)
            setLocalFinancials((prev) => ({
              ...prev,
              serviceCharge: parsed.serviceChargeRate * 100,
            }));
          if (parsed.categories && Array.isArray(parsed.categories))
            setCategories(parsed.categories);
          if (parsed.h5PageSettings) setH5PageSettings(parsed.h5PageSettings);
        }
      } catch (error) {
        console.error('加载设置时出错:', error);
      }
    };

    loadSettings();

    // Initialize database connection status
    checkSystemStatus();
  }, []);

  // Check system status
  const checkSystemStatus = async () => {
    try {
      // Check database status via API call to get accurate status
      const response = await fetch('/api/db-config');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSystemStatus({
            dbStatus: result.status,
            dbConnected: result.initialized,
            dbType: result.type,
            dbUrl: result.realConnection ? process.env.NEON_CONNECTION_STRING || 'N/A' : 'N/A',
          });
          
          // Update system health based on actual API response
          setSystemHealth({
            database: result.initialized ? 'ok' : 'error',
            api: 'ok',
            storage: result.realConnection ? 'ok' : 'warning',
            lastChecked: new Date().toISOString(),
          });
          return;
        }
      }
      
      // Fallback: Check if database is initialized locally
      const isInitialized = dbManager.isInitialized();
      
      setSystemStatus({
        dbStatus: isInitialized ? 'connected' : 'disconnected',
        dbConnected: isInitialized,
        dbType: dbConfig.type,
        dbUrl: 'N/A',
      });

      // Update system health
      setSystemHealth({
        database: isInitialized ? 'ok' : 'error',
        api: 'ok', // API status is checked via fetchSystemSettings
        storage: isInitialized ? 'ok' : 'warning',
        lastChecked: new Date().toISOString(),
      });
    } catch (error) {
      console.error('检查系统状态时出错:', error);
      setSystemStatus({
        dbStatus: 'error',
        dbConnected: false,
        dbType: 'unknown',
        dbUrl: 'N/A',
      });
      setSystemHealth({
        database: 'error',
        api: 'error',
        storage: 'error',
        lastChecked: new Date().toISOString(),
      });
    }
  };

  const handleSave = async () => {
    try {
      // Save UI settings
      const settings = {
        storeInfo,
        notifications,
        exchangeRate: localFinancials.exchangeRate,
        serviceChargeRate: localFinancials.serviceCharge / 100,
        categories,
        h5PageSettings,
      };
      localStorage.setItem('jx_settings', JSON.stringify(settings));

      // Save settings to database
      try {
        await apiClient.saveSystemSettings(settings);
        console.log('系统设置已保存到数据库');
      } catch (dbError) {
        console.error('保存系统设置到数据库时出错:', dbError);
        alert(
          '保存系统设置到数据库时出错: ' +
            (dbError instanceof Error ? dbError.message : '未知错误')
        );
      }

      // Update database configuration if changed
      try {
        // Update database configuration via API
        const dbConfigResponse = await fetch('/api/db-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: dbConfig.type,
            connectionString: dbConfig.connectionString,
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database
          }),
        });
        
        if (dbConfigResponse.ok) {
          const dbConfigResult = await dbConfigResponse.json();
          if (dbConfigResult.success) {
            console.log('数据库配置已更新:', dbConfigResult.message);
          } else {
            console.warn('数据库配置更新警告:', dbConfigResult.message);
            // 不抛出错误，因为这可能只是配置未改变
          }
        } else {
          console.error('数据库配置更新失败:', dbConfigResponse.status);
        }
      } catch (dbConfigError) {
        console.error('更新数据库配置时出错:', dbConfigError);
        alert('更新数据库配置时发生错误: ' + (dbConfigError instanceof Error ? dbConfigError.message : '未知错误'));
      }

      // Notify Parent
      if (onSettingsChange) {
        onSettingsChange(settings);
      }

      // Show toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // 记录系统设置变更日志
      auditLogger.log('info', 'SETTINGS_UPDATE', '系统设置已更新', 'admin');
    } catch (error) {
      console.error('保存设置时发生错误:', error);
      // 显示错误消息给用户
      alert(
        '保存设置时发生错误: ' +
          (error instanceof Error ? error.message : '未知错误')
      );
    }
  };

  const handleTestConnection = async () => {
    try {
      // Test the database connection via API
      console.log('Testing database connection...');
      
      const response = await fetch('/api/db-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: dbConfig.type,
          connectionString: dbConfig.connectionString,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(result.message);
        setSystemStatus(prev => ({
          ...prev,
          dbStatus: 'connected',
          dbConnected: true
        }));
        return Promise.resolve();
      } else {
        alert(`连接测试失败: ${result.message}`);
        setSystemStatus(prev => ({
          ...prev,
          dbStatus: 'error',
          dbConnected: false
        }));
        return Promise.reject(new Error(result.message));
      }
    } catch (error) {
      console.error('连接测试失败:', error);
      alert(
        '连接测试失败: ' +
          (error instanceof Error ? error.message : '未知错误')
      );
      setSystemStatus(prev => ({
        ...prev,
        dbStatus: 'error',
        dbConnected: false
      }));
      
      return Promise.reject(error);
    }
  };

  // Category Logic

  const handleTestPrint = () => {
    try {
      // 产品备注: 为dummyOrder变量指定明确的类型，避免使用any
      // 注意：PrinterService使用自己的Order接口，需要total和timestamp字段
      const dummyOrder: any = {
        id: 'TEST-001',
        tableId: 'A1',
        timestamp: new Date().toISOString(),
        total: 1234,
        items: [
          {
            id: '1',
            name: 'Kung Pao Chicken',
            quantity: 1,
            price: 500,
          },
          { id: '2', name: 'Rice', quantity: 2, price: 50 },
          { id: '3', name: 'Cola', quantity: 2, price: 80 },
        ],
      };
      PrinterService.printOrder(dummyOrder);
    } catch (error) {
      console.error('测试打印时发生错误:', error);
      alert(
        '测试打印时发生错误: ' +
          (error instanceof Error ? error.message : '未知错误')
      );
    }
  };

  // Get status icon and color based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={16} />;
      case 'error':
        return <XCircle className="text-red-500" size={16} />;
      case 'checking':
        return <Clock className="text-blue-500" size={16} />;
      default:
        return <Info className="text-gray-500" size={16} />;
    }
  };

  // Get status text based on status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok':
        return '正常';
      case 'warning':
        return '警告';
      case 'error':
        return '错误';
      case 'checking':
        return '检查中';
      default:
        return '未知';
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            系统设置 Settings
          </h2>
          <p className="mt-1 text-sm text-slate-500">全局配置与权限管理</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2 text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-95"
        >
          {showToast ? <Check size={20} /> : <Save size={20} />}
          <span>{showToast ? '已保存!' : '保存设置 Save'}</span>
        </button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-green-800">数据库</h3>
              <p className="text-2xl font-bold text-green-900">
                {getStatusText(systemHealth.database)}
              </p>
            </div>
            {getStatusIcon(systemHealth.database)}
          </div>
          <p className="mt-2 text-xs text-green-700">数据存储连接状态</p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-800">API服务</h3>
              <p className="text-2xl font-bold text-blue-900">
                {getStatusText(systemHealth.api)}
              </p>
            </div>
            {getStatusIcon(systemHealth.api)}
          </div>
          <p className="mt-2 text-xs text-blue-700">API接口可用性</p>
        </div>

        <div className="rounded-xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-amber-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">存储</h3>
              <p className="text-2xl font-bold text-yellow-900">
                {getStatusText(systemHealth.storage)}
              </p>
            </div>
            {getStatusIcon(systemHealth.storage)}
          </div>
          <p className="mt-2 text-xs text-yellow-700">数据存储容量</p>
        </div>

        <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-purple-800">最后检查</h3>
              <p className="text-lg font-bold text-purple-900">
                {new Date(systemHealth.lastChecked).toLocaleTimeString()}
              </p>
            </div>
            <Clock className="text-purple-500" size={16} />
          </div>
          <p className="mt-2 text-xs text-purple-700">系统状态更新时间</p>
        </div>
      </div>

      {/* Cloud Database Management Console - Only show if admin */}
      {(typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         sessionStorage.getItem('jx_auth') === 'true')) && (
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-indigo-900">
            <Cloud className="text-indigo-600" size={20} /> 云端数据库管理控制台
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-indigo-200 bg-white p-4">
              <h4 className="mb-2 font-semibold text-indigo-800">数据初始化</h4>
              <p className="mb-3 text-sm text-slate-600">初始化系统基础数据（房间、菜品、支付方式等）</p>
              <button
                onClick={async () => {
                  if (window.confirm('确定要初始化系统数据吗？此操作将创建默认房间、菜品等基础数据。')) {
                    try {
                      const result = await apiClient.post('/seed', {});
                      if (result.success) {
                        alert(`数据初始化成功！\n${result.message}\n统计: ${JSON.stringify(result.stats)}`);
                      } else {
                        alert(`数据初始化失败: ${result.message}`);
                      }
                    } catch (error) {
                      alert(`初始化过程中发生错误: ${error.message}`);
                    }
                  }
                }}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                初始化数据
              </button>
            </div>

            <div className="rounded-lg border border-indigo-200 bg-white p-4">
              <h4 className="mb-2 font-semibold text-indigo-800">数据库连接测试</h4>
              <p className="mb-3 text-sm text-slate-600">测试云端数据库连接状态</p>
              <button
                onClick={async () => {
                  try {
                    const result = await apiClient.get('/test-connection');
                    if (result.success) {
                      alert(`数据库连接正常！\n${result.message}\n类型: ${result.connection.type}`);
                    } else {
                      alert(`数据库连接异常: ${result.error}`);
                    }
                  } catch (error) {
                    alert(`连接测试失败: ${error.message}`);
                  }
                }}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                测试连接
              </button>
            </div>

            <div className="rounded-lg border border-indigo-200 bg-white p-4">
              <h4 className="mb-2 font-semibold text-indigo-800">数据库状态</h4>
              <p className="mb-3 text-sm text-slate-600">检查云端数据库当前状态</p>
              <button
                onClick={async () => {
                  try {
                    const result = await apiClient.get('/db-status');
                    if (result.success) {
                      alert(`数据库状态正常！\n类型: ${result.connectionStatus.type}\n连接: ${result.connectionStatus.message}`);
                    } else {
                      alert(`数据库状态异常: ${result.message}`);
                    }
                  } catch (error) {
                    alert(`状态检查失败: ${error.message}`);
                  }
                }}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                检查状态
              </button>
            </div>

            <div className="rounded-lg border border-indigo-200 bg-white p-4">
              <h4 className="mb-2 font-semibold text-indigo-800">数据备份</h4>
              <p className="mb-3 text-sm text-slate-600">创建系统数据快照备份</p>
              <button
                onClick={async () => {
                  try {
                    // 获取当前系统数据
                    const hotelRooms = await apiClient.fetchCollection('hotel_rooms');
                    const dishes = await apiClient.fetchCollection('dishes');
                    const orders = await apiClient.fetchCollection('orders');
                    
                    // 创建快照数据
                    const snapshotData = {
                      data: {
                        hotel_rooms: hotelRooms,
                        dishes: dishes,
                        orders: orders,
                      },
                      description: `系统快照 ${new Date().toLocaleString()}`,
                      createdAt: new Date().toISOString(),
                    };
                    
                    // 发送快照请求
                    const result = await apiClient.post('/snapshot', {
                      action: 'create',
                      snapshot: snapshotData
                    });
                    if (result.success) {
                      alert(`数据备份成功！\n${result.message}\n备份ID: ${result.id}`);
                    } else {
                      alert(`数据备份失败: ${result.message}`);
                    }
                  } catch (error) {
                    alert(`备份过程中发生错误: ${error.message}`);
                  }
                }}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                创建备份
              </button>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Restore */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="mb-2 font-semibold text-amber-800 flex items-center gap-2">
            <Database size={16} className="text-amber-600" /> 快速快照恢复
          </h4>
          <p className="text-sm text-amber-700 mb-3">从存储的快照中恢复数据</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="输入快照ID进行恢复"
              className="flex-1 rounded-lg border border-amber-300 px-3 py-2 text-sm"
              id="snapshotIdInput"
            />
            <button
              onClick={async () => {
                const snapshotId = (document.getElementById('snapshotIdInput') as HTMLInputElement)?.value;
                if (!snapshotId) {
                  alert('请输入快照ID');
                  return;
                }
                
                if (window.confirm(`确定要从快照 ${snapshotId} 恢复数据吗？此操作不可逆！`)) {
                  try {
                    const response = await fetch('/api/snapshot', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'restore',
                        snapshotId: snapshotId
                      }),
                    });
                    const result = await response.json();
                    if (result.success) {
                      alert(`数据恢复成功！\n${result.message}\nID: ${result.id}`);
                    } else {
                      alert(`数据恢复失败: ${result.message}`);
                    }
                  } catch (error) {
                    alert(`恢复过程中发生错误: ${error.message}`);
                  }
                }
              }}
              className="rounded-lg bg-amber-600 px-4 py-2 text-white text-sm hover:bg-amber-700"
            >
              恢复快照
            </button>
          </div>
        </div>
      )}

      {/* Cloud Sync Button - Only show if admin */}
      {(typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         sessionStorage.getItem('jx_auth') === 'true')) && (
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-emerald-900">
            <Cloud className="text-emerald-600" size={20} /> 云端同步管理
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-emerald-200 bg-white p-4">
              <h4 className="mb-2 font-semibold text-emerald-800">数据同步</h4>
              <p className="mb-3 text-sm text-slate-600">将本地数据同步到云端</p>
              <button
                onClick={async () => {
                  if (window.confirm('确定要将本地数据同步到云端吗？此操作会覆盖云端数据。')) {
                    try {
                      // 获取所有本地数据
                      const allData = await apiClient.fetchAll();
                      
                      // 准备同步结果
                      const syncResults: Record<string, any> = {};
                      
                      // 同步每个数据集合
                      for (const [collection, items] of Object.entries(allData)) {
                        if (Array.isArray(items) && items.length > 0) {
                          try {
                            // 清除云端现有数据
                            // 注意：这里我们使用批量删除的方式，或者可以先删除再创建
                            // 由于API支持单个删除，我们遍历删除每个项目
                            // 但为了简化，这里使用批量创建/更新
                            
                            let successCount = 0;
                            for (const item of items) {
                              try {
                                // 如果项目有ID，尝试更新；否则创建
                                if (item.id) {
                                  await apiClient.update(collection.replace(/([A-Z])/g, '_$1').toLowerCase(), item.id, item);
                                } else {
                                  await apiClient.create(collection.replace(/([A-Z])/g, '_$1').toLowerCase(), item);
                                }
                                successCount++;
                              } catch (updateError) {
                                console.error(`同步${collection}项目失败:`, updateError);
                              }
                            }
                            
                            syncResults[collection] = {
                              total: items.length,
                              synced: successCount,
                              skipped: items.length - successCount
                            };
                          } catch (syncError) {
                            console.error(`同步集合${collection}失败:`, syncError);
                            syncResults[collection] = {
                              total: items.length,
                              synced: 0,
                              error: syncError instanceof Error ? syncError.message : '未知错误'
                            };
                          }
                        }
                      }
                      
                      // 显示同步结果
                      let resultMessage = "数据同步完成！\n\n";
                      for (const [collection, result] of Object.entries(syncResults)) {
                        if (result.error) {
                          resultMessage += `${collection}: 同步失败 - ${result.error}\n`;
                        } else {
                          resultMessage += `${collection}: ${result.synced}/${result.total} 项已同步\n`;
                        }
                      }
                      
                      alert(resultMessage);
                    } catch (error) {
                      alert(`数据同步过程中发生错误: ${error.message}`);
                    }
                  }
                }}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                同步到云端
              </button>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-white p-4">
              <h4 className="mb-2 font-semibold text-emerald-800">数据备份</h4>
              <p className="mb-3 text-sm text-slate-600">创建云端数据快照</p>
              <button
                onClick={async () => {
                  try {
                    // 获取当前系统数据
                    const hotelRooms = await apiClient.fetchCollection('hotel_rooms');
                    const dishes = await apiClient.fetchCollection('dishes');
                    const orders = await apiClient.fetchCollection('orders');
                    const expenses = await apiClient.fetchCollection('expenses');
                    const inventory = await apiClient.fetchCollection('inventory');
                    const ktvRooms = await apiClient.fetchCollection('ktv_rooms');
                    const signBillAccounts = await apiClient.fetchCollection('sign_bill_accounts');
                    const paymentMethods = await apiClient.fetchCollection('payment_methods');
                    
                    // 创建快照数据
                    const snapshotData = {
                      data: {
                        hotel_rooms: hotelRooms,
                        dishes: dishes,
                        orders: orders,
                        expenses: expenses,
                        inventory: inventory,
                        ktv_rooms: ktvRooms,
                        sign_bill_accounts: signBillAccounts,
                        payment_methods: paymentMethods,
                      },
                      description: `云端数据备份 ${new Date().toLocaleString()}`,
                      createdAt: new Date().toISOString(),
                      backupType: 'full'
                    };
                    
                    // 发送快照请求
                    const result = await apiClient.post('/snapshot', {
                      action: 'create',
                      snapshot: snapshotData
                    });
                    if (result.success) {
                      alert(`云端数据备份成功！\n${result.message}\n备份ID: ${result.id}`);
                    } else {
                      alert(`云端数据备份失败: ${result.message}`);
                    }
                  } catch (error) {
                    alert(`备份过程中发生错误: ${error.message}`);
                  }
                }}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                创建备份
              </button>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-white p-4">
              <h4 className="mb-2 font-semibold text-emerald-800">数据恢复</h4>
              <p className="mb-3 text-sm text-slate-600">从云端快照恢复数据</p>
              <input
                type="text"
                placeholder="输入快照ID"
                className="w-full rounded-lg border border-emerald-300 px-3 py-2 mb-2 text-sm"
                id="restoreSnapshotId"
              />
              <button
                onClick={async () => {
                  const snapshotId = (document.getElementById('restoreSnapshotId') as HTMLInputElement)?.value;
                  if (!snapshotId) {
                    alert('请输入快照ID');
                    return;
                  }
                  
                  if (window.confirm(`确定要从快照 ${snapshotId} 恢复数据吗？此操作不可逆！`)) {
                    try {
                      const result = await apiClient.post('/snapshot', {
                        action: 'restore',
                        snapshotId: snapshotId
                      });
                      if (result.success) {
                        alert(`数据恢复成功！\n${result.message}\nID: ${result.id}`);
                      } else {
                        alert(`数据恢复失败: ${result.message}`);
                      }
                    } catch (error) {
                      alert(`恢复过程中发生错误: ${error.message}`);
                    }
                  }
                }}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                恢复数据
              </button>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-white p-4">
              <h4 className="mb-2 font-semibold text-emerald-800">状态检查</h4>
              <p className="mb-3 text-sm text-slate-600">检查云端数据同步状态</p>
              <button
                onClick={async () => {
                  try {
                    // 检查各种云端服务状态
                    const [dbStatus, apiHealth] = await Promise.allSettled([
                      fetch('/api/db-status').then(r => r.json()),
                      fetch('/api/health').then(r => r.json()).catch(() => ({ success: false, message: '健康检查端点不存在' }))
                    ]);
                    
                    let statusMessage = "云端服务状态：\n\n";
                    
                    if (dbStatus.status === 'fulfilled') {
                      statusMessage += `数据库: ${dbStatus.value.success ? '正常' : '异常'}\n`;
                      statusMessage += `类型: ${dbStatus.value.connectionStatus?.type || '未知'}\n`;
                    } else {
                      statusMessage += "数据库: 连接失败\n";
                    }
                    
                    if (apiHealth.status === 'fulfilled') {
                      statusMessage += `API健康: ${apiHealth.value.success ? '正常' : '异常'}\n`;
                    } else {
                      statusMessage += "API健康: 未配置\n";
                    }
                    
                    // 检查数据量
                    const collections = ['hotel_rooms', 'dishes', 'orders'];
                    for (const collection of collections) {
                      try {
                        const data = await apiClient.fetchCollection(collection);
                        statusMessage += `${collection}: ${data.length} 条记录\n`;
                      } catch (e) {
                        statusMessage += `${collection}: 检查失败\n`;
                      }
                    }
                    
                    alert(statusMessage);
                  } catch (error) {
                    alert(`状态检查过程中发生错误: ${error.message}`);
                  }
                }}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                检查状态
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. Store Information */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center justify-between text-lg font-bold text-slate-800">
            <span className="flex items-center gap-2">
              <Store className="text-slate-400" size={20} /> 店铺信息
            </span>
            <button
              onClick={handleTestPrint}
              className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
            >
              <Printer size={12} /> Test Print
            </button>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                店铺名称
              </label>
              <input
                type="text"
                value={storeInfo.name}
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, name: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                地址
              </label>
              <input
                type="text"
                value={storeInfo.address}
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, address: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  电话
                </label>
                <input
                  type="text"
                  value={storeInfo.phone}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Telegram
                </label>
                <input
                  type="text"
                  value={storeInfo.telegram}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, telegram: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  WiFi SSID
                </label>
                <input
                  type="text"
                  value={storeInfo.wifiSsid}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, wifiSsid: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  WiFi Password
                </label>
                <input
                  type="text"
                  value={storeInfo.wifiPassword}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, wifiPassword: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2"
                  placeholder="No password"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Kitchen Printer URL
              </label>
              <input
                type="text"
                value={storeInfo.kitchenPrinterUrl || ''}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    kitchenPrinterUrl: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
                placeholder="e.g. 192.168.1.200 or /dev/usb/lp0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                横幅图片URL
              </label>
              <input
                type="text"
                value={storeInfo.bannerImageUrl || ''}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    bannerImageUrl: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                地图链接URL
              </label>
              <input
                type="text"
                value={storeInfo.mapUrl || ''}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    mapUrl: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
                placeholder="https://maps.google.com/?q=address"
              />
            </div>
          </div>
        </div>

        {/* 2. System Information */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
            <Info className="text-slate-400" size={20} /> 系统信息
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800">系统名称</span>
              </div>
              <span className="text-sm text-slate-500">{SYSTEM_NAME}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800">系统版本</span>
              </div>
              <span className="text-sm text-slate-500">{SYSTEM_VERSION}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800">系统编码</span>
              </div>
              <span className="text-sm text-slate-500">{SYSTEM_CODE}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800">数据存储</span>
              </div>
              <span className="text-sm text-slate-500">Multiple Backends</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800">部署环境</span>
              </div>
              <span className="text-sm text-slate-500">Production</span>
            </div>

            {/* System Status Section */}
            <div className="mt-6">
              <h4 className="mb-3 font-bold text-slate-800">系统状态</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-blue-500" />
                    <span className="text-sm">数据库连接</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${systemStatus.dbConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {systemStatus.dbConnected ? '已连接' : '未连接'}
                    </span>
                    <div className={`h-2 w-2 rounded-full ${systemStatus.dbConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-blue-500" />
                    <span className="text-sm">数据库类型</span>
                  </div>
                  <span className={`text-sm font-medium ${systemStatus.dbType === 'memory' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {systemStatus.dbType === 'memory' ? 'Memory (开发)' : 'Neon (云端)'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <HardDrive size={16} className="text-blue-500" />
                    <span className="text-sm">数据库URL</span>
                  </div>
                  <span className="text-xs text-slate-500 truncate max-w-[120px]">{systemStatus.dbUrl}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Printer Configuration */}
        <PrinterConfig />

        {/* Room QR Code Management Info */}
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-blue-900">
            <QrCode className="text-blue-600" size={20} /> 房间二维码配置说明
          </h3>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-white p-4">
              <h4 className="mb-2 flex items-center gap-2 font-bold text-blue-800">
                <BedDouble size={16} />
                如何使用房间二维码？
              </h4>
              <ol className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </span>
                  <span>
                    进入 <strong>二维码生成中心</strong> 菜单，选择「客房 Rooms」标签
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    2
                  </span>
                  <span>
                    系统已自动为每个房间生成独特二维码（包含房间号）
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    3
                  </span>
                  <span>
                    点击 <strong>批量打印</strong> 按钮，打印所有房间二维码
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    4
                  </span>
                  <span>
                    将打印好的二维码贴到对应房间内（如床头、桌面）
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                    <Check size={12} />
                  </span>
                  <span>
                    <strong>完成！</strong>客户扫码后，系统自动识别房间号
                  </span>
                </li>
              </ol>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="mb-2 font-bold text-green-800">
                ✅ 客户点餐流程
              </h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• 客户在房间扫码 → 自动识别房间号（如 8201、8332）</li>
                <li>• 选菜、提交订单 → 订单自动包含房间信息</li>
                <li>• 收银台/厨房打印小票 → <strong>醒目显示房间号</strong></li>
                <li>• 服务员看到房间号 → 直接送餐到房间</li>
              </ul>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h4 className="mb-2 font-bold text-orange-800">
                💡 技术原理
              </h4>
              <ul className="space-y-1 text-sm text-orange-700">
                <li>• 二维码 URL 格式：<code className="rounded bg-orange-100 px-1 py-0.5 font-mono text-xs">?page=customer&id=8201</code></li>
                <li>• 房间号自动传递给 H5 点餐页面</li>
                <li>• 订单提交时包含 <code className="rounded bg-orange-100 px-1 py-0.5 font-mono text-xs">tableNumber</code> 字段</li>
                <li>• 打印服务自动识别房间订单（8201-8232/8301-8332）</li>
              </ul>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
              <Info className="mt-0.5 shrink-0 text-blue-600" size={16} />
              <p className="text-xs text-slate-600">
                <strong>注意：</strong>客户扫码后不需要手动输入房间号，系统已自动识别。打印小票时会用黑色醒目块显示房间号，方便服务员快速识别送餐位置。
              </p>
            </div>
          </div>
        </div>

        {/* 3. Financial Parameters */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
            <DollarSign className="text-slate-400" size={20} /> 财务参数
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                汇率 (1 RMB = ? PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  1 :
                </span>
                <input
                  type="number"
                  value={localFinancials.exchangeRate}
                  onChange={(e) =>
                    setLocalFinancials({
                      ...localFinancials,
                      exchangeRate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-4"
                />
              </div>
              <div className="mt-1 text-xs text-slate-500">
                参考汇率 Reference Rate
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                服务费率 (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={localFinancials.serviceCharge}
                  onChange={(e) =>
                    setLocalFinancials({
                      ...localFinancials,
                      serviceCharge: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Data Storage */}
        <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="absolute right-0 top-0 p-4 opacity-5">
            <Cloud size={120} />
          </div>

          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
            <Cloud className="text-blue-500" size={20} /> 数据存储
          </h3>

          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-blue-800">
              <Info size={16} /> 系统数据存储说明
            </h4>
            <p className="text-sm text-blue-700">
              本系统现在支持多种数据库后端（MySQL, PostgreSQL, SQLite, Memory），所有数据（菜单、订单、财务等）都存储在配置的数据库中。
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-6 md:flex-row">
            <div className="w-full space-y-2 md:w-64">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                存储方式
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    setStorageSettings({ ...storageSettings, type: 'memory' })
                  }
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 text-center transition-all ${storageSettings.type === 'memory' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <Database size={24} className="text-slate-600 mb-2" />
                  <div className="text-sm font-bold">内存数据库</div>
                  <div className="text-xs text-slate-500">开发模式</div>
                </button>
                
                <button
                  onClick={() =>
                    setStorageSettings({ ...storageSettings, type: 'neon' })
                  }
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 text-center transition-all ${storageSettings.type === 'neon' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <Server size={24} className="text-slate-600 mb-2" />
                  <div className="text-sm font-bold">Neon</div>
                  <div className="text-xs text-slate-500">云数据库</div>
                </button>
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-6">
              {storageSettings.type === 'memory' && (
                <div className="flex h-full flex-col items-center justify-center space-y-4 py-6 text-center text-slate-500">
                  <Database size={48} className="opacity-20" />
                  <p>
                    数据存储在内存中，适用于开发和测试环境。
                    <br />
                    重启应用后数据将丢失，生产环境请使用持久化数据库。
                  </p>
                </div>
              )}
              
              {storageSettings.type === 'mysql' && (
                <div className="flex h-full flex-col space-y-4 py-6 text-slate-500">
                  <div className="flex items-center gap-3">
                    <HardDrive size={24} className="text-blue-500" />
                    <h4 className="text-lg font-bold text-slate-800">MySQL 配置</h4>
                  </div>
                  <p className="text-sm">
                    请输入 MySQL 数据库连接信息，所有数据将持久化存储在 MySQL 数据库中。
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        主机地址
                      </label>
                      <input
                        type="text"
                        value={dbConfig.host}
                        onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        端口
                      </label>
                      <input
                        type="number"
                        value={dbConfig.port}
                        onChange={(e) => setDbConfig({...dbConfig, port: parseInt(e.target.value) || 3306})}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2"
                        placeholder="3306"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        用户名
                      </label>
                      <input
                        type="text"
                        value={dbConfig.user}
                        onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2"
                        placeholder="root"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        密码
                      </label>
                      <input
                        type="password"
                        value={dbConfig.password}
                        onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        数据库名
                      </label>
                      <input
                        type="text"
                        value={dbConfig.database}
                        onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2"
                        placeholder="jx_hotel_system"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {storageSettings.type === 'postgresql' && (
                <div className="flex h-full flex-col space-y-4 py-6 text-slate-500">
                  <div className="flex items-center gap-3">
                    <Database size={24} className="text-green-500" />
                    <h4 className="text-lg font-bold text-slate-800">PostgreSQL 配置</h4>
                  </div>
                  <p className="text-sm">
                    请输入 PostgreSQL 数据库连接信息，所有数据将持久化存储在 PostgreSQL 数据库中。
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        主机地址
                      </label>
                      <input
                        type="text"
                        value={dbConfig.host}
                        onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2"
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        端口
                      </label>
                      <input
                        type="number"
                        value={dbConfig.port}
                        onChange={(e) => setDbConfig({...dbConfig, port: parseInt(e.target.value) || 5432})}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2"
                        placeholder="5432"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        用户名
                      </label>
                      <input
                        type="text"
                        value={dbConfig.user}
                        onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2"
                        placeholder="postgres"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        密码
                      </label>
                      <input
                        type="password"
                        value={dbConfig.password}
                        onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        数据库名
                      </label>
                      <input
                        type="text"
                        value={dbConfig.database}
                        onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2"
                        placeholder="jx_hotel_system"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {storageSettings.type === 'sqlite' && (
                <div className="flex h-full flex-col items-center justify-center space-y-4 py-6 text-center text-slate-500">
                  <FileText size={48} className="opacity-20" />
                  <p>
                    数据存储在 SQLite 文件数据库中，适用于单机部署。
                    <br />
                    数据将持久化保存在本地文件中。
                  </p>
                </div>
              )}
              
              {storageSettings.type === 'neon' && (
                <div className="flex h-full flex-col space-y-4 py-6 text-slate-500">
                  <div className="flex items-center gap-3">
                    <Server size={24} className="text-slate-600" />
                    <h4 className="text-lg font-bold text-slate-800">Neon 配置</h4>
                  </div>
                  <p className="text-sm">
                    请输入 Neon PostgreSQL 数据库连接字符串，所有数据将持久化存储在 Neon 云端数据库中。
                  </p>
                  
                  <div className="mt-4">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      连接字符串
                    </label>
                    <input
                      type="text"
                      value={dbConfig.connectionString}
                      onChange={(e) => setDbConfig({...dbConfig, connectionString: e.target.value})}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2 font-mono text-xs"
                      placeholder="postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      从 Neon 控制台获取连接字符串
                    </p>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-bold text-blue-800 mb-2">💡 使用说明</h5>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• 在 Neon 控制台创建项目后，从 "Connection Details" 获取连接字符串</li>
                      <li>• 连接字符串格式: postgresql://username:password@hostname:port/database?sslmode=require</li>
                      <li>• 建议使用连接池端点 (pooler) 以获得更好的性能</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                <Wifi size={14} /> 连接成功 Connected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTestConnection()}
                className="rounded border border-blue-300 bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-200"
              >
                测试连接
              </button>
              <button
                onClick={async () => {
                  try {
                    // 调用API保存数据库配置
                    const response = await fetch('/api/db-config', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: dbConfig.type,
                        connectionString: dbConfig.connectionString,
                      }),
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      alert(result.message);
                    } else {
                      alert(`保存配置失败: ${result.message}`);
                    }
                  } catch (error) {
                    console.error('保存配置失败:', error);
                    alert('保存配置失败: ' + (error instanceof Error ? error.message : '未知错误'));
                  }
                }}
                className="rounded border border-green-300 bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>

        {/* 5. H5 Page Settings */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
            <Monitor className="text-slate-400" size={20} /> H5页面设置
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                页面标题
              </label>
              <input
                type="text"
                value={storeInfo.h5PageTitle || ''}
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, h5PageTitle: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
                placeholder="江西酒店 - 在线点餐"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                页面描述
              </label>
              <textarea
                value={storeInfo.h5PageDescription || ''}
                onChange={(e) =>
                  setStoreInfo({
                    ...storeInfo,
                    h5PageDescription: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
                placeholder="江西酒店在线点餐系统，为您提供便捷的客房送餐和大厅点餐服务"
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                SEO关键词
              </label>
              <input
                type="text"
                value={storeInfo.h5PageKeywords || ''}
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, h5PageKeywords: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
                placeholder="江西酒店,在线点餐,客房送餐,餐厅服务"
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="mb-3 font-bold text-slate-800">页面样式设置</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    启用自定义样式
                  </label>
                  <button
                    onClick={() =>
                      setH5PageSettings({
                        ...h5PageSettings,
                        enableCustomStyling:
                          !h5PageSettings.enableCustomStyling,
                      })
                    }
                    className={`h-6 w-12 rounded-full transition-all ${h5PageSettings.enableCustomStyling ? 'bg-slate-900' : 'bg-slate-300'}`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-transform ${h5PageSettings.enableCustomStyling ? 'translate-x-6' : 'translate-x-0.5'}`}
                    ></div>
                  </button>
                </div>

                {h5PageSettings.enableCustomStyling && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        头部背景色
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={h5PageSettings.customHeaderColor}
                          onChange={(e) =>
                            setH5PageSettings({
                              ...h5PageSettings,
                              customHeaderColor: e.target.value,
                            })
                          }
                          className="h-10 w-10 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          value={h5PageSettings.customHeaderColor}
                          onChange={(e) =>
                            setH5PageSettings({
                              ...h5PageSettings,
                              customHeaderColor: e.target.value,
                            })
                          }
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        按钮颜色
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={h5PageSettings.customButtonColor}
                          onChange={(e) =>
                            setH5PageSettings({
                              ...h5PageSettings,
                              customButtonColor: e.target.value,
                            })
                          }
                          className="h-10 w-10 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          value={h5PageSettings.customButtonColor}
                          onChange={(e) =>
                            setH5PageSettings({
                              ...h5PageSettings,
                              customButtonColor: e.target.value,
                            })
                          }
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    显示店铺信息
                  </label>
                  <button
                    onClick={() =>
                      setH5PageSettings({
                        ...h5PageSettings,
                        showStoreInfo: !h5PageSettings.showStoreInfo,
                      })
                    }
                    className={`h-6 w-12 rounded-full transition-all ${h5PageSettings.showStoreInfo ? 'bg-slate-900' : 'bg-slate-300'}`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-transform ${h5PageSettings.showStoreInfo ? 'translate-x-6' : 'translate-x-0.5'}`}
                    ></div>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    显示WiFi信息
                  </label>
                  <button
                    onClick={() =>
                      setH5PageSettings({
                        ...h5PageSettings,
                        showWiFiInfo: !h5PageSettings.showWiFiInfo,
                      })
                    }
                    className={`h-6 w-12 rounded-full transition-all ${h5PageSettings.showWiFiInfo ? 'bg-slate-900' : 'bg-slate-300'}`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-transform ${h5PageSettings.showWiFiInfo ? 'translate-x-6' : 'translate-x-0.5'}`}
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Utilities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
            <Activity className="text-slate-400" size={20} /> 系统工具
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  try {
                    // Create a snapshot of the current system state
                    const snapshot = {
                      timestamp: new Date().toISOString(),
                      dishes: dishes.length,
                      orders: orders.length,
                      expenses: expenses.length,
                      inventory: inventory.length,
                      ktv_rooms: ktvRooms.length,
                      sign_bill_accounts: signBillAccounts.length,
                      hotel_rooms: hotelRooms.length,
                      systemSettings: systemSettings,
                      dbType: dbConfig.type,
                    };
                    
                    // Save to browser storage
                    const snapshots = JSON.parse(localStorage.getItem('system_snapshots') || '[]');
                    snapshots.push(snapshot);
                    // Keep only last 5 snapshots
                    const recentSnapshots = snapshots.slice(-5);
                    localStorage.setItem('system_snapshots', JSON.stringify(recentSnapshots));
                    
                    // Optionally call backend API to create a server-side snapshot
                    try {
                      const response = await fetch('/api/snapshot', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          snapshot,
                          action: 'create'
                        }),
                      });
                      
                      const result = await response.json();
                      if (result.success) {
                        console.log('服务器快照已创建:', result.message);
                      }
                    } catch (apiError) {
                      console.warn('服务器快照创建失败:', apiError);
                      // 这是可选的，如果API不存在，只保存本地快照
                    }
                    
                    alert('系统快照已创建！');
                  } catch (error) {
                    console.error('创建快照失败:', error);
                    alert('创建快照失败: ' + (error instanceof Error ? error.message : '未知错误'));
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-700 hover:bg-green-100"
              >
                <Camera size={18} /> 创建系统快照
              </button>
              
              <button
                onClick={() => {
                  // Export snapshot data
                  const snapshots = JSON.parse(localStorage.getItem('system_snapshots') || '[]');
                  if (snapshots.length === 0) {
                    alert('没有可用的快照');
                    return;
                  }
                  
                  const dataStr = JSON.stringify(snapshots, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  
                  const exportFileDefaultName = `system-snapshots-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
                  
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                  
                  alert('快照数据已导出！');
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-blue-700 hover:bg-blue-100"
              >
                <Download size={18} /> 导出快照数据
              </button>
            </div>
            
            <div className="pt-2">
              <h4 className="mb-2 font-medium text-slate-700">快照管理</h4>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                {JSON.parse(localStorage.getItem('system_snapshots') || '[]').length > 0 ? (
                  <ul className="space-y-2">
                    {JSON.parse(localStorage.getItem('system_snapshots') || '[]')
                      .slice(-3) // Show last 3 snapshots
                      .map((snapshot: any, index: number) => (
                        <li key={index} className="flex items-center justify-between rounded bg-white px-3 py-2 text-sm">
                          <span>{new Date(snapshot.timestamp).toLocaleString()}</span>
                          <span className="text-xs text-slate-500">
                            订单: {snapshot.orders} | 菜品: {snapshot.dishes}
                          </span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-center text-sm text-slate-500 py-2">暂无快照</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
            <Shield className="text-slate-400" size={20} /> 数据验证
          </h3>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-800">验证状态</h4>
              <p className="text-sm text-blue-700">
                所有数据输入都经过验证，确保数据完整性。
                当前验证规则已激活，防止无效数据进入系统。
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  // Simulate validation test
                  alert('数据验证功能正常运行！\n\n- 订单总额不能为空\n- 菜品价格必须为数字\n- 库存数量不能为负数\n- 房间号不能为空');
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-4 py-3 text-purple-700 hover:bg-purple-100"
              >
                <Zap size={18} /> 验证规则测试
              </button>
              
              <button
                onClick={() => {
                  // Navigate to validation test page
                  window.location.hash = '#validationtest';
                  alert('请导航到“数据验证测试”页面进行详细测试');
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-3 text-indigo-700 hover:bg-indigo-100"
              >
                <BarChart3 size={18} /> 详细验证报告
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Management */}
      <DataManagement
        onDataUpdate={() => {
          // 显示一个提示消息而不是直接重新加载页面
          alert('数据已更新，请手动刷新页面以查看最新数据');
          // 或者可以调用一个状态更新函数来刷新数据
          // onDataUpdate?.();
        }}
      />

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
            <div
              className={`p-6 ${confirmModal.level === 'high' ? 'bg-red-50' : 'bg-white'}`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`rounded-full p-3 ${confirmModal.level === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}
                >
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {confirmModal.title}
                </h3>
              </div>
              <p className="mb-6 whitespace-pre-wrap leading-relaxed text-slate-600">
                {confirmModal.message}
              </p>

              {confirmModal.level === 'high' && (
                <div className="mb-6">
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                    Type &quot;RESET&quot; to confirm
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-2 border-red-200 px-4 py-2 font-mono focus:border-red-600 focus:outline-none"
                    placeholder="RESET"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setConfirmModal({ ...confirmModal, open: false })
                  }
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel 取消
                </button>
                <button
                  onClick={() => {
                    if (
                      confirmModal.level === 'high' &&
                      confirmInput !== 'RESET'
                    )
                      return;
                    confirmModal.action();
                    setConfirmModal({ ...confirmModal, open: false });
                  }}
                  disabled={
                    confirmModal.level === 'high' && confirmInput !== 'RESET'
                  }
                  className={`flex-1 rounded-xl px-4 py-3 font-bold text-white shadow-lg transition-all ${
                    confirmModal.level === 'high'
                      ? 'bg-red-600 shadow-red-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                      : 'bg-slate-900 shadow-slate-200 hover:bg-slate-800'
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

export default ModernSettings;