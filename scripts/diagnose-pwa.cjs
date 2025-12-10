#!/usr/bin/env node

/**
 * PWA 诊断脚本
 * 检查 PWA 配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始 PWA 配置诊断...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// 1. 检查 manifest 配置
console.log('📋 检查 1: manifest 配置');
try {
  const viteConfig = fs.readFileSync(path.join(__dirname, '..', 'vite.config.ts'), 'utf8');
  if (viteConfig.includes('VitePWA')) {
    console.log('  ✅ VitePWA 插件已配置');
    checks.passed++;
  } else {
    console.log('  ❌ VitePWA 插件未找到');
    checks.failed++;
  }
  
  if (viteConfig.includes('manifest:')) {
    console.log('  ✅ manifest 配置存在');
    checks.passed++;
  } else {
    console.log('  ❌ manifest 配置缺失');
    checks.failed++;
  }
} catch (error) {
  console.log('  ❌ 无法读取 vite.config.ts');
  checks.failed++;
}

// 2. 检查图标文件
console.log('\n🖼️  检查 2: 图标文件');
const iconFiles = ['favicon.ico', 'logo.svg'];
iconFiles.forEach(file => {
  const iconPath = path.join(__dirname, '..', 'public', file);
  if (fs.existsSync(iconPath)) {
    console.log(`  ✅ ${file} 存在`);
    checks.passed++;
  } else {
    console.log(`  ❌ ${file} 不存在`);
    checks.failed++;
  }
});

// 3. 检查 index.html 中的 manifest 链接
console.log('\n🔗 检查 3: HTML manifest 引用');
try {
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  if (indexHtml.includes('rel="manifest"')) {
    console.log('  ✅ manifest 链接存在');
    checks.passed++;
  } else {
    console.log('  ❌ manifest 链接缺失');
    checks.failed++;
  }
  
  if (indexHtml.includes('theme-color')) {
    console.log('  ✅ theme-color 已设置');
    checks.passed++;
  } else {
    console.log('  ⚠️  theme-color 未设置');
    checks.warnings++;
  }
} catch (error) {
  console.log('  ❌ 无法读取 index.html');
  checks.failed++;
}

// 4. 检查构建输出
console.log('\n📦 检查 4: 构建输出');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  console.log('  ✅ dist 目录存在');
  checks.passed++;
  
  const manifestPath = path.join(distPath, 'manifest.webmanifest');
  const swPath = path.join(distPath, 'sw.js');
  const registerSwPath = path.join(distPath, 'registerSW.js');
  
  if (fs.existsSync(manifestPath)) {
    console.log('  ✅ manifest.webmanifest 已生成');
    checks.passed++;
  } else {
    console.log('  ⚠️  manifest.webmanifest 未生成（需要运行 npm run build）');
    checks.warnings++;
  }
  
  if (fs.existsSync(swPath) || fs.existsSync(registerSwPath)) {
    console.log('  ✅ Service Worker 文件已生成');
    checks.passed++;
  } else {
    console.log('  ⚠️  Service Worker 未生成（需要运行 npm run build）');
    checks.warnings++;
  }
} else {
  console.log('  ⚠️  dist 目录不存在（需要运行 npm run build）');
  checks.warnings++;
}

// 5. 检查 package.json 依赖
console.log('\n📚 检查 5: NPM 依赖');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  if (packageJson.devDependencies && packageJson.devDependencies['vite-plugin-pwa']) {
    console.log('  ✅ vite-plugin-pwa 已安装');
    checks.passed++;
  } else {
    console.log('  ❌ vite-plugin-pwa 未安装');
    checks.failed++;
  }
} catch (error) {
  console.log('  ❌ 无法读取 package.json');
  checks.failed++;
}

// 总结
console.log('\n' + '='.repeat(50));
console.log('📊 诊断总结:');
console.log(`  ✅ 通过: ${checks.passed}`);
console.log(`  ❌ 失败: ${checks.failed}`);
console.log(`  ⚠️  警告: ${checks.warnings}`);
console.log('='.repeat(50));

if (checks.failed > 0) {
  console.log('\n❌ PWA 配置存在问题，需要修复');
  console.log('\n💡 修复建议:');
  console.log('  1. 确保 vite-plugin-pwa 已安装: npm install vite-plugin-pwa --save-dev');
  console.log('  2. 检查图标文件是否存在于 public 目录');
  console.log('  3. 运行构建: npm run build');
  console.log('  4. 部署到 Vercel 后测试 PWA 功能');
  process.exit(1);
} else if (checks.warnings > 0) {
  console.log('\n⚠️  PWA 配置基本正常，但有一些警告');
  console.log('\n💡 建议:');
  console.log('  1. 运行 npm run build 生成完整的 PWA 文件');
  console.log('  2. 部署后在 Chrome DevTools > Application > Manifest 检查');
  process.exit(0);
} else {
  console.log('\n✅ PWA 配置完美！');
  console.log('\n📱 PWA 功能已就绪:');
  console.log('  • 可安装到桌面/主屏幕');
  console.log('  • Service Worker 离线支持');
  console.log('  • 独立窗口模式运行');
  process.exit(0);
}
