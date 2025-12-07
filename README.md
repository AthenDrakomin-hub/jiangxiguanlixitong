# 江西饭店管理系统 (Jiangxi Hotel Management System)

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Powered by Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?logo=google-bard)](https://deepmind.google/technologies/gemini/)

专为菲律宾（Pasay City）华人酒店打造的综合管理后台。集成了餐饮点餐、KTV 包厢管理、客房送餐、超市零售、用车调度及财务库存管理于一体的全业务生态系统。

支持 **中英双语 (Bilingual)** 界面与 **多币种 (RMB/PHP)** 结算，适配海外经营环境。

## ✨ 核心功能 (Core Features)

### 🏨 多业态管理
*   **餐饮中控 (Dining)**: 大厅点餐、外卖接单，支持小票打印与后厨流转。
*   **KTV 智能系统**: 包厢状态管理（空闲/使用/清洁）、计时计费、酒水点单、模拟播控。
*   **客房服务 (Room Service)**: 2F/3F 楼层视图，直观查看房态与挂账点餐。
*   **超市零售 (Retail POS)**: 独立的一楼超市收银系统，支持条码扫描与独立库存。
*   **用车调度 (Car Service)**: 接送机行程安排、司机调度与费用记录。

### 🚀 运营与效率
*   **H5 顾客端**: 顾客扫码即可进入手机点餐界面（类 App 体验），自动识别桌号/房号。
*   **KDS 后厨显示**: 厨师专用看板，实时同步订单状态（待制作 -> 烹饪中 -> 出餐）。
*   **二维码中心**: 一键生成所有房间、桌台及外卖的专属二维码，支持批量打印。
*   **AI 智能菜单**: 集成 Google Gemini，自动生成菜品描述、翻译及定价建议。

### 💰 财务与库存
*   **本地化财务**: 支持 **10% 服务费** 自动计算，实时 **RMB/PHP 汇率** 换算。
*   **全渠道支付**: 聚合现金、支付宝、微信、USDT、GCash、Maya 等多种支付方式。
*   **签单挂账**: 协议单位/VIP 客户信用额度管理、记账与周期结算。
*   **BOM 库存联动**: 菜品与食材配方绑定（如：点一份牛肉，自动扣减 0.2kg 库存）。
*   **交接班报表**: 一键生成当班营收汇总，按支付渠道对账。

## 🛠 技术栈 (Tech Stack)

*   **前端框架**: React 18 + TypeScript
*   **构建工具**: Vite
*   **UI 框架**: Tailwind CSS + Lucide Icons
*   **图表库**: Recharts (数据可视化)
*   **拖拽库**: @dnd-kit (菜单排序)
*   **AI SDK**: @google/genai (Gemini 2.5 Flash)
*   **数据持久化**: 
    *   **Local**: 浏览器 LocalStorage (默认)
    *   **Cloud**: GitHub Repository (作为数据库) 或 AWS S3

## 🚀 快速开始 (Getting Started)

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件（可选，用于 AI 功能）：

```env
API_KEY=your_google_gemini_api_key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 即可查看系统。

## 💾 数据存储配置 (Data Persistence)

本项目采用 **Serverless / Backend-less** 架构。虽然是纯前端应用，但支持强大的数据持久化方案。

进入 **系统设置 (Settings)** -> **数据源 (Data Source)** 进行配置：

1.  **Local (默认)**: 数据保存在当前浏览器的 IndexedDB/LocalStorage 中。适用于单机测试，清除缓存会丢失数据。
2.  **GitHub Storage (推荐)**:
    *   利用 GitHub API 将数据以 JSON 文件形式存储在您的私有仓库中。
    *   实现“零成本”云端数据库，支持多设备同步。
    *   配置：需填写 `Owner` (用户名), `Repo` (仓库名), `Branch`, `Token` (PAT)。
3.  **S3 Cloud**: 支持 AWS S3 或兼容 MinIO 的对象存储。

## 📱 移动端与 H5

*   **管理端**: 响应式设计，支持手机/平板操作。侧边栏在移动端自动折叠。
*   **顾客端**: 访问 `/?page=customer` 或扫描生成的二维码进入沉浸式点餐模式。
*   **KDS 端**: 访问 `/?page=kitchen` 进入大屏厨显模式。

## 📂 项目结构

```
src/
├── components/        # 业务组件
│   ├── CustomerOrder.tsx  # H5 顾客端
│   ├── KTVSystem.tsx      # KTV 模块
│   ├── HotelSystem.tsx    # 客房模块
│   ├── SupermarketSystem.tsx # 超市 POS
│   ├── KitchenDisplay.tsx # 后厨 KDS
│   └── ...
├── services/          # 业务逻辑服务
│   ├── api.ts         # 统一数据接口
│   ├── storage.ts     # GitHub/S3 适配器
│   └── mockData.ts    # 初始模拟数据
├── types.ts           # TypeScript 类型定义
└── App.tsx            # 主应用入口与路由
```

## 🌍 本地化适配 (Localization)

针对菲律宾市场特别优化：
*   **语言**: 关键操作全双语标注 (中文/English)。
*   **客房**: 自动过滤带 "4" 的房号。
*   **支付**: 集成 GCash, Maya, USDT 选项。

## 📄 License

MIT License