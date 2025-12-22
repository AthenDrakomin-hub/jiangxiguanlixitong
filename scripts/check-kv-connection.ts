/**
 * KV 连接诊断脚本
 * 
 * 用途：检查 Vercel KV 环境变量和连接状态
 * 使用：node --loader tsx scripts/check-kv-connection.ts
 */

// 1. 检查环境变量
console.log('=== Vercel KV 环境变量检查 ===\n');

const envVars = {
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  KV_URL: process.env.KV_URL,
};

console.log('环境变量状态:');
Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`❌ ${key}: 未设置`);
  }
});

// 2. 检查必需变量
console.log('\n=== 连接状态评估 ===\n');

const hasUrl = !!(envVars.KV_REST_API_URL || envVars.KV_URL);
const hasToken = !!envVars.KV_REST_API_TOKEN;

if (hasUrl && hasToken) {
  console.log('✅ KV 配置完整，可以连接');
  console.log(`\n📊 使用的 URL: ${envVars.KV_REST_API_URL || envVars.KV_URL}`);
} else {
  console.log('❌ KV 配置缺失');
  
  if (!hasUrl) {
    console.log('   - 缺少 KV_REST_API_URL 或 KV_URL');
  }
  if (!hasToken) {
    console.log('   - 缺少 KV_REST_API_TOKEN');
  }
  
  console.log('\n🔧 修复步骤:');
  console.log('1. 登录 Vercel Dashboard: https://vercel.com/dashboard');
  console.log('2. 选择项目 → Storage 标签页');
  console.log('3. 创建或连接 Vercel KV 实例');
  console.log('4. 点击 "Link to Project"');
  console.log('5. 重新部署项目（Redeploy）');
}

// 3. 测试 API 连接（如果部署到 Vercel）
console.log('\n=== API 连接测试 ===\n');

const apiUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api`
  : 'http://localhost:5173/api';

console.log(`测试 URL: ${apiUrl}`);
console.log('提示: 部署后访问 /api 端点查看连接状态');
