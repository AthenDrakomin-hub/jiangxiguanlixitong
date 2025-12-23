// test-scripts/test-env.ts
// 测试环境变量配置

console.log('🔍 检查环境变量配置...');

const requiredEnvVars = [
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'VITE_ADMIN_USER',
  'VITE_ADMIN_PASS'
];

let allSet = true;

for (const envVar of requiredEnvVars) {
  const isSet = !!process.env[envVar];
  console.log(`  ${isSet ? '✅' : '❌'} ${envVar}: ${isSet ? '已设置' : '未设置'}`);
  
  if (!isSet) {
    allSet = false;
  }
}

if (allSet) {
  console.log('\n✅ 所有必需环境变量均已设置');
} else {
  console.log('\n⚠️  部分环境变量未设置，请检查配置');
}

// 显示部分URL用于验证（不显示完整token）
if (process.env.KV_REST_API_URL) {
  console.log(`\n📋 URL预览: ${process.env.KV_REST_API_URL.substring(0, 50)}...`);
}