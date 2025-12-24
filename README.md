
# 江西酒店管理系统

一站式酒店餐饮服务管理系统，集成客房送餐、菜单管理、订单处理、财务统计等核心功能。

## 🛠️ 技术栈框架

### 前端技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 7.3.0
- **UI组件**: Lucide Icons + Recharts
- **状态管理**: React Hooks + 自定义Hooks
- **模块解析**: Node16 (支持ES模块)
- **运行时**: Vercel Edge Runtime
- **国际化**: 内置i18n支持
- **样式**: Tailwind CSS

### 后端技术栈
- **后端**: Vercel Edge Functions (API Gateway 模式)
- **数据库**: 多数据库支持 (Memory, Neon PostgreSQL)
- **数据库客户端**: @neondatabase/serverless
- **架构特点**: No-Build 极简部署，依赖通过 CDN (esm.sh) 加载

### 依赖管理
- **运行时依赖**: 
  - @neondatabase/serverless
  - dotenv
  - lucide-react
  - react-dom
  - recharts
- **开发依赖**:
  - @types/node
  - @types/react
  - @types/react-dom
  - @vitejs/plugin-react
  - typescript
  - vite

## 🧩 核心功能

### 1. 酒店客房管理
- **房间管理**: 64个房间 (8201-8232, 8301-8332)，支持房间状态管理
- **客房送餐**: 客房扫码点餐，订单自动流转至厨房
- **房间状态**: 可视化房间状态管理（可用、占用、维护、清洁）

### 2. 菜单与订单管理
- **菜单管理**: 菜品增删改查，支持分类、价格、描述、图片
- **订单管理**: 订单状态流转（待处理→烹饪→就绪→已送达→完成）
- **厨房显示**: 厨房显示屏实时更新订单状态

### 3. 财务与库存管理
- **财务系统**: 支出管理、实时统计、一键交班打印
- **库存管理**: 库存跟踪、最低库存提醒、自动扣减
- **签单系统**: 企业账户管理，信用额度控制

### 4. 娱乐设施管理
- **KTV管理**: KTV房间预订、计费管理
- **娱乐服务**: 完整的娱乐设施管理流程

## ✨ 特殊功能

### 1. 智能通知系统
- **新订单提醒**: 实时通知（桌面通知+页面弹窗）
- **音频提醒**: 订单到达时播放通知音效
- **视觉提醒**: 动画弹窗提醒

### 2. 移动端适配
- **响应式设计**: 完美适配移动端和桌面端
- **H5客户点餐**: 客户扫码进入H5点餐页面
- **移动导航**: 移动端专用侧边栏

### 3. 权限管理
- **用户认证**: 登录验证系统
- **角色管理**: 支持不同权限级别
- **安全控制**: 环境变量保护敏感信息

### 4. 数据可视化
- **图表展示**: 使用Recharts进行数据可视化
- **实时统计**: 订单、财务、库存实时统计
- **数据导出**: 支持数据查看和导出

## 🧪 单元测试与集成测试

### 单元测试
- **测试框架**: 内置测试工具
- **测试覆盖**: 包含数据库操作、API接口、业务逻辑测试
- **测试脚本**: 
  - `npm run test:neon` - 测试Neon数据库连接
  - `npm run db:migrate` - 数据库迁移脚本

### 集成测试
- **API测试**: 集成测试验证API端点功能
- **数据库测试**: 验证数据库连接和CRUD操作
- **端到端测试**: 测试完整业务流程

## 🛣️ 路由与状态管理

### 前端路由
- **路由管理**: 基于currentPage状态的前端路由
- **页面类型**: 
  - dashboard: 仪表板
  - menu: 菜单管理
  - orders: 订单管理
  - finance: 财务系统
  - inventory: 库存管理
  - settings: 系统设置
  - ktv: KTV系统
  - signbill: 签单系统
  - hotel: 酒店系统
  - qrcode: 二维码管理
  - kitchen: 厨房显示
  - customer: 客户点餐
  - payment: 支付管理
  - permissions: 权限管理
  - dataviewer: 数据查看
  - validationtest: 数据验证测试
- **URL参数支持**: 支持?page=customer和?page=kitchen参数

### 状态管理
- **全局状态**: 定义在App.tsx中的全局状态
- **数据获取**: useAppData Hook统一管理数据获取和缓存
- **缓存策略**: 5分钟客户端缓存，支持手动刷新
- **认证状态**: 开发环境自动认证，生产环境基于sessionStorage
- **数据同步**: 自动监听数据变化并同步UI

## 🌐 API结构

### API网关设计
- **统一入口**: `/api/index.ts` 作为API网关
- **路由匹配**: 动态路由匹配业务实体
- **CORS支持**: 全面的跨域资源共享支持
- **错误处理**: 统一的错误处理和响应格式

### API端点
- **认证端点**: `/api/auth/login` - 用户登录认证
- **业务实体端点**:
  - `/api/dishes` - 菜品管理
  - `/api/hotel_rooms` - 酒店房间
  - `/api/ktv_rooms` - KTV房间
  - `/api/inventory` - 库存管理
  - `/api/payment_methods` - 支付方式
  - `/api/system_settings` - 系统设置
  - `/api/orders` - 订单管理
  - `/api/expenses` - 支出管理
  - `/api/sign_bill_accounts` - 签单账户

### HTTP方法支持
- **GET**: 获取数据（单个或全部）
- **POST**: 创建新记录
- **PUT**: 更新记录
- **DELETE**: 删除记录

## 💾 数据库

### 数据库抽象层
- **统一接口**: Database接口定义统一的数据库操作
- **多数据库支持**: 支持memory和neon数据库
- **工厂模式**: DatabaseFactory创建相应的数据库实例
- **连接管理**: 自动连接、断开和重连

### 数据库实现
- **MemoryDatabase**: 内存数据库，用于开发和测试
- **NeonDatabase**: Neon PostgreSQL数据库，用于生产环境
- **自动初始化**: 数据库自动初始化和连接管理

### 数据库配置
- **环境变量**: `DB_TYPE` (memory, neon)
- **连接字符串**: `NEON_CONNECTION_STRING` (Neon数据库)
- **自动切换**: 失败时自动降级到内存数据库

## 🗃️ 数据库结构

### 核心实体

#### 1. Dish (菜品)
```typescript
interface Dish {
  id: string;
  name: string;
  category: string;
  price: number;
  cost?: number;
  description?: string;
  image?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  ingredients?: string[];
}
```

#### 2. Order (订单)
```typescript
interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  discount?: number;
  tax?: number;
  serviceCharge?: number;
  paid: boolean;
  timestamp: string;
  completedAt?: string;
  customerName?: string;
  customerPhone?: string;
  roomNumber?: string;
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  specialRequests?: string;
}
```

#### 3. OrderItem (订单项)
```typescript
interface OrderItem {
  id: string;
  dishId: string;
  name: string;
  quantity: number;
  price: number;
  specialRequests?: string;
}
```

#### 4. HotelRoom (酒店房间)
```typescript
interface HotelRoom {
  id: string;
  roomNumber: string;
  roomType: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  currentGuest?: {
    name: string;
    checkInDate: string;
    expectedCheckOut: string;
    advancePayment: number;
  };
  rate: number;
  floor?: number;
  bedType?: string;
  amenities?: string[];
  lastCleaned?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 5. KTVRoom (KTV房间)
```typescript
interface KTVRoom {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentSession?: {
    startTime: string;
    customerName: string;
    advancePayment: number;
    totalCharges?: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

#### 6. Expense (支出)
```typescript
interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  receiptImage?: string;
}
```

#### 7. Ingredient (库存)
```typescript
interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  pricePerUnit?: number;
  supplier?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 8. SignBillAccount (签单账户)
```typescript
interface SignBillAccount {
  id: string;
  accountName: string;
  creditLimit: number;
  currentBalance: number;
  status: 'active' | 'suspended' | 'closed';
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 枚举类型

#### OrderStatus (订单状态)
```typescript
enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
```

#### ExpenseCategory (支出类别)
```typescript
enum ExpenseCategory {
  INGREDIENTS = 'Ingredients',
  RENT = 'Rent',
  SALARY = 'Salary',
  UTILITIES = 'Utilities',
  MAINTENANCE = 'Maintenance',
  EQUIPMENT = 'Equipment',
  OTHER = 'Other',
}
```

## 🚪 接入方式

### Web应用
- **浏览器访问**: 直接通过URL访问系统
- **响应式设计**: 支持桌面端和移动端访问
- **PWA支持**: 渐进式Web应用特性

### API接口
- **RESTful API**: 基于HTTP的RESTful接口
- **JSON格式**: 统一的JSON数据格式
- **CORS支持**: 跨域资源共享支持
- **认证机制**: 基于JWT的认证（演示用）

### 移动端
- **H5点餐**: 客户通过扫描二维码进入H5点餐页面
- **移动端优化**: 针对移动设备优化的UI/UX

## 📥 数据获取方式

### 前端数据获取
- **useAppData Hook**: 统一的数据获取和缓存Hook
- **客户端缓存**: 5分钟内存缓存，减少API调用
- **自动刷新**: 支持手动和自动数据刷新
- **错误处理**: 自动重试和错误处理机制

### API客户端
- **apiClient服务**: 统一的API客户端服务
- **CRUD操作**: 封装的创建、读取、更新、删除操作
- **错误处理**: 统一的错误处理和用户反馈
- **加载状态**: 操作过程中的加载状态指示

### 数据同步
- **实时同步**: 数据变更后自动同步到其他组件
- **乐观更新**: 提供流畅的用户体验
- **冲突处理**: 处理并发修改冲突

## 🛠️ 数据表脚本

### 数据库初始化
- **自动初始化**: 应用启动时自动初始化数据库
- **数据种子**: 通过/api/seed端点初始化默认数据
- **房间数据**: 自动生成64个房间数据

### 数据库迁移
- **迁移脚本**: `migrate-neon.ts` - Neon数据库迁移脚本
- **版本控制**: 数据库结构版本控制
- **向后兼容**: 确保数据迁移的向后兼容性

### 数据验证
- **输入验证**: 严格的输入数据验证
- **业务逻辑验证**: 业务规则验证
- **类型安全**: TypeScript类型安全保证

### 数据备份与恢复
- **快照功能**: 通过DataViewer组件的数据快照功能
- **导出功能**: 数据导出功能
- **审计日志**: auditLogger服务记录关键操作

## 📋 部署配置

### 环境变量配置
在 Vercel 项目的 `Settings -> Environment Variables` 中添加：

| 变量名 | 说明 | 示例 |
|-------|------|------|
| `VITE_ADMIN_USER` | 管理员账号 | admin |
| `VITE_ADMIN_PASS` | 管理员密码 | 您的密码 |
| `DB_TYPE` | 数据库类型 (memory, neon) - 默认为 memory | memory |
| `NEON_CONNECTION_STRING` | Neon数据库连接字符串 (当DB_TYPE=neon时) | postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require |
| `VITE_APP_URL` | 应用URL，用于二维码生成 (可选) | https://your-app.vercel.app |
| `VERCEL_URL` | Vercel部署URL (自动设置) | your-app.vercel.app

### 环境变量详细说明

#### 认证相关
- **VITE_ADMIN_USER**: 管理员登录用户名
- **VITE_ADMIN_PASS**: 管理员登录密码

#### 数据库相关
- **DB_TYPE**: 指定数据库类型，支持 `memory` (内存数据库，用于开发测试) 和 `neon` (Neon PostgreSQL，用于生产环境)
- **NEON_CONNECTION_STRING**: 当使用Neon数据库时，需要提供数据库连接字符串

#### 应用相关
- **VITE_APP_URL**: 应用部署的完整URL，用于生成客户点餐二维码
- **VERCEL_URL**: Vercel自动提供的部署URL，用于构建API基础URL
- **PORT**: 本地开发服务器端口，默认为5173

### 部署命令
- `npm run dev` - 开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run db:migrate` - 数据库迁移
- `npm run test:neon` - 测试Neon连接

### 部署后配置
1. 配置环境变量
2. 重新部署应用
3. 初始化房间数据: 执行 `/api/seed` 端点

---
© 2025 江西酒店管理系统 - 企业级解决方案