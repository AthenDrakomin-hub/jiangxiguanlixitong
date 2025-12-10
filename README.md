# 江西酒店管理系统

专为海外华人酒店设计的全栈 SaaS 管理系统，集成餐饮点单、客房管理、KTV 预订、财务管理等功能。

## 📋 项目介绍

这是一个**前后端一体化**的酒店管理系统：
- **前端**：React 18 + TypeScript + Vite 构建的单页应用 (SPA)
- **后端**：Vercel Serverless Functions 提供 RESTful API
- **数据库**：TiDB Cloud（MySQL 兼容的云数据库）
- **部署**：Vercel 一键部署，支持 PWA 安装到桌面

## ✨ 核心功能

### 🍽️ 餐饮管理
- 菜单管理（图片、价格、分类、辣度标识）
- 桌边点单（扫码点餐 H5 页面，支持中文/菲律宾语）
- 后厨显示屏（实时接收订单）
- 订单状态追踪（待处理 → 制作中 → 已完成 → 已支付）

### 🏨 客房管理
- 房间状态（空闲/已入住）
- 客房送餐（从房间直接下单到餐厅）
- 入住登记与退房管理

### 🎵 KTV 预订
- 包厢管理（小型/中型/豪华包厢）
- 按小时计费
- 预订时段管理

### 💰 财务管理
- 多种支付方式（现金、GCash、Maya、支付宝、微信、USDT）
- 协议挂账（企业/VIP 客户信用额度管理）
- 交班报表（Shift Report）

## 🛠️ 技术架构

### 前端技术栈
- **框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **样式**：Tailwind CSS
- **UI 组件**：Lucide React（图标）、Recharts（图表）
- **模块规范**：ES Module（`"type": "module"`）
- **PWA**：vite-plugin-pwa（支持桌面安装）

### 后端技术栈
- **运行环境**：Vercel Serverless Functions (Node.js)
- **API 风格**：RESTful API
- **数据库**：TiDB Cloud（MySQL 兼容）
- **数据库驱动**：mysql2/promise

### 项目结构说明

```
jiangxiguanlixitong/
├── api/                    # 后端 API (Vercel Serverless Functions)
│   ├── db.ts              # 数据库连接池
│   └── index.ts           # API 路由处理器
├── components/            # React 组件
│   ├── App.tsx           # 主应用（后台管理界面）
│   ├── CustomerOrder.tsx # H5 点餐页面
│   ├── HotelSystem.tsx   # 酒店客房模块
│   └── ...
├── scripts/               # 数据库初始化脚本
├── vite.config.ts        # Vite 构建配置
├── package.json          # 依赖管理（"type": "module"）
└── tsconfig.app.json     # TypeScript 配置（"module": "ESNext"）
```

**重要说明**：
- `api/` 文件夹是 **Vercel 后端 API**，运行在 Node.js 服务器端
- 其他代码是 **前端应用**，运行在浏览器
- Vercel 部署时会自动识别并分别处理前后端代码

## 🚀 快速开始

### 1. 准备 TiDB Cloud 数据库

1. 访问 [TiDB Cloud](https://tidbcloud.com) 创建免费集群
2. 创建数据库：`fortune500`
3. 获取连接信息（Host、Port、User、Password）

### 2. Vercel 一键部署

1. Fork 本项目到您的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：

   ```
   TIDB_HOST=gateway01.xxx.prod.aws.tidbcloud.com
   TIDB_PORT=4000
   TIDB_USER=你的用户名
   TIDB_PASSWORD=你的密码
   TIDB_DATABASE=fortune500
   TIDB_SSL=true
   ```

4. 点击 Deploy

### 3. 初始化数据库

```bash
# 克隆项目
git clone https://github.com/your-username/jiangxiguanlixitong.git
cd jiangxiguanlixitong

# 安装依赖
npm install

# 创建 .env.local 文件，填写 TiDB 连接信息
cp .env.example .env.local

# 运行初始化脚本
node scripts/init-db.js
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
npm run init-db      # 初始化数据库
```

## 🌐 访问方式

- **后台管理**：`https://your-domain.com`
- **H5 点餐页面**：`https://your-domain.com/?location=8201`（桌号 8201）
- **API 接口**：`https://your-domain.com/api/menu_items`

## 📄 许可证

本项目为专有软件，版权所有。