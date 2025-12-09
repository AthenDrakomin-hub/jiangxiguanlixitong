import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// TiDB连接配置
const config = {
  host: process.env.TIDB_HOST,
  port: process.env.TIDB_PORT,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
};

async function checkTables() {
  let connection;
  
  try {
    // 创建连接
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');
    
    // 检查所有表的结构
    const tables = ['dishes', 'orders', 'expenses', 'inventory', 'ktv_rooms', 'sign_bill_accounts', 'hotel_rooms', 'payment_methods'];
    
    for (const table of tables) {
      try {
        console.log(`\n🔍 检查表结构: ${table}`);
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`✅ 表 ${table} 存在，列信息:`);
        columns.forEach(col => {
          console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''} ${col.Default ? `[Default: ${col.Default}]` : ''}`);
        });
      } catch (error) {
        console.log(`❌ 表 ${table} 不存在或无法访问: ${error.message}`);
      }
    }
    
    console.log('\n🎉 表结构检查完成！');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 数据库连接已关闭');
    }
  }
}

checkTables();