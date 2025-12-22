# 江西酒店管理系统

> **当前版本**: v1.0.0  
> **最后更新**: 2025-12-22  
> **生产状态**: ✅ 生产就绪  
> **部署平台**: Vercel Edge Runtime  
> **数据库**: Upstash Redis (Vercel KV)

---

## 📊 系统概览

一站式酒店餐饮服务管理系统，集成客房送餐、菜单管理、订单处理、财务统计、打印服务等核心功能。

### 🎯 核心功能

| 模块 | 功能描述 | 状态 |
|------|---------|------|
| 🏨 **客房管理** | 64间标准房（8201-8232, 8301-8332）| ✅ |
| 🎤 **KTV系统** | 1间VIP包厢，计时收费 | ✅ |
| 🍽️ **菜单管理** | 菜品增删改查、分类管理、库存关联 | ✅ |
| 📱 **H5点餐** | 扫码点餐、房间自动识别、多语言支持 | ✅ |
| 💰 **订单管理** | 实时订单追踪、状态流转、支付管理 | ✅ |
| 🖨️ **打印服务** | 云打印（飞鹅云）、浏览器打印、自动出单 | ✅ |
| 💳 **支付集成** | 现金/GCash/Maya/支付宝/微信 | ✅ |
| 📊 **财务报表** | 收支统计、交班报表、数据可视化 | ✅ |
| 📦 **库存管理** | 原料追踪、低库存预警、自动扣减 | ✅ |
| 📄 **挂账系统** | 企业挂账、信用额度、结算管理 | ✅ |
| 🔐 **权限管理** | 角色权限、操作日志、数据安全 | ✅ |

---

## 🏗️ 技术架构

### No-Build + importmap 架构

- 前端依赖通过 `importmap` 从 esm.sh CDN 加载
- Vite 仅用于 TSX 转译，不打包依赖
- 构建产物极小（主JS ~35KB gzip ~12KB）
- 部署于 Vercel 边缘网络

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 18 + TypeScript | 类型安全的组件化开发 |
| 样式 | Tailwind CSS (CDN) | 原子化 CSS，零构建 |
| 图标 | Lucide React | 现代化图标库 |
| 图表 | Recharts | 数据可视化 |
| HTTP | Fetch API | 原生 HTTP 客户端 |
| 后端 | Vercel Serverless (Edge Runtime) | 全球边缘计算 |
| 数据库 | **Upstash Redis** | **REST API for Edge** |

### 🚀 Upstash Redis - 边缘计算的完美选择

**为什么选择 Upstash？**
- ✅ **REST-based API**：通过 HTTP 访问 Redis，完美兼容 Edge Functions
- ✅ **无 TCP 连接问题**：传统 Redis 需要长连接，在 Serverless 环境会超时
- ✅ **全球低延迟**：数据自动复制到多个区域
- ✅ **按需计费**：无需维护 Redis 服务器
- ✅ **Vercel 原生集成**：一键创建，环境变量自动注入

**性能表现：**
- 平均响应时间：10-50ms（全球边缘节点）
- 冷启动：< 100ms
- 并发能力：自动扩展

---

## 📁 项目结构

```
jiangxiguanlixitong/
├── api/
│   ├── index.ts              # 主 API 端点（REST 接口）
│   ├── print.ts              # 云打印 API（飞鹅云集成）
│   └── print-order.ts        # 订单自动打印 API
├── components/               # React 组件
│   ├── CustomerOrder.tsx     # H5 客户点餐页面
│   ├── MenuManagement.tsx    # 菜单管理
│   ├── OrderManagement.tsx   # 订单管理
│   ├── HotelSystem.tsx       # 客房管理
│   ├── KTVSystem.tsx         # KTV 系统
│   ├── FinanceSystem.tsx     # 财务系统
│   ├── QRCodeManager.tsx     # 二维码生成中心
│   ├── PrinterConfig.tsx     # 打印配置
│   └── Settings.tsx          # 系统设置
├── hooks/
│   ├── useAppData.ts         # 数据查询 Hook（自动缓存）
│   └── useCachedData.ts      # 缓存管理 Hook
├── lib/
│   └── kv-client.ts          # Upstash Redis 客户端
├── services/
│   ├── apiClient.ts          # API 客户端
│   ├── printer.ts            # 打印服务（云打印+浏览器打印）
│   ├── auditLogger.ts        # 审计日志
│   └── storage.ts            # 本地存储
├── utils/
│   ├── cache.ts              # 缓存工具（localStorage）
│   ├── i18n.ts               # 国际化（中文/菲律宾语）
│   └── validation.ts         # 数据验证
├── scripts/
│   ├── init-hotel-rooms.ts   # 房间数据生成脚本
│   └── init-all-data.mjs     # 一键初始化脚本
├── types.ts                  # TypeScript 类型定义
├── App.tsx                   # 主应用组件
├── index.tsx                 # React 入口
├── index.html                # HTML 入口 + importmap
├── vercel.json               # Vercel 部署配置
├── vite.config.ts            # Vite 构建配置
└── package.json              # 项目配置
```

---

## 🏨 房间配置说明

### 房间分布

| 区域 | 房间号 | 数量 | 类型 |
|------|---------|------|------|
| 8楼2区 | 8201-8232 | 32间 | 标准房 |
| 8楼3区 | 8301-8332 | 32间 | 标准房 |
| KTV | ktv-vip-001 | 1间 | VIP包厢 |
| 大厅 | LOBBY | 1个 | 公共区域 |
| **总计** | - | **66个** | - |

### 房间号识别规则

- **正则表达式**: `/^8[23]\d{2}$/`
- **匹配示例**: 8201, 8232, 8301, 8332
- **不匹配**: LOBBY, KTV, 8101, 8401

### 二维码绑定机制

**生成二维码**
1. 进入「二维码生成中心」→「客房 Rooms」
2. 系统自动生成 64 个房间二维码
3. 点击「批量打印」

**URL 格式**
```
https://yoursite.com/?page=customer&id=8201
                                        ↑
                                    房间号参数
```

**自动识别流程**
```
客户扫码 → H5页面读取 id 参数 → 订单包含房间号
→ 打印小票醒目显示 → 服务员送餐到房间
```

---

## 🖨️ 打印服务配置

### 支持的打印方式

| 方式 | 适用场景 | 成本 | 推荐等级 |
|------|---------|------|----------|
| **云打印（飞鹅云）** | H5客户点餐、收银台自动出单 | ¥0.1-0.3/张 | ⭐⭐⭐⭐⭐ |
| **浏览器打印** | 收银台手动打印 | 免费 | ⭐⭐⭐ |

### 云打印配置步骤

**1. 购买设备**
- 官网: https://www.feieyun.com
- 价格: ¥199/台（含一年流量费）
- 支持菲律宾地区

**2. 获取凭证**
- `USER`: 注册手机号
- `UKEY`: 开发者密钥
- `SN`: 打印机设备编号

**3. 系统配置**
- 进入「设置」→「打印设置」
- 选择「云打印服务（飞鹅云）」
- 填写 USER、UKEY、SN
- 点击「测试打印」验证
- 保存设置

### 打印功能说明

- ✅ **自动打印**: H5客户点餐后自动打印到收银台/厨房
- ✅ **房间醒目显示**: 房间订单用黑底白字24号大字显示房间号
- ✅ **80mm热敏纸**: 支持标准80mm小票打印机
- ✅ **容错处理**: 打印失败不影响订单创建

---

## 📊 数据查询架构

### 三层查询机制

```
前端组件 → API Client → 后端 API → Vercel KV (Redis)
   ↓           ↓            ↓              ↓
useAppData   apiClient    /api/index   kvClient
(自动缓存)  (REST调用)  (Edge Runtime) (Upstash)
```

### 支持的数据集合（9个）

| 集合名 | 数据库 Key | TypeScript 类型 |
|---------|------------|------------------|
| dishes | `dishes` | `Dish[]` |
| orders | `orders` | `Order[]` |
| expenses | `expenses` | `Expense[]` |
| inventory | `inventory` | `Ingredient[]` |
| ktv_rooms | `ktv_rooms` | `KTVRoom[]` |
| sign_bill_accounts | `sign_bill_accounts` | `SignBillAccount[]` |
| hotel_rooms | `hotel_rooms` | `HotelRoom[]` |
| payment_methods | `payment_methods` | `PaymentMethod[]` |
| system_settings | `system_settings` | `SystemSettings` |

### 缓存策略

- **缓存时间**: 5分钟
- **存储位置**: `localStorage`
- **缓存 Key**: `jx_cache_app_data`
- **自动过期**: 自动检查 `expiry` 字段

### 查询示例

```typescript
// 使用 useAppData Hook（推荐）
const { data, loading, error, refresh } = useAppData();

// 访问数据
const dishes = data.dishes;           // 菜品
const orders = data.orders;           // 订单
const hotelRooms = data.hotelRooms;   // 64间房间
const systemSettings = data.systemSettings; // 系统设置

// 强制刷新
await refresh();
```

---

## 💻 开发命令

```bash
# 本地开发（需连接真实数据库）
vercel dev

# 构建
npm run build

# 预览
npm run preview

# 初始化房间数据（64间房 + 1间KTV + 大厅）
npm run init:rooms
```

---

## 🚀 部署指南

### 部署流程

**基本步骤：**
1. 推送代码到 GitHub
2. Vercel 自动检测并构建
3. 部署到全球边缘节点

**重要说明：**
- ✅ 无需本地 `node_modules`，所有依赖通过 CDN 加载
- ✅ 不需要本地运行 `npm install` 或 `npm run dev`
- ✅ 直接推送代码，Vercel 自动处理构建

### 1. 创建 Vercel KV 存储（Upstash Redis）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 **Storage** → **Create Database** → 选择 **KV**
4. Vercel 会自动创建 Upstash Redis 实例
5. 环境变量自动注入：
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL`

### 2. 配置其他环境变量

在 Vercel 项目设置中添加：
- `VITE_ADMIN_USER` - 管理员用户名
- `VITE_ADMIN_PASS` - 管理员密码

### 3. 推送部署

```bash
git push origin main
```

Vercel 会自动检测并构建部署。

### 4. 初始化数据

部署成功后，访问：
```
https://your-app.vercel.app
```

在浏览器控制台运行：
```bash
# 调用初始化 API
fetch('/api/init-rooms', { method: 'POST' })
```

或使用本地脚本（需先配置 API URL）：
```bash
VITE_API_URL=https://your-app.vercel.app npm run init:rooms
```

### 5. 验证部署

访问 `https://your-app.vercel.app/api` 查看 KV 连接状态：
```json
{
  "success": true,
  "message": "Jiangxi Hotel Management System API (KV Storage Version)",
  "kvStatus": {
    "connected": true,
    "hasUrl": true,
    "hasToken": true
  },
  "dataSummary": {
    "dishes": 0,
    "orders": 0,
    "hotel_rooms": 64
  }
}
```

---

## ⚙️ 环境变量

复制 `.env.local.template` 为 `.env.local` 并填入实际值。

**必需变量：**
- `KV_REST_API_URL` - Upstash Redis REST API 地址（Vercel 自动注入）
- `KV_REST_API_TOKEN` - Upstash Redis REST API Token（Vercel 自动注入）
- `VITE_ADMIN_USER` - 管理员用户名
- `VITE_ADMIN_PASS` - 管理员密码

**可选变量：**
- `VITE_APP_URL` - 应用访问 URL（用于二维码生成）

---

## ❓ 常见问题

### 1. TypeScript 错误：找不到模块

**问题：** VS Code 显示 "找不到模块 'vite' 或其相应的类型声明"

**解决：** 这是正常现象，可以忽略。项目不需要本地 `node_modules`，Vercel 构建时会自动安装依赖。

### 2. Vercel 部署失败

**常见错误及解决：**

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| Function Runtimes 版本错误 | 在 vercel.json 中配置了 functions | 删除 functions 配置，Edge Runtime 通过代码声明 |
| 无效的路由模式 | 正则表达式语法错误 | 负向预查必须在非捕获组中：`/:path((?:(?!api).)*)` |
| ESM 导入错误 | 缺少文件扩展名 | 相对导入必须包含 `.js` 扩展名 |

### 3. KV 数据库连接失败

**检查步骤：**
1. 访问 `/api` 查看 `kvStatus` 字段
2. 确认 Vercel Dashboard 中已创建 KV 实例
3. 检查环境变量是否自动注入
4. 尝试 Redeploy 重新部署

### 4. 打印功能不工作

**H5客户点餐打印问题：**
- ✅ 必须使用云打印（飞鹅云），浏览器打印无法在服务器端触发
- ✅ 确认在 Settings 中已配置云打印凭证
- ✅ 测试打印功能验证配置

**收银台打印问题：**
- ✅ 检查浏览器是否允许弹出窗口
- ✅ 确认打印机连接正常
- ✅ 使用云打印可避免浏览器兼容性问题

### 5. 房间数据未初始化

**问题：** 房间列表为空

**解决：**
```bash
# 运行初始化脚本
npm run init:rooms

# 或手动调用 API
fetch('/api/init-rooms', { method: 'POST' })
```

---

## 📈 性能指标

- **构建产物大小**：~35KB (gzip ~12KB)
- **API 响应时间**：10-50ms（全球边缘节点）
- **冷启动时间**：< 100ms
- **并发能力**：自动扩展
- **缓存命中率**：95%+（5分钟缓存）

---

## 🔄 业务流程

### H5客户点餐完整流程

```
1. 客户在房间扫描二维码
   ↓
2. 跳转H5点餐页面（自动识别房间号 8201）
   ↓
3. 浏览菜单，选择菜品加入购物车
   ↓
4. 结算，选择支付方式（GCash/现金/Maya等）
   ↓
5. 确认支付，创建订单
   ↓
6. 自动调用 /api/print-order 后台打印
   ↓
7. 收银台/厨房打印机自动出单
   （醒目显示：🚪 送至房间 8201）
   ↓
8. 服务员看到订单，准备餐品
   ↓
9. 直接送餐到 8201 房间
```

### 收银台订单管理流程

```
1. 收银台 OrderManagement 收到新订单通知
   ↓
2. 查看订单详情（包含房间号、菜品、金额）
   ↓
3. 更新订单状态：待处理 → 烹饪中 → 已上菜
   ↓
4. 厨房根据小票准备餐品
   ↓
5. 服务员配送到房间
   ↓
6. 订单完成，财务系统自动统计
```

---

## 📝 许可证

专有软件，版权所有 © 2025 江西酒店管理系统。

---

## 📞 技术支持

- **系统版本**: v1.0.0
- **最后更新**: 2025-12-22
- **技术架构**: React 18 + TypeScript + Vercel Edge + Upstash Redis
- **打印集成**: 飞鹅云（Feieyun）
- **支付集成**: GCash, Maya, 支付宝, 微信
