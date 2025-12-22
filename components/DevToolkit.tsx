import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Zap, AlertCircle, CheckCircle, Key } from 'lucide-react';

interface DBStatus {
  success: boolean;
  connected: boolean;
  status?: {
    connected: boolean;
    hasUrl: boolean;
    hasToken: boolean;
    urlPreview: string;
  };
  keys?: Record<string, { indexKeys: string[]; sampleKeys: string[] }>;
}

const DevToolkit: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<DBStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 加载数据库状态
  const loadDBStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/db-status');
      const data = await response.json();
      setDbStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '无法连接到 API');
      setDbStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // 初始化示例数据
  const seedDatabase = async () => {
    if (!confirm('确认要初始化示例数据吗？\n\n这将添加示例菜品、库存、房间等数据。')) {
      return;
    }

    setSeeding(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `✅ 数据初始化成功！\n` +
          `- 菜品: ${data.created?.dishes || 0} 条\n` +
          `- 库存: ${data.created?.inventory || 0} 条\n` +
          `- KTV房间: ${data.created?.ktv_rooms || 0} 个\n` +
          `- 酒店房间: ${data.created?.hotel_rooms || 0} 个\n` +
          `- 支付方式: ${data.created?.payment_methods || 0} 种`
        );
        // 重新加载状态
        setTimeout(() => loadDBStatus(), 1000);
      } else {
        setError(`初始化失败: ${data.error || '未知错误'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '初始化请求失败');
    } finally {
      setSeeding(false);
    }
  };

  // 组件挂载时自动加载
  useEffect(() => {
    loadDBStatus();
  }, []);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Database className="text-blue-500" size={20} />
          开发者工具 Dev Toolkit
        </h3>
        <button
          onClick={loadDBStatus}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {/* 连接状态 */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700">数据库连接状态</span>
          {dbStatus?.connected ? (
            <span className="flex items-center gap-1 text-xs font-bold text-green-600">
              <CheckCircle size={14} /> 已连接
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
              <AlertCircle size={14} /> 未连接
            </span>
          )}
        </div>

        {dbStatus?.status && (
          <div className="mt-2 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>URL:</span>
              <span className="font-mono">{dbStatus.status.hasUrl ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>Token:</span>
              <span className="font-mono">{dbStatus.status.hasToken ? '✅' : '❌'}</span>
            </div>
            {dbStatus.status.urlPreview && (
              <div className="mt-2 truncate rounded bg-white px-2 py-1 font-mono text-[10px]">
                {dbStatus.status.urlPreview}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Redis 键名列表 */}
      {dbStatus?.connected && dbStatus.keys && (
        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-800">
            <Key size={14} />
            Redis 键名预览 (前10条)
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto text-xs">
            {Object.entries(dbStatus.keys).map(([collection, info]) => {
              const totalKeys = info.sampleKeys.length;
              if (totalKeys === 0) return null;

              return (
                <div key={collection} className="rounded bg-white p-2">
                  <div className="mb-1 font-bold text-blue-900">
                    {collection} ({totalKeys} 条)
                  </div>
                  <div className="space-y-0.5 font-mono text-slate-600">
                    {info.sampleKeys.slice(0, 5).map((key, idx) => (
                      <div key={idx} className="truncate text-[10px]">
                        {key}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 数据初始化按钮 */}
      <div className="flex gap-3">
        <button
          onClick={seedDatabase}
          disabled={!dbStatus?.connected || seeding}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Zap size={18} className={seeding ? 'animate-pulse' : ''} />
          {seeding ? '初始化中...' : '初始化示例数据'}
        </button>
      </div>

      {/* 成功消息 */}
      {message && (
        <div className="mt-4 whitespace-pre-line rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {/* 错误消息 */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          ❌ {error}
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <div className="mb-1 font-bold">使用说明:</div>
        <ul className="list-inside list-disc space-y-1">
          <li>点击"刷新"按钮查看最新的数据库连接状态</li>
          <li>Redis 键名预览显示各集合的实际存储键名</li>
          <li>初始化示例数据会添加菜品、库存、房间等测试数据</li>
          <li>如果连接失败,请检查 Vercel KV 配置并重新部署</li>
        </ul>
      </div>
    </div>
  );
};

export default DevToolkit;
