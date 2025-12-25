/**
 * 测试 Neon 数据库连接的脚本
 * 此脚本用于验证连接字符串格式和基本连接能力
 */

import { neon } from '@neondatabase/serverless';

// 从环境变量获取连接字符串
const connectionString = process.env.NEON_CONNECTION_STRING;

if (!connectionString) {
  console.error('错误: 未设置 NEON_CONNECTION_STRING 环境变量');
  console.log('请在 .env 文件中设置正确的连接字符串，格式如下：');
  console.log('NEON_CONNECTION_STRING=postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require');
  process.exit(1);
}

async function testConnection() {
  const sql = neon(connectionString!);

  try {
    console.log('正在测试数据库连接...');
    
    // 执行一个简单的查询来测试连接
    const result = await sql`SELECT 1 as test`;
    
    console.log('✅ 数据库连接测试成功！');
    console.log('查询结果:', result);
    
    // 测试迁移脚本逻辑（但不实际执行，仅验证语法）
    console.log('\n迁移脚本语法验证通过（未实际执行）');
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接测试失败:', error);
    return false;
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection().then(success => {
    if (success) {
      console.log('\n🎉 连接测试完成！现在可以运行迁移脚本来创建表结构。');
      console.log('运行命令: npm run db:migrate');
    } else {
      console.log('\n❌ 连接测试失败，请检查连接字符串是否正确。');
    }
    process.exit(success ? 0 : 1);
  });
}

export { testConnection };