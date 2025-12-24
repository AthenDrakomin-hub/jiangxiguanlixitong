# Neon 数据库迁移指南

本指南介绍如何为酒店管理系统创建和配置 Neon 数据库。

## 1. 安装依赖

在项目根目录运行以下命令安装 Neon 数据库驱动：

```bash
npm install @neondatabase/serverless
```

## 2. 创建 Neon 数据库

1. 访问 [Neon 控制台](https://console.neon.tech/)
2. 创建新项目
3. 记下连接字符串，格式如下：
   ```
   postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
   ```

## 3. 运行数据库迁移

### 方法一：使用迁移脚本

```bash
# 设置连接字符串环境变量
export NEON_CONNECTION_STRING="postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require"

# 运行迁移脚本
npx tsx migrate-neon.ts
```

### 方法二：手动创建表

在 Neon SQL 编辑器中执行以下 SQL：

```sql
-- 创建键值存储表
CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store(key);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 kv_store 表创建更新时间触发器
DROP TRIGGER IF EXISTS update_kv_store_updated_at ON kv_store;

CREATE TRIGGER update_kv_store_updated_at 
  BEFORE UPDATE ON kv_store 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## 4. 配置应用

### 环境变量配置

```bash
# 设置数据库类型为 neon
DB_TYPE=neon

# 设置 Neon 连接字符串
NEON_CONNECTION_STRING=postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
```

### 在应用中配置

1. 访问应用的设置页面
2. 选择 "Neon" 数据库类型
3. 输入连接字符串
4. 点击 "测试连接" 验证配置
5. 点击 "保存配置" 应用设置

## 5. Vercel 部署配置

在 Vercel 项目设置中添加以下环境变量：

- `DB_TYPE=neon`
- `NEON_CONNECTION_STRING` (从 Neon 控制台获取)

## 6. 开发工作流

对于 Pull Request 环境，GitHub Actions 会自动为每个 PR 创建独立的 Neon 分支：

1. 提交 PR 时，自动创建名为 `preview/pr-{PR_NUMBER}-{BRANCH_NAME}` 的 Neon 分支
2. 分支会在 14 天后自动过期并删除
3. PR 关闭时，自动删除对应的 Neon 分支

## 7. 故障排除

### 连接问题

- 确保连接字符串格式正确
- 检查防火墙设置（Neon 默认允许所有 IP）
- 验证用户名和密码是否正确

### 权限问题

- 确保数据库用户有足够的权限创建表和执行查询
- 检查 Neon 项目中的角色权限设置

### 性能问题

- 考虑使用连接池端点（pooler）以获得更好的性能
- 监控查询执行时间，必要时添加更多索引

## 8. 安全建议

- 不要在代码中硬编码连接字符串
- 使用环境变量或 Vercel 的密钥管理功能
- 定期轮换数据库密码
- 使用 SSL 连接（Neon 默认启用）