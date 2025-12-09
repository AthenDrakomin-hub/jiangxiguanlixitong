# 江西饭店管理系统部署检查清单

## 部署前准备

### 1. 环境变量配置
- [ ] `VITE_SUPABASE_URL` - Supabase项目URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase匿名密钥
- [ ] `VITE_ADMIN_USER` - 管理员用户名
- [ ] `VITE_ADMIN_PASS` - 管理员密码
- [ ] `VITE_STORAGE_TYPE` - 存储类型 (默认: supabase)

### 2. 数据库配置
- [ ] 创建Supabase项目
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
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
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

## 监控和日志

- [ ] 错误监控设置
- [ ] 性能监控配置
- [ ] 访问日志记录
- [ ] 数据库慢查询监控

## 备份策略

- [ ] 数据库定期备份
- [ ] 代码版本控制
- [ ] 配置文件备份
- [ ] 灾难恢复计划

## 测试清单

- [ ] 登录功能测试
- [ ] 菜单管理测试
- [ ] 订单处理测试
- [ ] KTV系统测试
- [ ] 客房服务测试
- [ ] 财务管理测试
- [ ] 库存管理测试
- [ ] 打印功能测试
- [ ] 移动端适配测试

## 故障排除

### 常见问题
1. **数据库连接失败**
   - 检查Supabase URL和密钥
   - 确认网络连接
   - 验证防火墙设置

2. **登录失败**
   - 检查管理员凭据
   - 确认环境变量配置
   - 查看控制台错误信息

3. **数据不显示**
   - 检查数据库表结构
   - 确认API调用
   - 验证权限设置

### 联系支持
如有问题，请联系技术支持团队。