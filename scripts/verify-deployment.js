import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

console.log('🚀 开始部署验证...');

// TiDB连接配置
const config = {
  host: process.env.TIDB_HOST,
  port: process.env.TIDB_PORT,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
};

async function verifyDeployment() {
  let connection;
  
  try {
    console.log('\n1. 验证数据库连接...');
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');
    
    console.log('\n2. 验证数据表结构...');
    const tables = ['dishes', 'orders', 'expenses', 'inventory', 'ktv_rooms', 'sign_bill_accounts', 'hotel_rooms', 'payment_methods'];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          console.log(`✅ 表 ${table} 存在`);
        } else {
          console.log(`❌ 表 ${table} 不存在`);
        }
      } catch (error) {
        console.log(`❌ 表 ${table} 检查失败: ${error.message}`);
      }
    }
    
    console.log('\n3. 验证菜品数据...');
    try {
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM dishes');
      console.log(`✅ 菜品表数据量: ${rows[0].count} 条`);
      
      if (rows[0].count > 0) {
        const [sample] = await connection.execute('SELECT name, price FROM dishes LIMIT 3');
        console.log('📋 部分菜品示例:');
        sample.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} - ¥${item.price}`);
        });
      }
    } catch (error) {
      console.log(`❌ 菜品数据检查失败: ${error.message}`);
    }
    
    console.log('\n4. 验证客房数据...');
    try {
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM hotel_rooms');
      console.log(`✅ 客房数据量: ${rows[0].count} 间`);
    } catch (error) {
      console.log(`❌ 客房数据检查失败: ${error.message}`);
    }
    
    console.log('\n5. 验证支付方式数据...');
    try {
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM payment_methods');
      console.log(`✅ 支付方式数据量: ${rows[0].count} 种`);
    } catch (error) {
      console.log(`❌ 支付方式数据检查失败: ${error.message}`);
    }
    
    console.log('\n🎉 部署验证完成！');
    console.log('\n📊 验证结果摘要:');
    console.log('   - 数据库连接: 成功');
    console.log('   - 数据表结构: 已验证');
    console.log('   - 核心数据: 已验证');
    
  } catch (error) {
    console.error('\n❌ 验证过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 数据库连接已关闭');
    }
  }
}

verifyDeployment();