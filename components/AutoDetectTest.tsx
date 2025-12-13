import React from 'react';

const AutoDetectTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">设备自动检测测试</h1>
        <p className="text-slate-600 mb-6">
          此页面用于测试设备自动检测功能，包括屏幕尺寸、触摸支持等。
        </p>
        
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">屏幕宽度:</span>
            <span className="font-medium">{window.innerWidth}px</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">屏幕高度:</span>
            <span className="font-medium">{window.innerHeight}px</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">触摸支持:</span>
            <span className="font-medium">
              {'ontouchstart' in window ? '支持' : '不支持'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">设备类型:</span>
            <span className="font-medium">
              {window.innerWidth < 768 ? '移动设备' : '桌面设备'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => window.history.back()}
          className="mt-8 w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          返回
        </button>
      </div>
    </div>
  );
};

export default AutoDetectTest;