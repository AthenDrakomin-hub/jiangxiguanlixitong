
# 江西酒店管理系统

一站式酒店餐饮服务管理系统，集成客房送餐、菜单管理、订单处理、财务统计等核心功能。

---

## 🚨 快速修复：连接失败与 404 问题

如果您的部署出现大量 404 或无法保存数据，请检查以下两项：

### 1. 绑定 Vercel KV (必须)
1. 登录 **Vercel Dashboard** -> 进入本项目。
2. 点击 **Storage** 标签 -> 点击 **Create Database** -> 选择 **KV**。
3. 创建完成后，Vercel 会自动注入 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN`。
4. **重要**：创建 KV 后需要点击 **Redeploy** 重新部署一次，环境变量才会生效。

### 2. 初始化房间数据 (Seed)
如果进入系统后发现没有房间（空白），请在浏览器控制台执行：
```javascript
fetch('/api/seed', { method: 'POST' }).then(res => res.json()).then(console.log)
```

---

## 🛠️ 技术架构
- **前端**: React 18 + Lucide Icons + Recharts
- **后端**: Vercel Edge Functions (API Gateway 模式)
- **数据库**: Upstash Redis (Vercel KV)
- **架构特点**: No-Build 极简部署，依赖通过 CDN (esm.sh) 加载

## 📁 环境变量配置
在 Vercel 项目的 `Settings -> Environment Variables` 中添加：

| 变量名 | 说明 | 示例 |
|-------|------|------|
| `VITE_ADMIN_USER` | 管理员账号 | admin |
| `VITE_ADMIN_PASS` | 管理员密码 | 您的密码 |
| `KV_REST_API_URL` | Redis 地址 | (绑定 KV 后自动生成) |
| `KV_REST_API_TOKEN` | Redis 令牌 | (绑定 KV 后自动生成) |

---

## 🏨 业务逻辑说明
- **房间号**: 系统自动生成 64 间房 (8201-8232, 8301-8332)。
- **点餐流程**: 扫码 -> 识别房号 -> 下单 -> 厨房自动出单。
- **财务系统**: 实时统计已支付订单，支持一键交班打印。

---
© 2025 江西酒店管理系统 - 生产就绪版
