# 江西酒店管理系统 - 生产环境部署指南

## 概述

本文档提供江西酒店管理系统在生产环境中的部署说明，包括配置、安全设置、监控和维护指南。

## 环境要求

### 服务器要求
- Node.js 18+ (推荐 18.17.0 或更高版本)
- 支持 Vercel Edge Functions 的运行时环境
- HTTPS 支持（强制要求）
- CDN 访问权限（用于依赖加载）

### 数据库要求
- Neon PostgreSQL 数据库（推荐）
- 或内存数据库（开发测试用途）

## 环境变量配置

### 必需环境变量

```bash
# 数据库配置
DB_TYPE=neon                    # 生产环境使用 neon，开发环境可使用 memory
NEON_CONNECTION_STRING=your_neon_connection_string  # DB_TYPE=neon 时必需

# 管理员账户配置
VITE_ADMIN_USER=admin           # 管理员用户名
VITE_ADMIN_PASS=your_secure_password  # 管理员密码（建议使用强密码）

# 应用配置
VITE_APP_URL=https://www.jiangxijiudian.store/    # 应用正式域名
NODE_ENV=production             # 生产环境标识
```

### 可选环境变量

```bash
# 数据库连接池配置
NEON_POOL_MIN=2                 # 最小连接数
NEON_POOL_MAX=10                # 最大连接数

# 应用配置
VITE_MAINTENANCE_MODE=false     # 维护模式开关
VITE_LOG_LEVEL=info             # 日志级别: debug, info, warn, error
```

## Vercel 部署配置

### 项目设置

1. 在 Vercel 项目设置中添加以下环境变量：
   - `DB_TYPE`: `neon`
   - `NEON_CONNECTION_STRING`: 从 Neon 控制台获取
   - `VITE_ADMIN_USER`: 管理员用户名
   - `VITE_ADMIN_PASS`: 管理员密码
   - `NODE_ENV`: `production`

2. 构建设置：
   - 构建命令: `npm run build`
   - 输出目录: `dist`
   - 安装命令: `npm install`

### 配置文件示例 (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "vite.config.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html",
      "headers": {
        "Cache-Control": "public, max-age=3600"
      }
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

## 生产环境安全配置

### CORS 配置
- 所有 API 端点已配置为仅允许 `https://www.jiangxijiudian.store/` 访问
- 不再支持通配符 (*) 访问

### 认证配置
- 移除开发环境自动认证功能
- 所有环境强制使用正式认证流程
- 密码使用 SHA-256 哈希存储

### 数据库安全
- 使用加密连接到 Neon 数据库
- 实施数据验证和清理
- 定期备份策略

## 部署步骤

### 1. 准备阶段
```bash
# 克隆代码仓库
git clone your-repository-url
cd jiangxiguanlixitong

# 安装依赖
npm install
```

### 2. 环境配置
```bash
# 创建 .env.production 文件
cp .env.example .env.production

# 编辑环境变量
# 请确保设置了正确的生产环境变量
```

### 3. 构建应用
```bash
# 构建生产版本
npm run build

# 预览构建结果（可选）
npm run preview
```

### 4. 数据库初始化
```bash
# 初始化系统数据
npm run init:system

# 运行数据库迁移
npm run db:migrate
```

### 5. 部署到 Vercel
```bash
# 使用 Vercel CLI 部署
npx vercel --prod
```

## 部署后验证

### 功能验证
1. 访问应用首页，确认正常加载
2. 尝试登录管理后台
3. 测试基本功能（菜单管理、订单处理等）
4. 验证 API 端点响应

### 安全验证
1. 确认 HTTPS 正常工作
2. 验证 CORS 配置正确
3. 测试认证流程

### 性能验证
1. 检查页面加载速度
2. 验证 API 响应时间
3. 确认数据库连接正常

## 常见部署问题

### 数据库连接问题
- 确认 `NEON_CONNECTION_STRING` 配置正确
- 检查数据库防火墙设置
- 验证数据库用户权限

### 环境变量问题
- 确认所有必需环境变量已设置
- 检查变量名拼写是否正确
- 验证敏感信息是否正确加密

### CDN 依赖问题
- 确认 importmap 配置正确
- 检查 CDN 服务是否可用
- 验证依赖包版本兼容性

## 回滚策略

如遇部署问题，可执行以下步骤：
1. 使用 Vercel 控制台回滚到上一个稳定版本
2. 检查部署日志以确定问题原因
3. 修复问题后重新部署