import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: '.env.local' });

// TiDB连接配置
const config = {
  host: process.env.TIDB_HOST,
  port: process.env.TIDB_PORT,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
};

async function checkTableStructure() {
  let connection;
  
  try {
    // 创建连接
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');
    
    // 检查所有表
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('\n📋 数据库中的表:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // 检查 dishes 表结构
    console.log('\n🔍 dishes 表结构:');
    const [dishesColumns] = await connection.execute("DESCRIBE dishes");
    dishesColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // 检查 hotel_rooms 表结构
    console.log('\n🔍 hotel_rooms 表结构:');
    const [hotelRoomsColumns] = await connection.execute("DESCRIBE hotel_rooms");
    hotelRoomsColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // 检查 ktv_rooms 表结构
    console.log('\n🔍 ktv_rooms 表结构:');
    const [ktvRoomsColumns] = await connection.execute("DESCRIBE ktv_rooms");
    ktvRoomsColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // 检查 payment_methods 表结构
    console.log('\n🔍 payment_methods 表结构:');
    const [paymentMethodsColumns] = await connection.execute("DESCRIBE payment_methods");
    paymentMethodsColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ 检查表结构失败:', error.message);
    console.error('详细错误信息:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 数据库连接已关闭');
    }
  }
}

checkTableStructure();