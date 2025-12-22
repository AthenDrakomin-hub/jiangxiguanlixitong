// components/PrinterConfig.tsx
// 打印配置组件

import React, { useState } from 'react';
import { Printer, AlertCircle } from 'lucide-react';
import { PrinterService } from '../services/printer';

const PrinterConfig: React.FC = () => {
  const [printerMode, setPrinterMode] = useState<'browser' | 'cloud'>('browser');
  const [cloudPrinterConfig, setCloudPrinterConfig] = useState({
    apiUrl: 'https://api.feieyun.cn/Api/Open/',
    user: '',
    ukey: '',
    sn: '',
  });
  const [printerTestStatus, setPrinterTestStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 应用打印配置
  const applyPrinterConfig = () => {
    PrinterService.configure({
      mode: printerMode,
      cloud: printerMode === 'cloud' ? cloudPrinterConfig : undefined,
    });
    console.log('[PrinterConfig] 配置已应用:', printerMode);
  };

  // 测试打印
  const handleTestPrint = async () => {
    setPrinterTestStatus('testing');
    setErrorMessage('');

    try {
      // 应用配置
      applyPrinterConfig();

      // 测试打印
      const result = await PrinterService.printOrder({
        id: 'TEST-' + Date.now(),
        items: [
          { id: '1', name: '测试菜品 Test Dish', quantity: 1, price: 10 },
          { id: '2', name: '宫保鸡丁', quantity: 2, price: 28 },
        ],
        total: 66,
        tableId: 'TEST',
        timestamp: new Date().toISOString(),
      });

      if (result) {
        setPrinterTestStatus('success');
        setTimeout(() => setPrinterTestStatus('idle'), 3000);
      } else {
        setPrinterTestStatus('error');
        setErrorMessage('打印失败，请检查配置');
        setTimeout(() => setPrinterTestStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Printer test failed:', error);
      setPrinterTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '未知错误');
      setTimeout(() => setPrinterTestStatus('idle'), 5000);
    }
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
        <Printer className="text-slate-400" size={20} /> 打印设置
      </h3>
      <div className="space-y-4">
        {/* Printer Mode Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            打印方式 Printer Mode
          </label>
          <select
            value={printerMode}
            onChange={(e) => {
              const mode = e.target.value as 'browser' | 'cloud';
              setPrinterMode(mode);
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="browser">🖥️ 浏览器打印（默认）</option>
            <option value="cloud">☁️ 云打印服务（飞鹅云）</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">
            {printerMode === 'browser'
              ? '✅ 免费、开箱即用，适合客户自助打印'
              : '📡 自动打印，适合收银台固定设备'}
          </p>
        </div>

        {/* Cloud Printer Config (only show when cloud mode) */}
        {printerMode === 'cloud' && (
          <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">
              ☁️ 飞鹅云打印配置
            </p>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                API 地址
              </label>
              <input
                type="text"
                value={cloudPrinterConfig.apiUrl}
                onChange={(e) =>
                  setCloudPrinterConfig({
                    ...cloudPrinterConfig,
                    apiUrl: e.target.value,
                  })
                }
                className="w-full rounded border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.feieyun.cn/Api/Open/"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                用户名 USER
              </label>
              <input
                type="text"
                value={cloudPrinterConfig.user}
                onChange={(e) =>
                  setCloudPrinterConfig({
                    ...cloudPrinterConfig,
                    user: e.target.value,
                  })
                }
                className="w-full rounded border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="注册手机号或账号"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                密钥 UKEY
              </label>
              <input
                type="password"
                value={cloudPrinterConfig.ukey}
                onChange={(e) =>
                  setCloudPrinterConfig({
                    ...cloudPrinterConfig,
                    ukey: e.target.value,
                  })
                }
                className="w-full rounded border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="从飞鹅云后台获取"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                打印机 SN
              </label>
              <input
                type="text"
                value={cloudPrinterConfig.sn}
                onChange={(e) =>
                  setCloudPrinterConfig({
                    ...cloudPrinterConfig,
                    sn: e.target.value,
                  })
                }
                className="w-full rounded border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="打印机设备编号"
              />
            </div>

            {/* Error Message */}
            {printerTestStatus === 'error' && errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertCircle size={16} className="mt-0.5 text-red-500" />
                <p className="text-xs text-red-700">{errorMessage}</p>
              </div>
            )}

            <button
              onClick={handleTestPrint}
              disabled={
                printerTestStatus === 'testing' ||
                !cloudPrinterConfig.user ||
                !cloudPrinterConfig.ukey ||
                !cloudPrinterConfig.sn
              }
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {printerTestStatus === 'testing' && '🔄 测试中...'}
              {printerTestStatus === 'success' && '✅ 测试成功！'}
              {printerTestStatus === 'error' && '❌ 测试失败'}
              {printerTestStatus === 'idle' && '📝 测试打印'}
            </button>

            <p className="text-xs text-slate-500">
              💡 提示：点击"保存设置"按钮才会持久化配置
            </p>
          </div>
        )}

        {/* Browser Print Info */}
        {printerMode === 'browser' && (
          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <p className="mb-2 text-sm font-medium text-green-800">
              🖥️ 浏览器打印已启用
            </p>
            <ul className="space-y-1 text-xs text-green-700">
              <li>✅ 免费使用，无需额外配置</li>
              <li>✅ 支持 H5 客户端自助打印小票</li>
              <li>✅ 支持订单和交班报表打印</li>
              <li>⚠️ 需要用户手动点击"打印"确认</li>
            </ul>
            <button
              onClick={handleTestPrint}
              className="mt-3 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              📝 测试浏览器打印
            </button>
          </div>
        )}

        {/* Printer Status */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
          <span className="text-sm font-medium text-slate-700">当前状态</span>
          <span
            className={`text-sm font-bold ${
              printerMode === 'cloud'
                ? cloudPrinterConfig.user && cloudPrinterConfig.sn
                  ? 'text-green-600'
                  : 'text-orange-600'
                : 'text-blue-600'
            }`}
          >
            {printerMode === 'cloud'
              ? cloudPrinterConfig.user && cloudPrinterConfig.sn
                ? '✅ 云打印已配置'
                : '⚠️ 请完成配置'
              : '🖥️ 浏览器打印'}
          </span>
        </div>

        {/* Help Link */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-600">
            📚 需要帮助？查看{' '}
            <a
              href="/PRINTER_SETUP.md"
              target="_blank"
              className="font-medium text-blue-600 underline hover:text-blue-700"
            >
              打印配置指南
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrinterConfig;
