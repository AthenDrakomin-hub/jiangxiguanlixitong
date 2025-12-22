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

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量：
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `VITE_ADMIN_USER`
   - `VITE_ADMIN_PASS`
4. 自动部署

## 环境变量

复制 `.env.local.template` 为 `.env.local` 并填入实际值。

## 许可证

专有软件，版权所有。
