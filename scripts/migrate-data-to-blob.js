#!/usr/bin/env node

// 数据迁移脚本：从TiDB迁移到Vercel Blob Storage
// 此脚本将从现有的TiDB数据库中读取数据并将其存储到Vercel Blob Storage中

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🚀 开始数据迁移...');

// TiDB连接配置
const tidbConfig = {
  host: process.env.TIDB_HOST,
  port: process.env.TIDB_PORT || 4000,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE || 'fortune500',
  ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
};

// 验证必要的环境变量
if (!process.env.TIDB_HOST || !process.env.TIDB_USER || !process.env.TIDB_PASSWORD) {
  console.error('❌ 缺少必要的TiDB环境变量！');
  console.error('请确保在.env.local文件中设置以下变量：');
  console.error('- TIDB_HOST');
  console.error('- TIDB_USER');
  console.error('- TIDB_PASSWORD');
  process.exit(1);
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ 缺少BLOB_READ_WRITE_TOKEN环境变量！');
  console.error('请确保在.env.local文件中设置BLOB_READ_WRITE_TOKEN');
  process.exit(1);
}

// 定义需要迁移的表
const TABLES_TO_MIGRATE = [
  'dishes',
  'orders',
  'expenses',
  'inventory',
  'ktv_rooms',
  'sign_bill_accounts',
  'hotel_rooms',
  'payment_methods'
];

// 生成Blob存储键名
function generateBlobKey(tableName, id) {
  return `${tableName}/${id}.json`;
}

// 连接到TiDB数据库
async function connectToTiDB() {
  console.log('🔌 连接到TiDB数据库...');
  try {
    const connection = await mysql.createConnection(tidbConfig);
    console.log('✅ 数据库连接成功');
    return connection;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    throw error;
  }
}

// 从TiDB获取表数据
async function getDataFromTable(connection, tableName) {
  console.log(`📥 从表 ${tableName} 获取数据...`);
  try {
    const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
    console.log(`✅ 成功获取 ${rows.length} 条记录 from ${tableName}`);
    return rows;
  } catch (error) {
    console.error(`❌ 获取表 ${tableName} 数据失败:`, error.message);
    return [];
  }
}

// 将数据存储到Vercel Blob Storage
async function storeDataInBlob(tableName, data) {
  console.log(`💾 将 ${data.length} 条记录存储到Blob Storage (${tableName})...`);
  let successCount = 0;
  
  for (const item of data) {
    try {
      const blobKey = generateBlobKey(tableName, item.id);
      const blobResult = await put(blobKey, JSON.stringify(item), {
        access: 'public',
        contentType: 'application/json'
      });
      successCount++;
      
      // 显示进度（每10条记录显示一次）
      if (successCount % 10 === 0 || successCount === data.length) {
        console.log(`  进度: ${successCount}/${data.length} 条记录已存储`);
      }
    } catch (error) {
      console.error(`  ❌ 存储记录失败 (ID: ${item.id}):`, error.message);
    }
  }
  
  console.log(`✅ 成功将 ${successCount}/${data.length} 条记录存储到Blob Storage (${tableName})`);
  return successCount;
}

// 主迁移函数
async function migrateData() {
  let connection;
  
  try {
    // 1. 连接到TiDB
    connection = await connectToTiDB();
    
    // 2. 遍历每个表进行迁移
    for (const tableName of TABLES_TO_MIGRATE) {
      console.log(`\n🔄 开始迁移表: ${tableName}`);
      
      // 3. 从TiDB获取数据
      const data = await getDataFromTable(connection, tableName);
      
      if (data.length === 0) {
        console.log(`⚠️  表 ${tableName} 中没有数据，跳过迁移`);
        continue;
      }
      
      // 4. 存储到Vercel Blob Storage
      const successCount = await storeDataInBlob(tableName, data);
      
      console.log(`📋 表 ${tableName} 迁移完成: ${successCount}/${data.length} 条记录成功迁移\n`);
    }
    
    console.log('🎉 所有数据迁移完成！');
    return true;
  } catch (error) {
    console.error('❌ 数据迁移过程中发生错误:', error.message);
    return false;
  } finally {
    // 关闭数据库连接
    if (connection) {
      await connection.end();
      console.log('🔒 数据库连接已关闭');
    }
  }
}

// 运行迁移
async function main() {
  console.log('🚀 启动数据迁移工具');
  console.log('=====================================');
  
  const success = await migrateData();
  
  if (success) {
    console.log('\n✅ 数据迁移成功完成！');
    console.log('\n💡 下一步操作:');
    console.log('1. 验证数据是否正确迁移');
    console.log('2. 更新应用程序配置以使用Blob Storage');
    console.log('3. 测试应用程序功能');
  } else {
    console.log('\n❌ 数据迁移失败，请检查错误信息并重试');
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('未处理的错误:', error);
  process.exit(1);
});