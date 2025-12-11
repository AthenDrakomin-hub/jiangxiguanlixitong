# 江西酒店管理系统 (Blob Storage 版本)

## 📋 项目介绍

这是一个**前后端一体化**的酒店管理系统：
- **前端**：React 18 + TypeScript + Vite 构建的单页应用 (SPA)
- **后端**：Vercel Serverless Functions 提供 RESTful API
- **数据存储**：Vercel Blob Storage（对象存储）
- **部署**：Vercel 一键部署，支持 PWA 安装到桌面

## ✨ 核心功能

### 🍽️ 餐饮管理
- 菜单管理（图片、价格、分类、辣度标识）
- 实时下单系统（支持多人同时点餐）
- 厨房显示屏（实时显示订单状态）
- 桌号二维码生成（扫码点餐）

### 🏨 酒店管理
- 客房状态管理（入住、清洁、维修等）
- KTV包房预订系统
- 挂账账户管理

### 💰 财务系统
- 收支明细记录
- 多种支付方式（现金、移动支付、加密货币等）
- 日/月/年财务报表
- 数据导出为 CSV

### 📦 库存管理
- 商品入库/出库
- 库存预警提醒
- 采购清单生成

### ⚙️ 系统特性
- 响应式设计（支持手机、平板、电脑）
- 深色模式适配
- PWA 支持（可安装到桌面）
- 多语言支持（中英切换）

## 🧱 技术架构

### 前端技术栈
- **框架**：React 18 (Hooks)
- **语言**：TypeScript
- **构建工具**：Vite 5
- **样式**：Tailwind CSS 3 + PostCSS
- **状态管理**：React Context API
- **UI 组件**：Lucide React（图标）、Recharts（图表）
- **模块规范**：ES Module（`"type": "module"`）
- **PWA**：vite-plugin-pwa（支持桌面安装）

### 后端技术栈
- **运行环境**：Vercel Serverless Functions (Node.js)
- **API 风格**：RESTful API
- **数据存储**：Vercel Blob Storage（对象存储）
- **存储驱动**：@vercel/blob

### 项目结构说明

```
jiangxiguanlixitong/
├── api/                    # 后端 API (Vercel Serverless Functions)
│   ├── db.ts              # Blob Storage 客户端
│   └── index.ts           # API 路由处理器
├── components/            # React 组件
│   ├── App.tsx           # 主应用（后台管理界面）
│   ├── CustomerOrder.tsx # H5 点餐页面
│   ├── HotelSystem.tsx   # 酒店客房模块
│   └── ...
├── scripts/               # 数据迁移和示例数据脚本
├── vite.config.ts        # Vite 构建配置
├── package.json          # 依赖管理（"type": "module"）
└── tsconfig.app.json     # TypeScript 配置（"module": "ESNext"）
```

**重要说明**：
- `api/` 文件夹是 **Vercel 后端 API**，运行在 Node.js 服务器端
- 其他代码是 **前端应用**，运行在浏览器
- Vercel 部署时会自动识别并分别处理前后端代码

## 🚀 快速开始

### 1. 准备 Vercel Blob Storage

1. 访问 [Vercel](https://vercel.com) 创建账号
2. 在项目设置中创建 Blob Storage 存储桶
3. 获取 `BLOB_READ_WRITE_TOKEN`

### 2. Vercel 一键部署

1. Fork 本项目到您的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：

   ```
   BLOB_READ_WRITE_TOKEN=your_blob_read_write_token_here
   ```

4. 点击 Deploy

### 3. 添加示例数据

```bash
# 添加示例数据到 Vercel Blob Storage
npm run add-sample-data
```

### 4. 本地开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

## 📦 可用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run add-sample-data # 添加示例数据
npm run migrate-data # 从现有数据库迁移数据（如果适用）
```

## 🌐 访问方式

- **后台管理**：`https://your-domain.com`
- **H5 点餐页面**：`https://your-domain.com/?location=8201`（桌号 8201）
- **API 接口**：`https://your-domain.com/api/dishes`

## 📄 许可证

本项目为专有软件，版权所有。