# 江西饭店管理系统 (Jiangxi Hotel Management System)

![Version](https://img.shields.io/badge/Version-2.0-blue)
![Status](https://img.shields.io/badge/Status-Production-green)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20Tailwind-blueviolet)

专为菲律宾（Pasay City）华人酒店打造的综合管理后台。集成了餐饮点餐、KTV 包厢管理、客房送餐、超市零售、用车调度及财务库存管理于一体的全业务生态系统。

支持 **中英双语 (Bilingual)** 界面与 **多币种 (RMB/PHP)** 结算，适配海外经营环境。

## ✨ 核心功能 (Core Features)

### 🏨 多业态管理 (Multi-Business)
*   **餐饮中控 (Dining)**: 大厅点餐、外卖接单，支持小票打印与后厨流转。
*   **KTV 智能系统**: 包厢状态管理（空闲/使用/清理）、计时计费、酒水点单、播控状态同步。
*   **客房服务 (Room Service)**: 2F/3F 楼层视图，直观查看房态与挂账点餐。
*   **超市零售 (Retail POS)**: 独立的一楼超市收银系统，支持条码扫描与独立库存。
*   **用车调度 (Car Service)**: 接送机行程安排、司机调度与费用记录。

### 🚀 运营与效率 (Operations)
*   **H5 顾客端**: 顾客扫码即可进入手机点餐界面（类 App 体验），自动识别桌号/房号。
*   **KDS 后厨显示**: 厨师专用看板，实时同步订单状态（待制作 -> 烹饪中 -> 出餐）。
*   **签单挂账 (Corporate Accounts)**: 协议单位/VIP 客户信用额度管理、记账与周期结算。
*   **二维码中心**: 一键生成所有房间、桌台及外卖的专属二维码，支持批量打印。

### 💰 财务与库存 (Finance & Inventory)
*   **全渠道支付**: 聚合现金、支付宝、微信、USDT、GCash、Maya 等多种支付方式。
*   **BOM 库存联动**: 菜品与食材配方绑定（如：点一份牛肉，自动扣减 0.2kg 库存）。
*   **财务报表**: 实时营收分析、支出管理、交接班报表（Shift Report）。

## 🛠 技术栈 (Tech Stack)

*   **前端框架**: React 19 + TypeScript
*   **构建工具**: Vite
*   **样式库**: Tailwind CSS + Lucide Icons
*   **后端服务**: **Supabase** (PostgreSQL Database, Realtime, Storage)
*   **图表库**: Recharts (数据可视化)
*   **交互**: @dnd-kit (菜单拖拽排序)

## 🗄️ 数据库与存储 (Database & Storage)

本项目已升级为使用 **Supabase** 作为后端服务，提供更强的数据一致性和图片存储能力。

1.  **Database**: 使用 PostgreSQL 存储菜单、订单、库存、财务等数据。
2.  **Storage**: 使用 Supabase Storage (`dish-images` bucket) 存储菜品图片。
3.  **Realtime**: 支持多端数据实时同步（如：前台下单，后厨 KDS 自动刷新）。

## 🚀 快速开始 (Getting Started)

### 1. 环境配置

创建 `.env` 文件（或在 Vercel 仪表盘配置）：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=jx88888888
```

### 2. 数据库初始化

在 Supabase SQL Editor 中运行提供的迁移脚本，以创建以下核心表：
*   `dishes` (菜单)
*   `orders` (订单)
*   `expenses` (支出)
*   `inventory` (库存)
*   `ktv_rooms` (KTV 包厢)
*   `hotel_rooms` (客房)
*   `sign_bill_accounts` (挂账账户)

### 3. 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📱 端侧入口

*   **管理端 (Admin)**: 访问根路径 `/` (需登录)
*   **顾客端 (Customer)**: 访问 `/?page=customer` 或扫描生成的二维码
*   **后厨端 (KDS)**: 访问 `/?page=kitchen`

## 🌍 本地化适配 (Localization)

针对菲律宾市场特别优化：
*   **语言**: 关键操作全双语标注 (中文/English/Tagalog)。
*   **支付**: 集成 GCash, Maya, USDT 选项。
*   **货币**: 自动汇率换算显示 (PHP/RMB)。

## 📄 License

MIT License
