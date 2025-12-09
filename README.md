# 江西酒店管理系统 (Jiangxi Hotel Management System)

<div align="center">

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](#)
[![Vite](https://img.shields.io/badge/Vite-Blazing_Fast-blue?logo=vite)](#)
[![TiDB](https://img.shields.io/badge/TiDB-Cloud-orange?logo=tidb)](#)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?logo=vercel)](#)

</div>

一款面向中小型酒店/餐厅的一站式管理解决方案，融合餐饮点单、客房服务、KTV预订、财务管理与库存管控，实现全业务链数字化运营。

## 🎉 部署状态

✅ **项目已准备就绪，可以正式部署到Vercel！**

## 🌟 核心功能 (Core Features)

### 1. 🍽️ 餐饮管理 (Restaurant Management)
*   **智能菜单**: 支持菜品图片、描述、价格、分类、辣度标识。
*   **桌边点单**: 桌号快速下单，实时同步至后厨显示屏(KDS)。
*   **订单追踪**: 可视化订单状态(Pending/Confirmed/Cooking/Ready/Delivered/Paid/Cancelled)。
*   **多语言支持**: 中英双语界面，菲律宾本土化术语。
*   **批量导入**: 支持CSV模板批量导入菜单数据。

### 2. 🎵 KTV娱乐系统 (Entertainment)
*   **包厢管理**: 支持小型/中型/豪华包厢预订与状态追踪。
*   **计费模式**: 按小时计费，自动计算消费金额。
*   **时段管理**: 灵活设置不同时段的价格策略。

### 3. 🏨 客房服务 (Hotel Services)
*   **房间管理**: 支持标准间/大床房/套房等多种房型。
*   **入住管理**: 客人信息登记、入住/退房时间记录。
*   **客房送餐**: 直接从客房下单，无缝对接餐厅系统。

### 4. 📱 数字化体验 (Digital Experience)
*   **扫码点单**: 客户扫描二维码直接访问H5点单页面。
*   **厨房显示屏**: 后厨实时接收并处理订单，支持订单状态更新。
*   **移动适配**: 响应式设计，完美适配手机、平板、收银机等各种设备。

### 5. 💰 财务与挂账 (Finance & Credit)
*   **全渠道支付**: 聚合 Cash, GCash, Maya, Alipay, WeChat, USDT。
*   **协议挂账**: 支持企业/VIP客户信用额度管理、挂账消费与周期结算 (月结/季结)。
*   **交班报表**: 自动生成 Shift Report，统计当班营收与支付方式汇总。

---

## 🛠️ 技术架构 (Architecture)

*   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
*   **Backend / DB**: **TiDB Cloud** (MySQL compatible, Realtime, Storage)
*   **UI Components**: Lucide React, Recharts (Data Viz), @dnd-kit (Drag & Drop)
*   **Deployment**: Vercel (Recommended)

---

## 🚀 部署指南 (Deployment)

### 1. TiDB Cloud 设置 (Database)
1.  登录 [TiDB Cloud](https://tidbcloud.com) 创建新集群。
2.  创建数据库和用户，并授予相应权限。
3.  获取连接信息：Host, Port, Username, Password, Database Name。

### 2. Vercel 部署 (Hosting)
1.  Fork 本仓库到您的 GitHub。
2.  在 Vercel 中导入项目。
3.  **关键步骤**: 在 Environment Variables 中添加以下变量：

| Variable Name | Value Description |
| :--- | :--- |
| `TIDB_HOST` | 您的 TiDB Cloud 集群地址 |
| `TIDB_PORT` | 端口号 (默认: 4000) |
| `TIDB_USER` | 数据库用户名 |
| `TIDB_PASSWORD` | 数据库密码 |
| `TIDB_DATABASE` | 数据库名称 |
| `TIDB_SSL` | 是否启用 SSL (true/false) |
| `VITE_ADMIN_USER` | (可选) 设置后台管理员用户名 |
| `VITE_ADMIN_PASS` | (可选) 设置后台管理员密码 |

4.  点击 **Deploy**。

### 3. 数据库初始化
部署完成后，需要初始化数据库表结构：

```bash
# 1. 克隆项目到本地
git clone [your-repo-url]
cd jiangxi-hotel-admin

# 2. 安装依赖
npm install

# 3. 复制环境变量文件并填写TiDB连接信息
cp .env.example .env.local

# 4. 运行数据库初始化脚本
node scripts/init-db.js
```

### 4. 本地开发 (Development)
```bash
# 1. 克隆项目
git clone [repo-url]

# 2. 安装依赖
npm install

# 3. 复制环境变量文件并填写相关信息
cp .env.example .env.local

# 4. 启动开发服务器
npm run dev
```

### 5. 生产环境构建 (Production Build)
```bash
# 1. 构建生产版本
npm run build

# 2. 预览生产构建
npm run preview
```

---

## 🔧 环境变量配置 (Environment Variables)

创建 `.env.local` 文件（开发环境）或在 Vercel 中设置环境变量：

```env
# TiDB 数据库连接信息
TIDB_HOST=your_tidb_host
TIDB_PORT=4000
TIDB_USER=your_tidb_user
TIDB_PASSWORD=your_tidb_password
TIDB_DATABASE=your_tidb_database
TIDB_SSL=true

# 管理员凭据（可选）
VITE_ADMIN_USER=your_admin_username
VITE_ADMIN_PASS=your_admin_password
```

---

## 📁 项目结构 (Project Structure)

```
jiangxi-hotel-admin/
├── api/                 # Vercel Serverless API 路由
├── components/          # React 组件
├── config/              # 配置文件
├── hooks/               # 自定义 React Hooks
├── scripts/             # 部署和维护脚本
├── services/            # 业务逻辑和服务
├── utils/               # 工具函数
├── App.tsx             # 主应用组件
├── index.tsx           # 应用入口
└── vite.config.ts      # Vite 配置
```

---

## ✅ 部署验证 (Deployment Validation)

部署完成后，运行以下命令验证系统是否正常工作：

```bash
# 运行部署验证脚本
npm run validate:deploy
```

该脚本将检查：
1. 环境变量配置
2. 数据库连接
3. 数据库表结构
4. API 服务
5. 前端构建

---

## 🔄 数据库初始化 (Database Initialization)

首次部署时，需要初始化数据库表结构。执行以下 SQL 脚本：

```bash
# 在 TiDB Cloud 控制台中执行 scripts/init-database.sql 文件
```

或者使用Node.js脚本：
```bash
# 运行数据库初始化脚本
node scripts/init-db.js
```

---

## 🔐 安全建议 (Security Recommendations)

1.  **强密码策略**: 为管理员账户设置强密码
2.  **HTTPS**: 确保启用了 HTTPS 加密传输
3.  **访问控制**: 限制对管理后台的访问
4.  **定期备份**: 定期备份 TiDB 数据库
5.  **更新维护**: 定期更新依赖包以修复安全漏洞

---

## 📞 技术支持 (Support)

如有任何问题，请提交 Issue 或联系技术支持团队。

---

## 📄 许可证 (License)

本项目为专有软件，版权所有。未经授权，禁止复制、分发或修改本软件的任何部分。
查看 [LICENSE](LICENSE) 文件了解详细条款。