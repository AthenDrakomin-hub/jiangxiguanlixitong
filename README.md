
# 🏨 江西饭店综合管理系统 (Jiangxi Hotel Management System)

![Version](https://img.shields.io/badge/Version-2.5.0-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Production-emerald?style=flat-square)
![Stack](https://img.shields.io/badge/Tech-React_19_·_Supabase_·_Tailwind-7c3aed?style=flat-square)

> **Enterprise-grade hotel & catering management solution designed for overseas Chinese businesses.**
> 
> 专为菲律宾（Pasay City）华人酒店打造的综合SaaS管理后台。集成了餐饮点餐、KTV 包厢管理、客房送餐、用车调度及财务库存管理于一体的全业务生态系统。

---

## ✨ 核心模块 (Core Modules)

### 1. 🍽️ 餐饮中控 (Dining System)
*   **多场景支持**: 覆盖大厅堂食 (Dine-in)、客房送餐 (Room Service)、外卖接单 (Takeout)。
*   **H5 顾客端**: 顾客扫码即点，支持桌号/房号自动识别，无需下载APP。
*   **KDS 厨显系统**: 实时同步后厨订单状态（待制作 -> 烹饪中 -> 出餐），替代传统纸质小票。

### 2. 🎤 KTV 娱乐管理 (KTV Console)
*   **包厢状态**: 可视化管理包厢（空闲/使用中/待清理/维护）。
*   **计时计费**: 自动计算包厢时长费 + 酒水点单费用。
*   **服务联动**: 支持切歌、呼叫服务、清洁标记。

### 3. 🚗 用车调度 (Car Service)
*   **行程管理**: 接机/送机/包车服务预约与调度。
*   **状态追踪**: 待出行 -> 已完成/已取消，司机与费用记录。

### 4. 💼 财务与挂账 (Finance & Credit)
*   **全渠道支付**: 聚合 Cash, GCash, Maya, Alipay, WeChat, USDT。
*   **协议挂账**: 支持企业/VIP客户信用额度管理、挂账消费与周期结算 (月结/季结)。
*   **交班报表**: 自动生成 Shift Report，统计当班营收与支付方式汇总。

---

## 🛠️ 技术架构 (Architecture)

*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
*   **Backend / DB**: **Supabase** (PostgreSQL, Realtime, Storage, Auth)
*   **UI Components**: Lucide React, Recharts (Data Viz), @dnd-kit (Drag & Drop)
*   **Deployment**: Vercel (Recommended)

---

## 🚀 部署指南 (Deployment)

### 1. Supabase 设置 (Database)
1.  登录 [Supabase](https://supabase.com) 创建新项目。
2.  进入 **SQL Editor**，运行项目提供的 `schema.sql` (如有) 或等待应用自动初始化数据。
3.  获取 `Project URL` 和 `anon public key`。

### 2. Vercel 部署 (Hosting)
1.  Fork 本仓库到您的 GitHub。
2.  在 Vercel 中导入项目。
3.  **关键步骤**: 在 Environment Variables 中添加以下变量：

| Variable Name | Value Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | 您的 Supabase 项目网址 (e.g., https://xyz.supabase.co) |
| `VITE_SUPABASE_ANON_KEY` | 您的 Supabase Anon API Key |
| `VITE_ADMIN_PASS` | (可选) 设置后台管理员密码，默认 `jx88888888` |

4.  点击 **Deploy**。

### 3. 本地开发 (Development)
```bash
# 1. 克隆项目
git clone [repo-url]

# 2. 安装依赖
npm install

# 3. 创建 .env 文件并填入上述变量
cp .env.example .env

# 4. 启动服务
npm run dev
```

---

## 📱 端侧入口 (Access Points)

*   **管理后台 (Admin)**: `https://your-domain.com/`
*   **顾客点餐 (Customer)**: `https://your-domain.com/?page=customer` (或扫码)
*   **后厨看板 (KDS)**: `https://your-domain.com/?page=kitchen`

---

## 🔒 安全与权限

*   **数据安全**: 敏感操作（如删除菜单、查看财务）需管理员权限。
*   **网络安全**: 建议配合 Cloudflare 使用，防止 DDoS 攻击。
*   **支付安全**: 系统仅记录支付方式，不接触敏感卡号信息。

---

© 2024 Jiangxi Hotel Management System. All Rights Reserved.
