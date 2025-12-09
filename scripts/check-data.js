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

async function checkData() {
  let connection;
  
  try {
    // 创建连接
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');
    
    // 检查各个表的数据量
    const tables = ['dishes', 'orders', 'expenses', 'inventory', 'ktv_rooms', 'sign_bill_accounts', 'hotel_rooms', 'payment_methods'];
    
    for (const table of tables) {
      try {
        console.log(`\n🔍 检查表数据: ${table}`);
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ 表 ${table} 数据量: ${rows[0].count}`);
        
        // 如果是dishes表，显示前几条数据
        if (table === 'dishes' && rows[0].count > 0) {
          console.log(`📋 表 ${table} 前3条数据:`);
          const [data] = await connection.execute(`SELECT id, name, price, category FROM ${table} LIMIT 3`);
          data.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} - ${item.price} (${item.category})`);
          });
        }
      } catch (error) {
        console.log(`❌ 表 ${table} 数据检查失败: ${error.message}`);
      }
    }
    
    console.log('\n🎉 数据检查完成！');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 数据库连接已关闭');
    }
  }
}

checkData();