# 江西酒店管理系统

酒店餐饮服务管理系统，支持客房送餐、菜单管理、订单处理、财务管理。

## 技术架构

**No-Build + importmap 架构**

- 前端依赖通过 `importmap` 从 esm.sh CDN 加载
- Vite 仅用于 TSX 转译，不打包依赖
- 构建产物极小（主JS ~35KB gzip ~12KB）
- 部署于 Vercel 边缘网络

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 样式 | Tailwind CSS (CDN) |
| 图标 | Lucide React |
| 图表 | Recharts |
| 拖拽 | @dnd-kit |
| HTTP | Axios |
| 后端 | Vercel Serverless Functions |
| 数据库 | Upstash Redis |

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

### 1. 创建 Vercel KV 存储

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 **Storage** 标签
4. 点击 **Create Database** → 选择 **KV**
5. 输入数据库名称（如 `hotel-kv`）并选择区域
6. 点击 **Create**

### 2. 关联 KV 到项目

创建 KV 后，Vercel 会自动将以下环境变量注入到项目：
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

**重要**：这些变量会自动注入到 Serverless API 运行时，无需手动配置。

### 3. 配置管理员凭证

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_ADMIN_USER` | 管理员用户名 | `admin` |
| `VITE_ADMIN_PASS` | 管理员密码 | `your_secure_password` |

### 4. 部署项目

推送代码到 GitHub，Vercel 会自动检测并构建部署。

## 环境变量

复制 `.env.local.template` 为 `.env.local` 并填入实际值。

## API 接口

### 技术栈统计 API

**端点**: `/api/stats`

#### GET - 获取统计数据

```bash
GET /api/stats
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "techId": "react",
      "likes": 42,
      "views": 156
    },
    {
      "techId": "typescript",
      "likes": 38,
      "views": 142
    }
  ],
  "timestamp": "2025-12-22T09:00:00.000Z"
}
```

#### POST - 更新统计数据

```bash
POST /api/stats
Content-Type: application/json

{
  "techId": "react",
  "action": "like"  // 或 "view"
}
```

**支持的技术栈 ID**:
- `react` - React 18
- `typescript` - TypeScript
- `vite` - Vite
- `tailwind` - Tailwind CSS
- `vercel` - Vercel
- `upstash-redis` - Upstash Redis
- `recharts` - Recharts
- `lucide-react` - Lucide Icons
- `dnd-kit` - DnD Kit

**响应示例**:
```json
{
  "success": true,
  "data": {
    "techId": "react",
    "likes": 43,
    "views": 156
  },
  "message": "Successfully updated like count for react"
}
```

## 许可证

专有软件，版权所有。
