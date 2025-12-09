# 江西酒店管理系统部署检查清单

## 部署前准备

### 1. 环境变量配置
- [ ] `TIDB_HOST` - TiDB Cloud 主机地址
- [ ] `TIDB_PORT` - TiDB Cloud 端口 (默认: 4000)
- [ ] `TIDB_USER` - TiDB 用户名
- [ ] `TIDB_PASSWORD` - TiDB 密码
- [ ] `TIDB_DATABASE` - TiDB 数据库名
- [ ] `TIDB_SSL` - 是否启用 SSL (true/false)
- [ ] `VITE_ADMIN_USER` - 管理员用户名
- [ ] `VITE_ADMIN_PASS` - 管理员密码

### 2. 数据库配置
- [ ] 创建 TiDB Cloud 项目
- [ ] 配置数据库表结构
- [ ] 设置数据库权限
- [ ] 初始化基础数据

### 3. 依赖检查
- [ ] Node.js 版本 >= 18
- [ ] npm 或 yarn 安装依赖
- [ ] TypeScript 编译通过

## 部署步骤

### 1. 代码准备
```bash
# 克隆代码库
git clone [repo-url]
cd jiangxi-hotel-admin

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 2. 环境配置
创建 `.env.production` 文件:
```
TIDB_HOST=your_tidb_host
TIDB_PORT=4000
TIDB_USER=your_tidb_user
TIDB_PASSWORD=your_tidb_password
TIDB_DATABASE=your_tidb_database
TIDB_SSL=true
VITE_ADMIN_USER=your_admin_username
VITE_ADMIN_PASS=your_admin_password
```

### 3. 部署到Vercel
1. 登录[Vercel](https://vercel.com)
2. 导入Git仓库
3. 配置环境变量
4. 部署应用

### 4. 数据库初始化
1. 运行数据库迁移脚本
2. 初始化菜单数据
3. 配置KTV包厢信息
4. 设置客房信息

## 安全检查

- [ ] HTTPS证书配置
- [ ] CORS策略设置
- [ ] 管理员凭据强度检查
- [ ] 数据库连接安全
- [ ] API访问限制

## 性能优化

- [ ] 启用gzip压缩
- [ ] 静态资源缓存策略
- [ ] CDN配置
- [ ] 图片优化
- [ ] 代码分割检查

## 生产环境验证清单

### 1. 功能验证
- [ ] 前端页面正常加载
- [ ] 后端API接口响应正常
- [ ] 数据库连接正常
- [ ] 用户认证功能正常
- [ ] 所有业务模块功能正常

### 2. 性能验证
- [ ] 页面加载速度符合预期
- [ ] API响应时间在可接受范围内
- [ ] 数据库查询性能良好
- [ ] 并发访问能力测试

### 3. 安全验证
- [ ] HTTPS加密正常工作
- [ ] 管理员登录安全
- [ ] 敏感信息不泄露
- [ ] 输入验证和防护措施有效

### 4. 监控和日志
- [ ] 错误日志记录正常
- [ ] 性能监控已配置
- [ ] 数据库连接池监控
- [ ] 用户行为跟踪（如需要）

## 回滚计划

### 1. 回滚触发条件
- [ ] 严重功能缺陷影响用户使用
- [ ] 性能问题导致系统不可用
- [ ] 安全漏洞被发现
- [ ] 数据丢失或损坏

### 2. 回滚步骤
1. 立即在Vercel中回滚到上一个稳定版本
2. 通知相关人员系统已回滚
3. 分析问题原因并修复
4. 在测试环境中验证修复
5. 准备新的部署版本

## 灾难恢复计划

### 1. 数据备份
- [ ] 定期备份TiDB数据库
- [ ] 备份重要配置文件
- [ ] 版本控制系统完整历史记录

### 2. 恢复步骤
1. 从备份中恢复数据库
2. 恢复配置文件
3. 重新部署应用程序
4. 验证系统功能恢复正常