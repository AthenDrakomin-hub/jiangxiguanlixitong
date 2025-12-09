// PWA测试文件
export function checkPWAStatus() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('PWA Service Worker registered with scope:', registration.scope);
        return registration.update();
      })
      .catch((error) => {
        console.log('PWA Service Worker registration failed:', error);
      });
  } else {
    console.log('PWA Service Worker not supported');
  }

  // 检查是否安装为PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('PWA is installed and running in standalone mode');
  }

  // 检查beforeinstallprompt事件
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available');
    e.preventDefault();
    // 你可以在这里保存事件，稍后触发安装提示
  });
}