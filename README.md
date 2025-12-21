# 江西酒店管理系统

<div align="center">

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://vercel.com)

</div>

## 📋 项目简介

江西酒店管理系统是一款专为酒店餐饮服务设计的全功能管理系统，支持客房送餐和餐厅点餐两种场景。系统采用现代化的前端技术栈，具备响应式设计，可在手机、平板、电脑等多种设备上使用。

### 核心功能

- **客房送餐服务**：通过房间专属二维码实现点餐溯源
- **菜单管理**：菜品信息维护、分类管理、库存跟踪
- **订单处理**：实时订单管理、状态跟踪、厨房显示
- **财务管理**：收支记录、多种支付方式支持
- **数据统计**：销售报表、经营数据分析

## 🛠 技术架构

### 前端技术栈

- React 18 (Hooks)
- TypeScript (严格类型检查)
- Vite 7 (构建工具)
- Tailwind CSS 3 (样式框架)
- React Context API (状态管理)
- Lucide React (图标库)
- Recharts (数据可视化)
- ESLint & Prettier (代码质量工具)

### 后端技术栈

- Vercel Serverless Functions
- RESTful API
- Vercel KV Storage (Upstash Redis)

## 📁 项目结构

```
jiangxijiudian/
├── api/                 # 后端 API 接口
│   ├── db.ts           # 数据库连接和操作
│   └── index.ts        # API 路由处理
├── components/         # React 前端组件
│   ├── App.tsx        # 主应用组件
│   ├── CustomerOrder.tsx # 客户点餐界面
│   ├── HotelSystem.tsx # 酒店客房管理
│   ├── KTVSystem.tsx   # KTV娱乐系统
│   ├── MenuManagement.tsx # 菜单管理
│   ├── OrderManagement.tsx # 订单管理
│   ├── PaymentManagement.tsx # 支付管理
│   ├── InventoryManagement.tsx # 库存管理
│   ├── FinanceSystem.tsx # 财务系统
│   ├── PermissionManagement.tsx # 权限管理
│   ├── SignBillSystem.tsx # 签单系统
│   ├── KitchenDisplay.tsx # 厨房显示
│   ├── Dashboard.tsx   # 仪表板
│   └── Settings.tsx   # 系统设置
├── hooks/              # React 自定义 Hooks
├── lib/                # 核心库文件
├── utils/              # 工具函数
├── scripts/            # 数据初始化脚本
├── public/             # 静态资源文件
├── config/             # 配置文件
├── __tests__/         # 测试文件
├── package.json       # 项目依赖配置
└── vite.config.ts     # 构建配置
```

## 🚀 部署指南

### 环境准备

1. 注册 [Vercel](https://vercel.com) 账号
2. 在 Vercel 项目设置中创建 KV Storage 数据库 (Upstash Redis)
3. 获取 `KV_REST_API_TOKEN` 和 `KV_REST_API_URL` 并配置到环境变量

### 环境变量配置

为了使数据库连接正常工作，您需要配置以下环境变量：

1. 复制 `.env.local.example` 文件并重命名为 `.env.local`：
   ```bash
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local` 文件，填入您的 Upstash Redis 凭据：
   ```bash
   KV_REST_API_URL=your_actual_upstash_redis_url_here
   KV_REST_API_TOKEN=your_actual_upstash_redis_token_here
   ```

3. 或者，您可以直接在系统环境中设置这些变量

### 验证数据库连接

您可以运行以下命令来检查数据库连接状态：
```bash
npm run check-db
```

1. Fork 本项目到您的 GitHub 账户
2. 在 Vercel 中导入该项目
3. 配置环境变量：
   ```
   KV_REST_API_TOKEN=your_kv_rest_api_token_here
   KV_REST_API_URL=your_kv_rest_api_url_here
   KV_REST_API_READ_ONLY_TOKEN=your_kv_read_only_token_here
   KV_URL=your_kv_url_here
   REDIS_URL=your_redis_url_here
   ```
4. 点击 Deploy 进行部署

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 初始化数据

```bash
# 添加示例数据到存储
npm run add-sample-data
```

### 域名配置

部署完成后，您需要配置自定义域名：

1. 在Vercel项目设置中添加您的域名
2. 按照Vercel提供的指示在您的域名注册商处配置DNS记录
3. 等待DNS传播完成（通常需要几分钟到几小时）

详细指南请参考 [DOMAIN_SETUP.md](../DOMAIN_SETUP.md)

## 📱 使用说明

### 管理后台

访问主域名即可进入管理后台，可进行菜单管理、订单处理、系统设置等操作。

### 客户点餐

客房客人可通过以下链接进行点餐：

```
https://your-domain.com/?location=8201
```

其中 `8201` 为房间号，有效房间号范围：

- 二楼：8201-8232
- 三楼：8301-8332

## ✅ 代码质量与安全

项目采用严格的代码质量标准和安全措施：

- TypeScript 严格模式，确保类型安全
- ESLint 代码检查，遵循 React 和 TypeScript 最佳实践
- Prettier 代码格式化，保证代码风格一致性
- Husky 和 lint-staged 实现 Git 提交前自动检查
- 定期安全审计和依赖更新

## 📦 可用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run add-sample-data # 添加示例数据
npm run check-db     # 检查数据库连接状态
npm run lint         # 运行 ESLint 检查
npm run lint:fix     # 运行 ESLint 并自动修复问题
npm run format       # 运行 Prettier 格式化代码
```

## 🛠 最近更新

### 修复 TypeScript 导入错误

- 修复了 `api/db.ts` 文件中的相对导入路径问题，现在正确使用 `.js` 文件扩展名
- 解决了在使用 ES 模块时出现的 TS2835 错误

## 🔧 系统要求

- Node.js 20.19+ 或 22.12+ (推荐使用最新LTS版本)
- npm 8.x 或更高版本
- 支持 ES Modules 的环境

## 📄 许可证

本项目为专有软件，版权所有。