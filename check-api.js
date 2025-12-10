// 检查 API 是否可用的简单脚本

console.log('🔍 检查 API 是否可用...');

// 检查 API 可用性
async function checkApiAvailability() {
  try {
    console.log('正在检查本地 API...');
    const response = await fetch('http://localhost:3000/api/index');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API 可用: ${data.message}`);
      return true;
    } else {
      console.log(`❌ API 不可用: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 无法连接到本地 API: ${error.message}`);
    console.log('💡 请确保您的应用已在 Vercel 上部署或本地开发服务器正在运行');
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始检查 API 连接...');
  
  const isApiAvailable = await checkApiAvailability();
  
  if (isApiAvailable) {
    console.log('\n🎉 API 连接正常！');
    console.log('💡 现在您可以正常使用系统进行生意操作了');
  } else {
    console.log('\n⚠️  API 连接异常');
    console.log('💡 请确保以下几点：');
    console.log('   1. 您的应用已部署到 Vercel');
    console.log('   2. 或者本地开发服务器正在运行 (npm run dev)');
    console.log('   3. 数据库连接配置正确');
  }
}

// 运行主函数
main();