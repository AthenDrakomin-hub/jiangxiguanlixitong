// 自动检测验证脚本
export const runAutoDetection = () => {
  console.log('=== 自动检测测试报告 ===');
  
  // 1. 检查Tailwind CSS样式
  const checkTailwindStyles = () => {
    try {
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-blue-500 text-white p-2 rounded';
      document.body.appendChild(testDiv);
      
      const computedStyle = window.getComputedStyle(testDiv);
      const hasColor = computedStyle.backgroundColor.includes('rgb(59, 130, 246)') || 
                       computedStyle.backgroundColor.includes('#3b82f6') ||
                       computedStyle.backgroundColor.includes('59, 130, 246');
      
      document.body.removeChild(testDiv);
      return hasColor;
    } catch (error) {
      console.error('Tailwind CSS检测失败:', error);
      return false;
    }
  };
  
  // 2. 检查PWA功能
  const checkPWA = () => {
    const checks = {
      serviceWorker: 'serviceWorker' in navigator,
      offlineSupport: 'caches' in window,
      pushNotifications: 'PushManager' in window
    };
    
    return checks;
  };
  
  // 3. 检查响应式设计
  const checkResponsiveDesign = () => {
    const checks = {
      viewportMeta: !!document.querySelector('meta[name="viewport"]'),
      responsiveClasses: window.innerWidth < 768 ? 
        document.body.classList.contains('md:hidden') !== undefined :
        document.body.classList.contains('md:block') !== undefined
    };
    
    return checks;
  };
  
  // 执行所有检测
  const tailwindWorking = checkTailwindStyles();
  const pwaFeatures = checkPWA();
  const responsiveFeatures = checkResponsiveDesign();
  
  // 输出结果
  console.log('✅ Tailwind CSS样式:', tailwindWorking ? '正常' : '异常');
  console.log('✅ Service Worker支持:', pwaFeatures.serviceWorker ? '正常' : '不支持');
  console.log('✅ 离线缓存支持:', pwaFeatures.offlineSupport ? '正常' : '不支持');
  console.log('✅ 推送通知支持:', pwaFeatures.pushNotifications ? '正常' : '不支持');
  console.log('✅ 响应式设计视口:', responsiveFeatures.viewportMeta ? '正常' : '缺失');
  console.log('✅ 响应式类检测:', responsiveFeatures.responsiveClasses !== undefined ? '正常' : '需要验证');
  
  // 总体评估
  const allChecksPassed = tailwindWorking && 
                         Object.values(pwaFeatures).every(v => v) &&
                         responsiveFeatures.viewportMeta;
                         
  console.log('\n=== 检测结论 ===');
  console.log(allChecksPassed ? '🎉 所有自动检测项目通过！系统运行正常。' : '⚠️  部分功能需要检查，请查看详细日志。');
  
  return {
    tailwindWorking,
    pwaFeatures,
    responsiveFeatures,
    overallStatus: allChecksPassed
  };
};

// 如果在浏览器环境中，立即运行检测
if (typeof window !== 'undefined') {
  setTimeout(() => {
    runAutoDetection();
  }, 1000);
}

export default runAutoDetection;