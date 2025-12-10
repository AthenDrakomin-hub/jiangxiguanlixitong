# Vercel 部署指南

## 环境变量配置步骤

1. 登录 Vercel 控制台: https://vercel.com/dashboard
2. 进入您的项目
3. 点击 "Settings" -> "Environment Variables"
4. 添加以下环境变量:

```
TIDB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=qraob1XdQoegM6F.root
TIDB_PASSWORD=rZrxRtFz7wGOtZ0D
TIDB_DATABASE=fortune500
TIDB_SSL=true
```

5. 重新部署项目:
   - 回到 "Deployments" 页面
   - 点击 "Redeploy" 或触发新的部署

## 验证部署

部署完成后，访问以下URL验证:

1. 应用首页: https://your-project.vercel.app
2. API测试: https://your-project.vercel.app/api

## 常见问题

如果仍有数据库连接问题，请检查:
1. 环境变量名称是否完全匹配
2. TiDB Cloud 是否允许来自 Vercel 的连接
3. 网络防火墙设置