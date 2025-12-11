import React from 'react';

const AutoDetectTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
            <div className="text-white text-2xl font-bold">AD</div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">自动检测测试</h2>
          <p className="text-slate-500 text-sm mt-2">
            Auto Detection Test
          </p>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2">设备信息 Device Info</h3>
            <div className="text-left text-sm text-slate-600 space-y-1">
              <p><span className="font-medium">User Agent:</span> <br/>{navigator.userAgent}</p>
              <p><span className="font-medium">Platform:</span> {navigator.platform}</p>
              <p><span className="font-medium">Screen Size:</span> {window.screen.width} × {window.screen.height}</p>
              <p><span className="font-medium">Window Size:</span> {window.innerWidth} × {window.innerHeight}</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">测试说明 Test Instructions</h3>
            <p className="text-sm text-blue-700">
              此页面用于测试设备自动检测功能。系统会根据设备类型和屏幕尺寸自动调整界面布局。
              This page tests automatic device detection. The system will automatically adjust the interface layout based on device type and screen size.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoDetectTest;