import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
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

console.log('正在连接到TiDB数据库...');

async function initDatabase() {
  let connection;
  
  try {
    // 创建连接
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');
    
    // 先执行创建数据库和使用数据库的语句
    await connection.execute("CREATE DATABASE IF NOT EXISTS fortune500 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    await connection.execute("USE fortune500");
    console.log('✅ 数据库创建和选择完成');
    
    // 读取SQL文件
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'init-database.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 按分号分割SQL语句，但保留多行语句的完整性
    const statements = [];
    let currentStatement = '';
    const lines = sqlScript.split('\n');
    
    for (const line of lines) {
      // 跳过注释行
      if (line.trim().startsWith('--') || line.trim().startsWith('/*')) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // 如果这一行以分号结尾，则认为是一个完整的语句
      if (line.trim().endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // 过滤掉空语句
    const filteredStatements = statements.filter(stmt => stmt.length > 0);
    
    // 首先执行所有的CREATE TABLE语句
    for (const statement of filteredStatements) {
      if (statement.startsWith('CREATE TABLE')) {
        try {
          await connection.execute(statement);
          const tableNameMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
          if (tableNameMatch) {
            console.log(`✅ 表创建成功: ${tableNameMatch[1]}`);
          } else {
            console.log(`✅ 表创建成功: ${statement.substring(0, 50)}...`);
          }
        } catch (error) {
          if (error.message.includes('already exists')) {
            const tableNameMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
            if (tableNameMatch) {
              console.log(`⚠️  表已存在: ${tableNameMatch[1]}`);
            } else {
              console.log(`⚠️  表已存在: ${statement.substring(0, 50)}...`);
            }
          } else {
            console.error(`❌ 表创建失败: ${statement.substring(0, 50)}...`);
            console.error(`错误信息: ${error.message}`);
          }
        }
      }
    }
    
    // 然后执行其他的SQL语句（INSERT, CREATE INDEX等）
    for (const statement of filteredStatements) {
      if (!statement.startsWith('CREATE DATABASE') && 
          !statement.startsWith('USE ') && 
          !statement.startsWith('CREATE TABLE') &&
          !statement.startsWith('SHOW')) {
        const trimmedStatement = statement.trim();
        if (trimmedStatement) {
          try {
            await connection.execute(trimmedStatement);
            // 只显示部分语句的成功信息，避免输出过多
            if (trimmedStatement.startsWith('CREATE INDEX') || 
                trimmedStatement.startsWith('INSERT')) {
              console.log(`✅ 执行成功: ${trimmedStatement.substring(0, Math.min(50, trimmedStatement.length))}...`);
            }
          } catch (error) {
            // 忽略某些错误，比如索引已存在的错误
            if (error.message.includes('already exists') || 
                error.message.includes('Duplicate')) {
              // 不显示索引已存在的警告，避免输出过多
            } else {
              console.error(`❌ 执行失败: ${trimmedStatement.substring(0, 50)}...`);
              console.error(`错误信息: ${error.message}`);
            }
          }
        }
      }
    }
    
    console.log('\n🎉 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 数据库连接已关闭');
    }
  }
}

initDatabase();