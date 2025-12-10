// 数据库连接测试脚本
// 用于验证Vercel环境变量配置是否正确

import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { join } from 'path';

// 显式加载 .env.local 文件
const envPath = join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// 从环境变量获取数据库配置
const config = {
  host: process.env.TIDB_HOST,
  port: process.env.TIDB_PORT || 4000,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE || 'fortune500',
  ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
};

console.log('🔍 测试数据库连接...');
console.log('HOST:', process.env.TIDB_HOST);
console.log('USER:', process.env.TIDB_USER);
console.log('DATABASE:', process.env.TIDB_DATABASE);

async function testConnection() {
  let connection;
  
  try {
    // 创建连接
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');
    
    // 测试基本查询
    const [rows] = await connection.execute('SELECT 1 as connected');
    console.log('✅ 查询测试通过:', rows[0]);
    
    // 检查表是否存在
    const [tables] = await connection.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ? LIMIT 5",
      [process.env.TIDB_DATABASE || 'fortune500']
    );
    
    console.log('📋 数据库中的表:');
    tables.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    
    await connection.end();
    console.log('🎉 数据库连接测试完成！');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

testConnection();