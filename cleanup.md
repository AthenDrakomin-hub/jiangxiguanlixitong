# 清理任务清单

## 需要清理的文件和配置

### 1. 数据库相关文件
- [ ] 删除 TiDB 配置文件
- [ ] 删除数据库初始化脚本
- [ ] 删除数据库检查脚本

### 2. 环境配置文件
- [ ] 更新 .env.example
- [ ] 更新 .env.local

### 3. 包配置
- [ ] 更新 package.json（移除 mysql2 依赖）

### 4. 文档更新
- [ ] 更新 README.md
- [ ] 更新部署指南

## 清理步骤

### 第一步：清理数据库相关文件
1. 删除以下文件：
   - scripts/init-db.js
   - scripts/check-data.js
   - scripts/check-tables.js
   - scripts/init-database.sql
   - scripts/import-menu-data.cjs
   - scripts/init-db-via-api.js

### 第二步：更新环境配置文件
1. 更新 .env.example
2. 更新 .env.local

### 第三步：更新包配置
1. 更新 package.json，移除 mysql2 依赖

### 第四步：更新文档
1. 更新 README.md
2. 更新 VERCEL_DEPLOYMENT_GUIDE.md