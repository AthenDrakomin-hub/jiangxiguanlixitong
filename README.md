# 江西酒店管理系统

酒店餐饮服务管理系统，支持客房送餐、菜单管理、订单处理、财务管理。

## 技术架构

**No-Build + importmap 架构**

- 前端依赖通过 `importmap` 从 esm.sh CDN 加载
- Vite 仅用于 TSX 转译，不打包依赖
- 构建产物极小（主JS ~35KB gzip ~12KB）
- 部署于 Vercel 边缘网络

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 18 + TypeScript | 类型安全的组件化开发 |
| 样式 | Tailwind CSS (CDN) | 原子化 CSS，零构建 |
| 图标 | Lucide React | 现代化图标库 |
| 图表 | Recharts | 数据可视化 |
| 拖拽 | @dnd-kit | 拖拽排序 |
| HTTP | Axios | HTTP 客户端 |
| 后端 | Vercel Serverless (Edge Runtime) | 全球边缘计算 |
| 数据库 | **Upstash Redis** | **REST API for Edge** |

### 🚀 Upstash Redis - 边缘计算的完美选择

Upstash 是后端驱动型 UI 生态系统中的关键组成部分，特别适合 Vercel Edge Runtime：

**为什么选择 Upstash？**
- ✅ **REST-based API**：通过 HTTP 访问 Redis，完美兼容 Edge Functions
- ✅ **无 TCP 连接问题**：传统 Redis 需要长连接，在 Serverless 环境会超时
- ✅ **全球低延迟**：数据自动复制到多个区域
- ✅ **按需计费**：无需维护 Redis 服务器
- ✅ **Vercel 原生集成**：一键创建，环境变量自动注入

**技术对比：**
```typescript
// ❌ 传统 Redis（TCP 连接，Edge Runtime 不兼容）
import Redis from 'ioredis';
const redis = new Redis('redis://...');

// ✅ Upstash Redis（REST API，Edge Runtime 完美支持）
import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
```

**性能表现：**
- 平均响应时间：10-50ms（全球边缘节点）
- 冷启动：< 100ms
- 并发能力：自动扩展

## 项目结构

```
├── api/                 # Vercel Serverless API
├── components/          # React 组件
├── hooks/               # React Hooks
├── lib/                 # 核心库
├── services/            # 服务层
├── utils/               # 工具函数
├── src/                 # 配置
├── public/              # 静态资源
├── index.html           # 入口 + importmap
├── index.tsx            # React 入口
├── App.tsx              # 主组件
├── vercel.json          # Vercel 部署配置
└── vite.config.ts       # Vite 构建配置
```

## 开发命令

```bash
# 本地开发（需连接真实数据库）
vercel dev

# 构建
npm run build

# 预览
npm run preview
```

## 部署

### 1. 创建 Vercel KV 存储（Upstash Redis）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 **Storage** → **Create Database** → 选择 **KV**
4. Vercel 会自动创建 Upstash Redis 实例
5. 环境变量自动注入：
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL`

### 2. 配置其他环境变量

在 Vercel 项目设置中添加：
- `VITE_ADMIN_USER` - 管理员用户名
- `VITE_ADMIN_PASS` - 管理员密码

### 3. 推送部署

```bash
git push origin main
```

Vercel 会自动检测并构建部署。

### 4. 验证部署

访问 `https://your-app.vercel.app/api` 查看 KV 连接状态：
```json
{
  "success": true,
  "message": "Jiangxi Hotel Management System API",
  "kvStatus": {
    "connected": true,
    "hasUrl": true,
    "hasToken": true
  }
}
```

## 环境变量

复制 `.env.local.template` 为 `.env.local` 并填入实际值。

## 许可证

专有软件，版权所有。
