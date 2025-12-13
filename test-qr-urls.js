// 测试二维码URL生成逻辑
const testQRUrls = () => {
  // 模拟当前页面URL
  const currentUrl = new URL('http://localhost:5173/');
  
  // 测试不同类型的二维码生成
  const testCases = [
    { type: '客房', id: '8201' },
    { type: '大厅', id: 'LOBBY' },
    { type: 'KTV', id: 'ktv-001' },
    { type: '外卖', id: 'TAKEOUT' }
  ];
  
  console.log('=== 二维码URL生成测试 ===');
  
  testCases.forEach(testCase => {
    // 创建新的URL对象
    const url = new URL(currentUrl);
    url.searchParams.set('page', 'customer');
    url.searchParams.set('id', testCase.id);
    
    const targetUrl = url.toString();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}`;
    
    console.log(`${testCase.type} (${testCase.id}):`);
    console.log(`  目标URL: ${targetUrl}`);
    console.log(`  二维码URL: ${qrCodeUrl}`);
    console.log('');
  });
};

// 运行测试
testQRUrls();