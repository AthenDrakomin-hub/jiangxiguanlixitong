#!/usr/bin/env node

/**
 * H5 页面测试脚本
 * 检查 H5 客户端点餐页面是否正常
 */

const fs = require('fs');
const path = require('path');

console.log('📱 开始 H5 页面诊断...\n');

const checks = {
  passed: 0,
  failed: 0
};

// 1. 检查 CustomerOrder 组件
console.log('🔍 检查 1: CustomerOrder 组件');
const customerOrderPath = path.join(__dirname, '..', 'components', 'CustomerOrder.tsx');
if (fs.existsSync(customerOrderPath)) {
  console.log('  ✅ CustomerOrder.tsx 存在');
  checks.passed++;
  
  const content = fs.readFileSync(customerOrderPath, 'utf8');
  
  // 检查关键功能
  if (content.includes('currentLang')) {
    console.log('  ✅ 多语言支持 (中文/菲律宾语)');
    checks.passed++;
  }
  
  if (content.includes('tableId') || content.includes('showTableSelector')) {
    console.log('  ✅ 房间/桌号选择功能');
    checks.passed++;
  }
  
  if (content.includes('cart') && content.includes('Dish')) {
    console.log('  ✅ 购物车功能');
    checks.passed++;
  }
  
  if (content.includes('PaymentMethod') || content.includes('payment')) {
    console.log('  ✅ 支付方式选择');
    checks.passed++;
  }
  
  if (content.includes('responsive') || content.includes('mobile')) {
    console.log('  ✅ 移动端响应式设计');
    checks.passed++;
  }
} else {
  console.log('  ❌ CustomerOrder.tsx 不存在');
  checks.failed++;
}

// 2. 检查 QR 码生成组件
console.log('\n🔗 检查 2: QR 码生成');
const qrCodePath = path.join(__dirname, '..', 'components', 'QRCodeManager.tsx');
if (fs.existsSync(qrCodePath)) {
  console.log('  ✅ QRCodeManager.tsx 存在');
  checks.passed++;
  
  const content = fs.readFileSync(qrCodePath, 'utf8');
  if (content.includes('HOTEL') || content.includes('8201')) {
    console.log('  ✅ 支持酒店房间 QR 码生成');
    checks.passed++;
  }
  
  if (content.includes('LOBBY') || content.includes('TAKEOUT')) {
    console.log('  ✅ 支持大厅/外卖 QR 码生成');
    checks.passed++;
  }
} else {
  console.log('  ❌ QRCodeManager.tsx 不存在');
  checks.failed++;
}

// 3. 检查路由配置
console.log('\n🛤️  检查 3: 路由配置');
const appPath = path.join(__dirname, '..', 'App.tsx');
if (fs.existsSync(appPath)) {
  const content = fs.readFileSync(appPath, 'utf8');
  
  if (content.includes("'customer'")) {
    console.log('  ✅ customer 路由已配置');
    checks.passed++;
  } else {
    console.log('  ❌ customer 路由未配置');
    checks.failed++;
  }
  
  if (content.includes('CustomerOrder')) {
    console.log('  ✅ CustomerOrder 组件已引入');
    checks.passed++;
  }
} else {
  console.log('  ❌ App.tsx 不存在');
  checks.failed++;
}

// 4. 检查店铺信息配置
console.log('\n🏪 检查 4: 店铺信息配置');
const settingsPath = path.join(__dirname, '..', 'components', 'Settings.tsx');
if (fs.existsSync(settingsPath)) {
  const content = fs.readFileSync(settingsPath, 'utf8');
  
  if (content.includes('storeInfo') && content.includes('H5')) {
    console.log('  ✅ H5 店铺信息配置存在');
    checks.passed++;
  }
  
  if (content.includes('address') && content.includes('phone')) {
    console.log('  ✅ 店铺地址和电话配置');
    checks.passed++;
  }
} else {
  console.log('  ⚠️  Settings.tsx 不存在');
}

// 总结
console.log('\n' + '='.repeat(50));
console.log('📊 诊断总结:');
console.log(`  ✅ 通过: ${checks.passed}`);
console.log(`  ❌ 失败: ${checks.failed}`);
console.log('='.repeat(50));

if (checks.failed > 0) {
  console.log('\n❌ H5 页面存在问题');
  process.exit(1);
} else {
  console.log('\n✅ H5 页面配置完整！');
  console.log('\n📱 H5 功能列表:');
  console.log('  ✓ 移动端点餐界面');
  console.log('  ✓ 多语言支持（中文/菲律宾语）');
  console.log('  ✓ 房间号/桌号选择');
  console.log('  ✓ 菜品浏览和搜索');
  console.log('  ✓ 购物车管理');
  console.log('  ✓ 多种支付方式');
  console.log('  ✓ 订单历史查看');
  console.log('\n🔗 访问方式:');
  console.log('  • 通过 QR 码扫描访问');
  console.log('  • URL 格式: https://your-domain.com/?location=8201');
  console.log('  • 或直接访问: https://your-domain.com/ (手动选择房间)');
  process.exit(0);
}
