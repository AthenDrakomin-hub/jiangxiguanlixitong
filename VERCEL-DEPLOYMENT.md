# 部署到Vercel生产环境

## 环境配置

### 环境变量设置
在 Vercel 项目的 `Settings -> Environment Variables` 中添加：

| 变量名 | 说明 | 示例 |
|-------|------|------|
| `VITE_ADMIN_USER` | 管理员账号 | admin |
| `VITE_ADMIN_PASS` | 管理员密码 | 您的强密码 |
| `DB_TYPE` | 数据库类型 (memory, neon) | neon (生产环境) |
| `NEON_CONNECTION_STRING` | Neon数据库连接字符串 (当DB_TYPE=neon时) | `postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require` |
| `VITE_APP_URL` | 应用URL，用于二维码生成 (可选) | https://your-app.vercel.app |

## 部署步骤

### 1. 部署到Vercel
1. 在GitHub中创建新仓库并推送代码
2. 在Vercel中导入项目
3. 设置环境变量
4. 部署应用

### 2. 初始化生产数据
部署完成后：
1. 访问系统设置面板
2. 点击"状态检查"确认数据库连接正常
3. 点击"初始化系统数据"创建基础数据（需要认证）

### 3. 数据验证
- 系统将自动创建以下数据表和初始数据：
  - 酒店房间：64个房间（8201-8232, 8301-8332）
  - KTV房间：1个房间
  - 菜品：8个示例菜品
  - 支付方式：5种支付方式
  - 库存：5个库存项目
  - 签单账户：2个示例账户
  - 系统设置：默认配置

## 数据库切换

### 从内存数据库切换到Neon数据库
1. 更新环境变量 `DB_TYPE=neon`
2. 重启应用
3. 运行数据迁移（如果需要从现有内存数据迁移）

### 数据迁移
如果需要从内存数据库迁移到Neon数据库：
1. 确保Neon连接字符串正确配置
2. 调用 `/api/migrate` 端点（需要认证）
3. 确认数据迁移成功

## 安全注意事项
- 生产环境务必使用强密码
- 定期备份数据库
- 监控API访问日志
- 使用HTTPS连接

## 运维操作
- 数据同步：通过设置面板一键同步
- 数据备份：自动关联Git Commit Hash
- 操作审计：记录所有敏感操作
- 状态监控：实时检查数据库连接状态