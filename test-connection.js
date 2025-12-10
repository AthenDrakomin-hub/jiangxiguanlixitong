// test-connection.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

async function testConnection() {
  console.log('检查环境变量:');
  console.log('- TIDB_HOST:', process.env.TIDB_HOST || '未设置');
  console.log('- TIDB_PORT:', process.env.TIDB_PORT || '未设置');
  console.log('- TIDB_USER:', process.env.TIDB_USER || '未设置');
  console.log('- TIDB_DATABASE:', process.env.TIDB_DATABASE || '未设置');
  console.log('- TIDB_SSL:', process.env.TIDB_SSL || '未设置');
  
  // 检查是否所有必要变量都存在
  const required = ['TIDB_HOST', 'TIDB_PORT', 'TIDB_USER', 'TIDB_PASSWORD', 'TIDB_DATABASE'];
  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ 缺少必要的环境变量:', missing.join(', '));
    return;
  }
  
  try {
    console.log('\n尝试连接数据库...');
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: process.env.TIDB_SSL === 'true' 
        ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
        : undefined,
    });
    
    console.log('✅ 数据库连接成功！');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM menu_items');
    console.log('✅ 查询成功，menu_items表记录数:', rows[0].count);
    
    await connection.end();
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.error('详细错误:', error);
  }
}

testConnection();