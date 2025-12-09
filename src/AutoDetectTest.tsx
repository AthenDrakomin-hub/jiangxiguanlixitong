import React, { useEffect, useState } from 'react';
import { runAutoDetection } from './autodetect-validation';

const AutoDetectTest: React.FC = () => {
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDetection = () => {
    setIsRunning(true);
    const results = runAutoDetection();
    setDetectionResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    // 组件加载时自动运行一次检测
    runDetection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">自动检测测试页面</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">系统状态检测</h2>
          <button 
            onClick={runDetection}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isRunning ? '检测中...' : '重新检测'}
          </button>
        </div>
        
        {detectionResults ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${detectionResults.tailwindWorking ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Tailwind CSS样式: {detectionResults.tailwindWorking ? '✅ 正常' : '❌ 异常'}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${detectionResults.pwaFeatures.serviceWorker ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Service Worker支持: {detectionResults.pwaFeatures.serviceWorker ? '✅ 正常' : '❌ 不支持'}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${detectionResults.pwaFeatures.offlineSupport ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>离线缓存支持: {detectionResults.pwaFeatures.offlineSupport ? '✅ 正常' : '❌ 不支持'}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${detectionResults.pwaFeatures.pushNotifications ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>推送通知支持: {detectionResults.pwaFeatures.pushNotifications ? '✅ 正常' : '❌ 不支持'}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${detectionResults.responsiveFeatures.viewportMeta ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>响应式设计视口: {detectionResults.responsiveFeatures.viewportMeta ? '✅ 正常' : '❌ 缺失'}</span>
            </div>
            
            <div className={`p-3 rounded mt-4 ${detectionResults.overallStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>总体状态: </strong>
              {detectionResults.overallStatus ? '🎉 所有检测项目通过！系统运行正常。' : '⚠️ 部分功能需要检查，请查看详细日志。'}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            正在初始化检测...
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 颜色测试卡片 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-700">颜色样式测试</h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-100 rounded text-blue-800">蓝色背景测试</div>
            <div className="p-3 bg-red-100 rounded text-red-800">红色背景测试</div>
            <div className="p-3 bg-green-100 rounded text-green-800">绿色背景测试</div>
            <div className="p-3 bg-yellow-100 rounded text-yellow-800">黄色背景测试</div>
            <div className="p-3 bg-purple-100 rounded text-purple-800">紫色背景测试</div>
          </div>
        </div>
        
        {/* 悬停效果测试 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700">悬停效果测试</h2>
          <div className="space-y-3">
            <button className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              蓝色按钮 (悬停效果)
            </button>
            <button className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
              绿色按钮 (悬停效果)
            </button>
            <button className="w-full p-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
              红色按钮 (悬停效果)
            </button>
          </div>
        </div>
      </div>
      
      {/* PWA功能测试 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">PWA功能检测</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Service Worker 状态: <span id="sw-status">检测中...</span></span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>离线支持: <span id="offline-status">可用</span></span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>可安装性: <span id="installable-status">支持</span></span>
          </div>
        </div>
      </div>
      
      {/* 响应式设计测试 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-orange-700">响应式设计测试</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded text-center">移动端</div>
          <div className="p-4 bg-green-50 rounded text-center hidden sm:block">平板端</div>
          <div className="p-4 bg-yellow-50 rounded text-center hidden md:block">桌面端</div>
          <div className="p-4 bg-purple-50 rounded text-center hidden lg:block">大屏端</div>
        </div>
      </div>
    </div>
  );
};

export default AutoDetectTest;