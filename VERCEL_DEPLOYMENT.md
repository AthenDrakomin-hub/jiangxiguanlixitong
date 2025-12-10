# 🚀 Vercel 部署完整指南

## ✅ 部署前检查清单

### 1. TiDB Cloud 数据库准备

- [ ] 已在 [TiDB Cloud](https://tidbcloud.com) 创建账号
- [ ] 已创建 TiDB Serverless 集群
- [ ] 已创建数据库 `fortune500`
- [ ] 已获取数据库连接信息：
  - Host（主机地址）
  - Port（端口，通常是 4000）
  - User（用户名）
  - Password（密码）
- [ ] 已执行数据库初始化脚本 `scripts/init-database.sql`

### 2. GitHub 仓库准备

- [ ] 代码已推送到 GitHub
- [ ] 仓库设置为 Public 或已授权 Vercel 访问

### 3. Vercel 部署配置

#### 步骤 1: 导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 选择您的 GitHub 仓库 `jiangxiguanlixitong`

#### 步骤 2: 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `TIDB_HOST` | 您的 TiDB 主机地址 | 从 TiDB Cloud 控制台获取 |
| `TIDB_PORT` | `4000` | TiDB 默认端口 |
| `TIDB_USER` | 您的 TiDB 用户名 | 从 TiDB Cloud 控制台获取 |
| `TIDB_PASSWORD` | 您的 TiDB 密码 | 从 TiDB Cloud 控制台获取 |
| `TIDB_DATABASE` | `fortune500` | 数据库名称 |
| `TIDB_SSL` | `true` | 启用 SSL 连接 |
| `VITE_ADMIN_USER` | `admin` | （可选）管理员用户名 |
| `VITE_ADMIN_PASS` | `your_password` | （可选）管理员密码 |

#### 步骤 3: 部署设置

- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### 步骤 4: 点击 Deploy

等待部署完成（通常需要 2-3 分钟）

## 🔧 部署后验证

### 1. 检查 API 连接

访问: `https://your-app.vercel.app/api/`

应该看到类似输出：
```json
{
  "message": "江西酒店管理系统API服务",
  "status": "running",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ"
}
```

### 2. 检查数据库连接

访问: `https://your-app.vercel.app/api/dishes`

应该看到菜品数据（如果数据库中有数据）

### 3. 检查前端页面

访问: `https://your-app.vercel.app/`

应该能正常加载管理系统界面

## ❌ 常见问题排查

### 问题 1: API 500 错误

**症状**: 访问 `/api/dishes` 返回 500 错误

**解决方案**:
1. 检查 Vercel 日志中的错误信息
2. 确认所有数据库环境变量已正确设置
3. 确认 TiDB 数据库已初始化表结构
4. 检查 TiDB Cloud 的 IP 白名单设置（如果有）

### 问题 2: 数据库连接失败

**症状**: `Database configuration error` 或连接超时

**解决方案**:
1. 验证 TiDB Cloud 连接信息是否正确
2. 确认 `TIDB_SSL=true` 已设置
3. 检查 TiDB 集群状态是否正常
4. 尝试使用 TiDB Cloud 提供的连接字符串

### 问题 3: 前端页面空白

**症状**: 访问首页显示空白页面

**解决方案**:
1. 检查浏览器控制台错误
2. 确认 `dist` 目录已正确生成
3. 重新触发部署: `git commit --allow-empty -m "redeploy"`
4. 检查 Vercel 构建日志

### 问题 4: API 路由 404

**症状**: `/api/*` 路径返回 404

**解决方案**:
1. 确认 `vercel.json` 配置正确
2. 确认 `api/index.ts` 文件存在
3. 重新部署项目

## 🔄 数据库初始化

如果数据库表未初始化，请按以下步骤操作：

### 方法 1: TiDB Cloud 控制台

1. 登录 TiDB Cloud
2. 进入您的集群
3. 打开 SQL Editor
4. 复制 `scripts/init-database.sql` 的内容
5. 执行 SQL 脚本

### 方法 2: 本地初始化（推荐）

```bash
# 1. 克隆项目到本地
git clone https://github.com/your-username/jiangxiguanlixitong.git
cd jiangxiguanlixitong

# 2. 安装依赖
npm install

# 3. 创建 .env 文件
cp .env.example .env

# 4. 编辑 .env 文件，填写 TiDB 连接信息
# nano .env  # 或使用其他编辑器

# 5. 运行数据库初始化脚本
node scripts/init-db.js
```

## 📊 监控和维护

### Vercel 日志查看

1. 访问 Vercel Dashboard
2. 选择您的项目
3. 点击 "Functions" 标签
4. 查看实时日志和错误信息

### TiDB 监控

1. 登录 TiDB Cloud
2. 进入集群详情
3. 查看 Metrics 标签：
   - QPS（每秒查询数）
   - 连接数
   - 存储使用情况

## 🎉 完成！

如果所有检查都通过，恭喜您已成功将江西酒店管理系统部署到生产环境！

- 生产环境 URL: `https://your-app.vercel.app`
- 管理后台: `https://your-app.vercel.app`
- 客户点餐页面: `https://your-app.vercel.app/?page=customer`
- 厨房显示屏: `https://your-app.vercel.app/?page=kitchen`

## 📞 技术支持

如遇到问题，请：
1. 检查 Vercel 部署日志
2. 查看 TiDB Cloud 监控
3. 提交 GitHub Issue 并附上错误信息
