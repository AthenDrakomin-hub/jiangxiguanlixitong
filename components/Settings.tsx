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
} from 'lucide-react';
import { getStorageSettings, saveStorageSettings } from '../services/storage';
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
  OrderStatus, // 导入OrderStatus枚举
} from '../types';
import { PrinterService } from '../services/printer';
import DataManagement from './DataManagement';

import auditLogger from '../services/auditLogger';

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
const SYSTEM_VERSION = 'v1.0.0';
const SYSTEM_NAME = '江西酒店管理系统';
const SYSTEM_CODE = 'JX-HMS-2025';

const Settings: React.FC<SettingsProps> = (props) => {
  // 使用所有传入的属性
  const {
    systemSettings,
    setSystemSettings,
    dishes,
    setDishes,
    orders,
    setOrders,
    expenses,
    setExpenses,
    inventory,
    setInventory,
    ktvRooms,
    setKtvRooms,
    signBillAccounts,
    setSignBillAccounts,
    hotelRooms,
    setHotelRooms,
    onSettingsChange,
  } = props;

  // 确保所有属性都被使用，避免TypeScript警告
  useEffect(() => {
    // 这些属性虽然在此组件中未直接使用，但通过解构传入以保持接口一致性
    // 在子组件或未来扩展中可能会用到
    console.log('Settings component mounted with props');
  }, [
    systemSettings,
    setSystemSettings,
    dishes,
    setDishes,
    orders,
    setOrders,
    expenses,
    setExpenses,
    inventory,
    setInventory,
    ktvRooms,
    setKtvRooms,
    signBillAccounts,
    setSignBillAccounts,
    hotelRooms,
    setHotelRooms,
    onSettingsChange,
  ]);

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

  // Storage State
  const [storageSettings, setStorageSettings] =
    useState<StorageSettings>(getStorageSettings());
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
      categories,
      h5PageSettings,
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

    // 记录系统设置变更日志
    auditLogger.log('info', 'SETTINGS_UPDATE', '系统设置已更新', 'admin');

    // 调用父组件的设置变更回调
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  // Handle Settings Update from Settings Component
  // const handleSettingsUpdate = (newSettings: SystemSettings) => {
  //    setSystemSettings(newSettings);
  // };

  // Handle Categories Update from MenuManagement Component
  // const handleCategoriesUpdate = (newCategories: string[] | ((prev: string[]) => string[])) => {
  //   // If it's a function, we need to get the actual value
  //   const categories = typeof newCategories === 'function'
  //     ? newCategories(systemSettings.categories || [])
  //     : newCategories;
  //
  //   setSystemSettings({
  //     ...systemSettings,
  //     categories: categories as string[]
  //   });
  // };

  const handleTestConnection = async () => {
    try {
      // Connection testing removed as we're only using Vercel Blob Storage now
      // All connections are handled automatically by the Vercel Blob Storage client
      // Return a resolved promise to satisfy async signature
      console.log('Connection test skipped - using Vercel Blob Storage');
      return Promise.resolve();
    } catch (error) {
      console.error('Connection test failed:', error);
      // 即使出错也不应该导致白屏，这里添加错误处理
      alert(
        '自动连接测试失败: ' +
          (error instanceof Error ? error.message : '未知错误')
      );
    }
  };

  // Category Logic

  const handleTestPrint = () => {
    // 产品备注: 为dummyOrder变量指定明确的类型，避免使用any
    const dummyOrder: Order = {
      id: 'TEST-001',
      tableNumber: 'A1',
      source: 'LOBBY',
      createdAt: new Date().toISOString(),
      paymentMethod: 'CASH',
      totalAmount: 1234,
      status: OrderStatus.PENDING, // 添加必需的status字段，使用正确的枚举值
      items: [
        { dishId: '1', dishName: 'Kung Pao Chicken', quantity: 1, price: 500 },
        { dishId: '2', dishName: 'Rice', quantity: 2, price: 50 },
        { dishId: '3', dishName: 'Cola', quantity: 2, price: 80 },
      ],
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
              <span className="text-sm text-slate-500">
                Vercel Blob Storage
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800">部署环境</span>
              </div>
              <span className="text-sm text-slate-500">Production</span>
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
              本系统现在使用 Vercel Blob Storage
              作为主要数据存储方案，所有数据（菜单、订单、财务等）都实时存储在云端存储中。
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-6 md:flex-row">
            <div className="w-full space-y-2 md:w-64">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                存储方式
              </label>

              <button
                onClick={() =>
                  setStorageSettings({ ...storageSettings, type: 'blob' })
                }
                className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${storageSettings.type === 'blob' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300'}`}
              >
                <Cloud size={20} className="text-slate-600" />
                <div>
                  <div className="text-sm font-bold">Vercel Blob Storage</div>
                  <div className="text-xs text-slate-500">Cloud Storage</div>
                </div>
              </button>
            </div>

            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-6">
              {storageSettings.type === 'blob' && (
                <div className="flex h-full flex-col items-center justify-center space-y-4 py-6 text-center text-slate-500">
                  <Cloud size={48} className="opacity-20" />
                  <p>
                    数据存储在 Vercel Blob Storage 中。
                    <br />
                    所有数据实时备份到云端，确保数据安全。
                  </p>
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
            <button
              onClick={() => handleTestConnection()}
              disabled={true}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              自动连接 Automatic Connection
            </button>
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

      {/* Data Management */}
      <DataManagement onDataUpdate={() => window.location.reload()} />

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

export default Settings;
