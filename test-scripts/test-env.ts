// 简单的环境变量测试脚本
import 'dotenv/config';

console.log('环境变量测试:');
console.log('KV_REST_API_URL:', process.env.KV_REST_API_URL);
console.log('KV_REST_API_TOKEN 存在:', !!process.env.KV_REST_API_TOKEN);
console.log('所有环境变量中包含 KV 的:');
Object.keys(process.env).filter(key => key.includes('KV')).forEach(key => {
  console.log(`  ${key}: ${process.env[key]}`);
});