import { createWriteStream } from 'fs';
import { get } from 'https';

// 创建音频文件写入流
const file = createWriteStream('public/notification.mp3');

// 下载通知音效
const request = get('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3', function(response) {
  response.pipe(file);
  
  file.on('finish', function() {
    file.close();
    console.log('通知音效下载完成！');
  });
});

request.on('error', function(err) {
  console.error('下载失败:', err);
  // 注意：在ES模块中，unlink需要通过promises或回调方式使用
});