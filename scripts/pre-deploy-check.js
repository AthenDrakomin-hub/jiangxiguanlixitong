#!/usr/bin/env node

/**
 * 快速部署检查脚本
 * 用于验证本地环境是否满足部署要求
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 开始检查部署环境...\n');

let hasErrors = false;
let hasWarnings = false;

// 1. 检查必需文件
console.log('📁 1. 检查必需文件...');
const requiredFiles = [
  'package.json',
  'vercel.json',
  'api/index.ts',
  'api/db.ts',
  'vite.config.ts',
  '.env.example',
  'scripts/init-database.sql'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - 文件缺失`);
    hasErrors = true;
  }
});

// 2. 检查环境变量文件
console.log('\n🔑 2. 检查环境变量配置...');
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (fs.existsSync(envPath)) {
  console.log('  ✅ .env 文件存在');
  
  // 读取并验证环境变量
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredEnvVars = [
    'TIDB_HOST',
    'TIDB_PORT',
    'TIDB_USER',
    'TIDB_PASSWORD',
    'TIDB_DATABASE'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(`${envVar}=`) && !envContent.includes(`${envVar}=your_`)) {
      console.log(`  ✅ ${envVar} 已配置`);
    } else {
      console.log(`  ⚠️  ${envVar} 未配置或使用默认值`);
      hasWarnings = true;
    }
  });
} else {
  console.log('  ⚠️  .env 文件不存在（本地开发需要）');
  hasWarnings = true;
}

if (!fs.existsSync(envExamplePath)) {
  console.log('  ❌ .env.example 文件缺失');
  hasErrors = true;
}

// 3. 检查依赖包
console.log('\n📦 3. 检查依赖包...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const requiredDeps = [
    'react',
    'react-dom',
    'mysql2',
    '@vercel/node'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`  ✅ ${dep}`);
    } else {
      console.log(`  ❌ ${dep} - 依赖缺失`);
      hasErrors = true;
    }
  });
}

// 4. 检查 Vercel 配置
console.log('\n⚙️  4. 检查 Vercel 配置...');
const vercelJsonPath = path.join(__dirname, '..', 'vercel.json');
if (fs.existsSync(vercelJsonPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
  
  if (vercelConfig.buildCommand) {
    console.log(`  ✅ Build Command: ${vercelConfig.buildCommand}`);
  } else {
    console.log('  ⚠️  Build Command 未配置');
    hasWarnings = true;
  }
  
  if (vercelConfig.outputDirectory) {
    console.log(`  ✅ Output Directory: ${vercelConfig.outputDirectory}`);
  } else {
    console.log('  ⚠️  Output Directory 未配置');
    hasWarnings = true;
  }
  
  if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
    console.log(`  ✅ API Rewrites: ${vercelConfig.rewrites.length} 条规则`);
  } else {
    console.log('  ❌ API Rewrites 未配置');
    hasErrors = true;
  }
}

// 5. 检查 API 路由
console.log('\n🔌 5. 检查 API 路由..');
const apiIndexPath = path.join(__dirname, '..', 'api', 'index.ts');
if (fs.existsSync(apiIndexPath)) {
  const apiContent = fs.readFileSync(apiIndexPath, 'utf-8');
  
  if (apiContent.includes('export default')) {
    console.log('  ✅ API handler 已导出');
  } else {
    console.log('  ❌ API handler 未正确导出');
    hasErrors = true;
  }
  
  if (apiContent.includes('pool.getConnection')) {
    console.log('  ✅ 数据库连接池已配置');
  } else {
    console.log('  ⚠️  数据库连接池配置异常');
    hasWarnings = true;
  }
}

// 6. 检查前端构建配置
console.log('\n🏗️  6. 检查前端构建配置...');
const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteContent = fs.readFileSync(viteConfigPath, 'utf-8');
  
  if (viteContent.includes('outDir')) {
    console.log('  ✅ 输出目录已配置');
  } else {
    console.log('  ⚠️  输出目录未配置');
    hasWarnings = true;
  }
  
  if (viteContent.includes('proxy')) {
    console.log('  ✅ 开发代理已配置');
  } else {
    console.log('  ⚠️  开发代理未配置（生产环境不影响）');
  }
}

// 7. 检查 Git 仓库
console.log('\n📚 7. 检查 Git 仓库...');
const gitPath = path.join(__dirname, '..', '.git');
if (fs.existsSync(gitPath)) {
  console.log('  ✅ Git 仓库已初始化');
  
  // 检查 .gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    if (gitignoreContent.includes('.env') && gitignoreContent.includes('node_modules')) {
      console.log('  ✅ .gitignore 已正确配置');
    } else {
      console.log('  ⚠️  .gitignore 配置可能不完整');
      hasWarnings = true;
    }
  }
} else {
  console.log('  ⚠️  Git 仓库未初始化');
  console.log('     建议运行: git init');
  hasWarnings = true;
}

// 8. 提供部署建议
console.log('\n📋 8. 部署建议...');

// 总结
console.log('\n' + '='.repeat(50));
console.log('📊 检查总结\n');

if (!hasErrors && !hasWarnings) {
  console.log('✅ 所有检查通过！项目已准备好部署到 Vercel。');
  console.log('\n下一步操作:');
  console.log('1. 确保代码已推送到 GitHub');
  console.log('2. 访问 https://vercel.com/new');
  console.log('3. 导入您的 GitHub 仓库');
  console.log('4. 配置环境变量（参考 .env.example）');
  console.log('5. 点击 Deploy');
} else if (hasErrors) {
  console.log('❌ 发现 ' + (hasErrors ? '关键' : '') + '问题，请修复后再部署。');
  console.log('\n请参考以上错误信息进行修复。');
} else if (hasWarnings) {
  console.log('⚠️  发现一些警告，建议修复后部署。');
  console.log('这些警告不会阻止部署，但可能影响功能。');
}

console.log('\n📖 详细文档:');
console.log('- VERCEL_DEPLOYMENT.md - 完整部署指南');
console.log('- PROJECT_STATUS.md - 项目状态和优化建议');
console.log('- README.md - 项目文档');

console.log('\n' + '='.repeat(50));

// 返回适当的退出码
process.exit(hasErrors ? 1 : 0);
