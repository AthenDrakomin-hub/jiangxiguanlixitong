/**
 * 江西酒店管理系统部署验证脚本
 * 用于验证生产环境部署是否成功
 */

import fetch from 'node-fetch';
import { createPool } from 'mysql2/promise';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 验证环境变量
const requiredEnvVars = [
  'TIDB_HOST',
  'TIDB_PORT',
  'TIDB_USER',
  'TIDB_PASSWORD',
  'TIDB_DATABASE'
];

console.log('🔍 开始部署验证...\n');

// 检查环境变量
console.log('1. 检查环境变量...');
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`❌ 缺少必要的环境变量: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}
console.log('✅ 环境变量检查通过\n');

// 数据库连接配置
const dbConfig = {
  host: process.env.TIDB_HOST!,
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER!,
  password: process.env.TIDB_PASSWORD!,
  database: process.env.TIDB_DATABASE!,
  ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
};

// 验证数据库连接
async function validateDatabaseConnection() {
  console.log('2. 验证数据库连接...');
  
  try {
    const pool = createPool(dbConfig);
    const connection = await pool.getConnection();
    
    // 测试基本查询
    const [rows] = await connection.execute('SELECT 1 as connected');
    if (rows && (rows as any[])[0].connected === 1) {
      console.log('✅ 数据库连接成功\n');
    } else {
      console.error('❌ 数据库连接测试失败');
      process.exit(1);
    }
    
    // 检查必要的表是否存在
    console.log('3. 检查数据库表结构...');
    const [tables] = await connection.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name IN ('dishes', 'orders', 'expenses', 'inventory', 'ktv_rooms', 'sign_bill_accounts', 'hotel_rooms', 'payment_methods')",
      [process.env.TIDB_DATABASE!]
    );
    
    const existingTables = (tables as any[]).map((row: any) => row.table_name);
    const requiredTables = ['dishes', 'orders', 'expenses', 'inventory', 'ktv_rooms', 'sign_bill_accounts', 'hotel_rooms', 'payment_methods'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.error(`❌ 缺少必要的数据表: ${missingTables.join(', ')}`);
      console.log('💡 请运行数据库初始化脚本');
      process.exit(1);
    }
    
    console.log('✅ 数据库表结构检查通过\n');
    connection.release();
    await pool.end();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

// 验证API服务
async function validateApiService() {
  console.log('4. 验证API服务...');
  
  try {
    // 测试API根路径
    const apiResponse = await fetch('http://localhost:3000/api');
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      if (data.status === 'running') {
        console.log('✅ API服务正常运行\n');
      } else {
        console.error('❌ API服务响应异常');
        process.exit(1);
      }
    } else {
      console.error('❌ API服务无法访问');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ API服务测试失败:', error);
    process.exit(1);
  }
}

// 验证前端构建
async function validateFrontendBuild() {
  console.log('5. 验证前端构建...');
  
  try {
    // 检查dist目录是否存在
    const fs = require('fs');
    const path = require('path');
    
    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('❌ 前端构建目录不存在，请先运行 npm run build');
      process.exit(1);
    }
    
    // 检查关键文件是否存在
    const keyFiles = ['index.html', 'assets'];
    for (const file of keyFiles) {
      const filePath = path.join(distPath, file);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ 前端构建文件缺失: ${file}`);
        process.exit(1);
      }
    }
    
    console.log('✅ 前端构建验证通过\n');
  } catch (error) {
    console.error('❌ 前端构建验证失败:', error);
    process.exit(1);
  }
}

// 运行所有验证
async function runAllValidations() {
  try {
    await validateDatabaseConnection();
    await validateApiService();
    await validateFrontendBuild();
    
    console.log('🎉 所有验证通过！系统已准备好部署到生产环境。');
    console.log('\n📋 下一步操作:');
    console.log('1. 如果使用Vercel部署，请确保已设置所有环境变量');
    console.log('2. 运行 `vercel --prod` 部署到生产环境');
    console.log('3. 部署完成后访问您的应用URL进行最终验证');
  } catch (error) {
    console.error('❌ 部署验证失败:', error);
    process.exit(1);
  }
}

// 执行验证
runAllValidations();