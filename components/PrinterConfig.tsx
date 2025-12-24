// components/PrinterConfig.tsx
// 打印配置组件

import React, { useState } from 'react';
import { Printer, AlertCircle, HelpCircle, X, Check } from 'lucide-react';
import { PrinterService } from '../services/printer.js';

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
  const [showHelpModal, setShowHelpModal] = useState(false);

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
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Printer className="text-slate-400" size={20} /> 打印设置
        </h3>
        <button
          onClick={() => setShowHelpModal(true)}
          className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 transition-colors hover:bg-blue-100"
        >
          <HelpCircle size={16} />
          配置指南
        </button>
      </div>
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

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-slate-800">
                🖨️ 打印功能完整配置指南
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 p-6">
              {/* 业务流程 */}
              <section>
                <h3 className="mb-3 text-lg font-bold text-slate-800">
                  📊 完整业务流程
                </h3>
                <div className="space-y-3">
                  <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                    <h4 className="mb-2 font-bold text-green-800">
                      📱 场景 1: H5 客户点餐
                    </h4>
                    <ol className="space-y-1 text-sm text-green-700">
                      <li>1️⃣ 客户在房间扫码 → H5点餐页面</li>
                      <li>2️⃣ 选菜、结算、提交订单</li>
                      <li>3️⃣ 订单保存到数据库</li>
                      <li>4️⃣ 【自动触发】后台调用 /api/print-order</li>
                      <li>5️⃣ 【收银台打印机】自动出单</li>
                      <li>6️⃣ 收银台/厨房看到订单，开始制作</li>
                    </ol>
                    <p className="mt-2 text-xs text-green-600">
                      ⚠️ 重点：客户不需要自己打印，订单自动打印到收银台！
                    </p>
                  </div>

                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <h4 className="mb-2 font-bold text-blue-800">
                      💳 场景 2: 收银台结账
                    </h4>
                    <ol className="space-y-1 text-sm text-blue-700">
                      <li>1️⃣ 收银员在 OrderManagement 中操作</li>
                      <li>2️⃣ 点击「结账」或「打印」按钮</li>
                      <li>3️⃣ 直接调用 PrinterService.printOrder()</li>
                      <li>4️⃣ 收银台打印机出单</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* 打印方式对比 */}
              <section>
                <h3 className="mb-3 text-lg font-bold text-slate-800">
                  ⚖️ 打印方式对比
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200 bg-slate-50">
                        <th className="p-3 text-left font-bold">方式</th>
                        <th className="p-3 text-left font-bold">优点</th>
                        <th className="p-3 text-left font-bold">缺点</th>
                        <th className="p-3 text-left font-bold">成本</th>
                        <th className="p-3 text-left font-bold">推荐场景</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-medium">🖥️ 浏览器打印</td>
                        <td className="p-3 text-green-600">免费、即开即用</td>
                        <td className="p-3 text-orange-600">样式控制有限</td>
                        <td className="p-3">￥0</td>
                        <td className="p-3">快速上线、测试</td>
                      </tr>
                      <tr className="border-b border-slate-100 bg-blue-50">
                        <td className="p-3 font-medium">☁️ 云打印服务</td>
                        <td className="p-3 text-green-600">
                          稳定、支持多设备、<strong>自动打印</strong>
                        </td>
                        <td className="p-3 text-orange-600">需付费</td>
                        <td className="p-3">￥0.1-0.3/张</td>
                        <td className="p-3">
                          <strong>⚠️ H5客户点餐必须用此方式</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium">🔌 USB打印机</td>
                        <td className="p-3 text-green-600">速度快、成本低</td>
                        <td className="p-3 text-orange-600">需硬件、兼容性问题</td>
                        <td className="p-3">￥800-2000</td>
                        <td className="p-3">收银台固定设备</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 云打印配置步骤 */}
              <section>
                <h3 className="mb-3 text-lg font-bold text-slate-800">
                  ☁️ 云打印配置步骤（推荐）
                </h3>
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-700">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                        1
                      </span>
                      购买飞鹅云打印机
                    </h4>
                    <ul className="ml-8 space-y-1 text-sm text-slate-600">
                      <li>• 官网：https://www.feieyun.com</li>
                      <li>• 价格：￥199/台（含一年流量费）</li>
                      <li>• 菲律宾可用 ✅</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-700">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                        2
                      </span>
                      获取 API 凭证
                    </h4>
                    <ul className="ml-8 space-y-1 text-sm text-slate-600">
                      <li>• <strong>USER</strong>：注册手机号</li>
                      <li>• <strong>UKEY</strong>：在「设置」-「开发者密钥」中获取</li>
                      <li>• <strong>SN</strong>：打印机设备编号（在设备上查看）</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-700">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                        3
                      </span>
                      在系统设置中配置
                    </h4>
                    <ul className="ml-8 space-y-1 text-sm text-slate-600">
                      <li>• 选择「云打印服务（飞鹅云）」</li>
                      <li>• 填写 USER、UKEY、SN</li>
                      <li>• 点击「测试打印」验证</li>
                      <li>• 点击页面顶部「保存设置」按钮</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-bold text-slate-700">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">
                        <Check size={16} />
                      </span>
                      完成！自动打印
                    </h4>
                    <p className="ml-8 text-sm text-slate-600">
                      配置完成同，所有打印操作将自动发送到云打印机：
                    </p>
                    <ul className="ml-8 mt-2 space-y-1 text-sm text-green-600">
                      <li>✅ 收银台结账 → 自动打印小票</li>
                      <li>✅ 厨房显示确认 → 自动出单</li>
                      <li>✅ H5客户点餐 → 自动打印到收银台</li>
                      <li>✅ 交班报表 → 自动打印</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 常见问题 */}
              <section>
                <h3 className="mb-3 text-lg font-bold text-slate-800">
                  ❓ 常见问题
                </h3>
                <div className="space-y-2">
                  <details className="rounded-lg border border-slate-200">
                    <summary className="cursor-pointer bg-slate-50 p-3 font-medium text-slate-700 hover:bg-slate-100">
                      Q1: H5 客户点餐必须用云打印吗？
                    </summary>
                    <div className="p-3 text-sm text-slate-600">
                      <strong>是的！</strong>浏览器打印无法在服务器端触发，只有云打印才能实现 H5 客户点餐后自动打印到收银台。
                    </div>
                  </details>

                  <details className="rounded-lg border border-slate-200">
                    <summary className="cursor-pointer bg-slate-50 p-3 font-medium text-slate-700 hover:bg-slate-100">
                      Q2: 云打印失败，显示“签名错误”？
                    </summary>
                    <div className="p-3 text-sm text-slate-600">
                      检查 UKEY 是否正确，确保从飞鹅云后台复制完整密钥。
                    </div>
                  </details>

                  <details className="rounded-lg border border-slate-200">
                    <summary className="cursor-pointer bg-slate-50 p-3 font-medium text-slate-700 hover:bg-slate-100">
                      Q3: 浏览器打印被拦截？
                    </summary>
                    <div className="p-3 text-sm text-slate-600">
                      允许浏览器弹出窗口权限，或使用云打印方式。
                    </div>
                  </details>

                  <details className="rounded-lg border border-slate-200">
                    <summary className="cursor-pointer bg-slate-50 p-3 font-medium text-slate-700 hover:bg-slate-100">
                      Q4: 菲律宾能用飞鹅云打印机吗？
                    </summary>
                    <div className="p-3 text-sm text-slate-600">
                      可以！飞鹅云支持海外使用，只需确保打印机能联网。
                    </div>
                  </details>
                </div>
              </section>

              {/* 技术支持 */}
              <section className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <h3 className="mb-2 font-bold text-blue-800">
                  📞 技术支持
                </h3>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• 飞鹅云文档: https://www.feieyun.com/open/index.html</li>
                  <li>• 系统配置文档: PRINTER_SETUP.md</li>
                </ul>
              </section>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterConfig;