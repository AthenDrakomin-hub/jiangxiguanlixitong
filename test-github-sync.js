// GitHub 同步测试脚本
// 用于测试 GitHub 同步功能是否正常工作

import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 开始测试 GitHub 同步功能...');

// 检查必要的环境变量
const requiredEnvVars = [
  'VITE_GITHUB_OWNER',
  'VITE_GITHUB_REPO', 
  'VITE_GITHUB_TOKEN'
];

console.log('\n📋 检查环境变量...');
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.log('❌ 缺少必要的环境变量:');
  missingEnvVars.forEach(envVar => console.log(`   - ${envVar}`));
  console.log('\n💡 请在 .env.local 文件中设置这些变量');
  process.exit(1);
}

console.log('✅ 所有必要的环境变量都已设置');

// 测试数据
const testData = {
  dishes: [
    { id: '1', name: '测试菜品1', price: 28.00 },
    { id: '2', name: '测试菜品2', price: 38.00 }
  ],
  orders: [
    { id: 'ORD001', tableNumber: 'A1', totalAmount: 66.00 }
  ]
};

console.log('\n📝 测试数据准备完毕');
console.log('   - 菜品数量:', testData.dishes.length);
console.log('   - 订单数量:', testData.orders.length);

// GitHub 配置
const githubConfig = {
  owner: process.env.VITE_GITHUB_OWNER,
  repo: process.env.VITE_GITHUB_REPO,
  branch: process.env.VITE_GITHUB_BRANCH || 'main',
  token: process.env.VITE_GITHUB_TOKEN,
  pathPrefix: 'data'
};

console.log('\n🔗 GitHub 配置:');
console.log('   - Owner:', githubConfig.owner);
console.log('   - Repo:', githubConfig.repo);
console.log('   - Branch:', githubConfig.branch);

console.log('\n✨ GitHub 同步功能测试脚本已准备就绪！');
console.log('\n💡 要测试完整的同步功能，请在应用的设置页面中配置 GitHub 并点击"备份所有数据到 GitHub"按钮。');

export default {};