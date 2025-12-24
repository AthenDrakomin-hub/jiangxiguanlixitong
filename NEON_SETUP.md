# Neon 数据库分支管理配置

本项目集成了 Neon 数据库的分支管理功能，通过 GitHub Actions 自动为每个 Pull Request 创建和删除数据库分支。

## 配置要求

### 0. 安装依赖

在项目根目录运行以下命令安装Neon数据库驱动：

```bash
npm install @neondatabase/serverless
```

### 1. Neon 项目设置

1. 在 [Neon 控制台](https://console.neon.tech/) 创建项目
2. 获取以下信息：
   - Project ID（在项目设置中找到）
   - API Key（在账户设置中生成）

### 2. GitHub 仓库设置

在 GitHub 仓库中设置以下变量和密钥：

#### GitHub Variables（Settings > Secrets and variables > Actions > Variables）：
- `NEON_PROJECT_ID`: 你的 Neon 项目 ID

#### GitHub Secrets（Settings > Secrets and variables > Actions > Secrets）：
- `NEON_API_KEY`: 你的 Neon API 密钥

## 工作流功能

### 自动创建分支
- 当 PR 被创建、重新打开或同步时，自动创建名为 `preview/pr-{PR_NUMBER}-{BRANCH_NAME}` 的 Neon 分支
- 分支会在 14 天后自动过期并删除

### 自动删除分支
- 当 PR 被关闭时，自动删除对应的 Neon 分支

## 项目集成

当前项目已经集成了对 Neon 数据库的支持：

1. **数据库抽象层**：通过 `DatabaseManager` 和 `DatabaseFactory` 支持多种数据库后端
2. **现代化设置界面**：在 `ModernSettings.tsx` 中提供 Neon 数据库配置选项
3. **API 端点**：`/api/db-config` 处理数据库配置和连接测试
4. **环境变量**：支持 `NEON_CONNECTION_STRING` 环境变量

## 使用方法

### 在开发环境中使用

1. 在 Neon 控制台获取连接字符串
2. 在应用的设置界面中选择 "Neon" 数据库类型
3. 输入连接字符串
4. 点击 "测试连接" 验证配置
5. 点击 "保存配置" 应用设置

### 环境变量配置

```bash
# 数据库类型
DB_TYPE=neon

# Neon 连接字符串
NEON_CONNECTION_STRING=postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
```

## 与 Vercel 部署集成

Neon 数据库与 Vercel 部署完美兼容：

1. **无服务器架构**：Neon 的无服务器 PostgreSQL 与 Vercel Edge Functions 无缝配合
2. **全球连接**：通过 Vercel 的全球边缘网络提供低延迟访问
3. **自动扩展**：Neon 数据库根据负载自动扩展，无需管理基础设施
4. **安全连接**：支持 SSL 加密连接，符合安全最佳实践

## 开发工作流

对于 Pull Request 开发：

1. 提交 PR 时，GitHub Actions 自动创建专用的 Neon 分支
2. 开发者可以在该分支上进行数据库相关的开发和测试
3. PR 合并或关闭时，对应的 Neon 分支自动删除

这样可以确保每个 PR 都有独立的数据库环境，避免开发冲突。

## 注意事项

1. 确保在 Neon 控制台设置了合适的配额限制
2. 敏感的数据库连接信息不应记录在日志中
3. 在生产环境中，建议使用专用的生产数据库分支
4. 定期监控和清理未使用的数据库分支