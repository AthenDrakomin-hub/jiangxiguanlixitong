# 江西酒店餐厅管理系统

## 📋 项目简介

江西酒店餐厅管理系统是一个专为酒店餐饮服务设计的综合管理系统，支持客房送餐和餐厅点餐两种场景。系统采用现代化的前后端技术栈构建，具有响应式设计，可在各种设备上良好运行。

### 核心功能
- **客房送餐服务**：通过房间专属二维码实现点餐溯源
- **菜单管理**：菜品信息维护、分类管理、库存跟踪
- **订单处理**：实时订单管理、状态跟踪、厨房显示
- **财务管理**：收支记录、多种支付方式支持
- **数据统计**：销售报表、经营数据分析

## 🛠 技术架构

### 前端技术栈
- **框架**：React 18 (Hooks)
- **语言**：TypeScript
- **构建工具**：Vite 5
- **样式**：Tailwind CSS 3
- **状态管理**：React Context API
- **图标库**：Lucide React

### 后端技术栈
- **运行环境**：Vercel Serverless Functions
- **API 风格**：RESTful API
- **数据存储**：Vercel Blob Storage
- **存储驱动**：@vercel/blob

### 开发规范
- **模块规范**：ES Module（`"type": "module"`）
- **TypeScript 配置**：严格类型检查
- **代码质量**：遵循最佳实践，无未使用变量/导入警告

## 📁 项目结构

```
jiangxiguanlixitong/
├── api/                 # 后端 API 接口
│   ├── db.ts           # 数据库连接和操作
│   └── index.ts        # API 路由处理
├── components/         # React 前端组件
│   ├── App.tsx        # 主应用组件
│   ├── CustomerOrder.tsx # 客户点餐界面
│   ├── HotelSystem.tsx # 酒店客房管理
│   ├── MenuManagement.tsx # 菜单管理
│   ├── OrderManagement.tsx # 订单管理
│   └── Settings.tsx   # 系统设置
├── scripts/            # 数据初始化脚本
├── services/           # 业务逻辑层
├── utils/              # 工具函数
├── public/             # 静态资源文件
├── package.json       # 项目依赖配置
└── vite.config.ts     # 构建配置
```

## 🚀 部署指南

### 环境准备
1. 注册 [Vercel](https://vercel.com) 账号
2. 在 Vercel 项目设置中创建 Blob Storage 存储桶
3. 获取 `BLOB_READ_WRITE_TOKEN` 并配置到环境变量

### 部署步骤
1. Fork 本项目到您的 GitHub 账户
2. 在 Vercel 中导入该项目
3. 配置环境变量：
   ```
   BLOB_READ_WRITE_TOKEN=your_blob_read_write_token_here
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

## 📦 可用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run add-sample-data # 添加示例数据
```

## 🔧 系统要求

- Node.js 18.x 或更高版本
- npm 8.x 或更高版本
- 支持 ES Modules 的环境

## 📄 许可证

本项目为专有软件，版权所有。