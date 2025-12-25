# 江西酒店管理系统 - 综合文档

## 目录
1. [系统概述](#系统概述)
2. [数据库设置与迁移](#数据库设置与迁移)
3. [系统初始化](#系统初始化)
4. [打印功能配置](#打印功能配置)
5. [Vercel部署指南](#vercel部署指南)
6. [部署检查清单](#部署检查清单)
7. [发布说明](#发布说明)

## 系统概述

江西酒店管理系统是一个现代化的酒店管理解决方案，支持酒店客房管理、KTV管理、订单处理、财务管理和云同步功能。系统已完全准备好部署到生产环境。

### 核心功能
- **酒店客房管理**: 64个房间状态管理（8201-8232, 8301-8332），支持可视化房间状态管理（可用、占用、维护、清洁）
- **菜单与订单管理**: 菜品CRUD操作，订单状态流转管理，支持分类、价格、描述、图片等完整信息
- **财务与库存管理**: 支出管理、库存跟踪、签单账户管理，支持实时统计、一键交班打印
- **KTV娱乐管理**: KTV房间预订、计费管理，支持会话管理、计费统计
- **智能通知系统**: 实时订单提醒、音频和视觉通知，支持桌面通知、页面弹窗、音频提醒
- **移动端适配**: 响应式设计、H5客户点餐，支持客户扫码进入H5点餐页面
- **权限管理**: 用户认证、角色管理、安全控制，支持不同权限级别
- **数据可视化**: 图表展示、实时统计、数据导出，使用Recharts进行数据可视化

### 云端运维功能
- **数据状态版本化**: 自动关联Git Commit Hash到数据快照，明确知道"这批数据是配合哪一个版本的代码生成的"
- **操作审计**: 记录所有敏感操作日志，包含操作人、操作时间、操作类型和相关快照ID
- **API安全**: 敏感端点认证保护，Basic Authentication、权限控制
- **云同步控制台**: 一键数据同步、备份、恢复，通过设置面板直接操作
- **抽屉式设置面板**: 清晰的模块化设置界面，常规、数据库、云运维、安全四个模块

## 数据库设置与迁移

### 1. Neon数据库设置

#### 安装依赖
在项目根目录运行以下命令安装Neon数据库驱动：
```bash
npm install @neondatabase/serverless
```

#### 创建Neon数据库
1. 访问 [Neon 控制台](https://console.neon.tech/)
2. 创建新项目
3. 记下连接字符串，格式如下：
   ```
   postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
   ```

#### 运行数据库迁移
**方法一：使用迁移脚本**
```bash
# 设置连接字符串环境变量
export NEON_CONNECTION_STRING="postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require"

# 运行迁移脚本
npx tsx migrate-neon.ts
```

**方法二：手动创建表**
在 Neon SQL 编辑器中执行以下 SQL：
```sql
-- 创建键值存储表
CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store(key);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 kv_store 表创建更新时间触发器
DROP TRIGGER IF EXISTS update_kv_store_updated_at ON kv_store;

CREATE TRIGGER update_kv_store_updated_at 
  BEFORE UPDATE ON kv_store 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. 数据库分支管理配置

本项目集成了 Neon 数据库的分支管理功能，通过 GitHub Actions 自动为每个 Pull Request 创建和删除数据库分支。

#### 配置要求
1. **Neon 项目设置**：
   - 在 [Neon 控制台](https://console.neon.tech/) 创建项目
   - 获取 Project ID 和 API Key

2. **GitHub 仓库设置**：
   - **GitHub Variables**（Settings > Secrets and variables > Actions > Variables）：
     - `NEON_PROJECT_ID`: 你的 Neon 项目 ID
   - **GitHub Secrets**（Settings > Secrets and variables > Actions > Secrets）：
     - `NEON_API_KEY`: 你的 Neon API 密钥

#### 工作流功能
- **自动创建分支**: 当 PR 被创建、重新打开或同步时，自动创建名为 `preview/pr-{PR_NUMBER}-{BRANCH_NAME}` 的 Neon 分支，分支会在 14 天后自动过期并删除
- **自动删除分支**: 当 PR 被关闭时，自动删除对应的 Neon 分支

### 3. 配置应用

#### 环境变量配置
```bash
# 设置数据库类型为 neon
DB_TYPE=neon

# 设置 Neon 连接字符串
NEON_CONNECTION_STRING=postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
```

#### 在应用中配置
1. 访问应用的设置页面
2. 选择 "Neon" 数据库类型
3. 输入连接字符串
4. 点击 "测试连接" 验证配置
5. 点击 "保存配置" 应用设置

### 4. Vercel 部署配置
在 Vercel 项目设置中添加以下环境变量：
- `DB_TYPE=neon`
- `NEON_CONNECTION_STRING` (从 Neon 控制台获取)

### 5. 故障排除
- **连接问题**: 确保连接字符串格式正确，检查防火墙设置，验证用户名和密码是否正确
- **权限问题**: 确保数据库用户有足够的权限创建表和执行查询，检查 Neon 项目中的角色权限设置
- **性能问题**: 考虑使用连接池端点（pooler）以获得更好的性能，监控查询执行时间，必要时添加更多索引

## 系统初始化

### 1. 安装依赖
确保项目已安装Neon数据库驱动：
```bash
npm install @neondatabase/serverless
```

### 2. 环境变量配置
在运行初始化脚本之前，需要配置数据库连接字符串。在`.env`文件中添加：
```env
NEON_CONNECTION_STRING=postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
# 或者使用 DATABASE_URL
DATABASE_URL=postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
```

### 3. 使用TypeScript初始化脚本

#### 方法一：使用TypeScript脚本（推荐）
运行TypeScript初始化脚本：
```bash
# 使用tsx运行脚本
npx tsx init-neon-db-simple.ts
```

或者使用esrun：
```bash
npx esrun init-neon-db-simple.ts
```

#### 方法二：使用SQL脚本
直接在Neon控制台或psql中执行SQL脚本：
```bash
psql -d "your_neon_connection_string" -f init-data.sql
```

### 4. 初始化内容
初始化脚本将创建以下数据：

#### 表结构
- `kv_store` - 键值存储表，用于存储所有应用数据

#### 初始数据
- **菜品数据** (8种) - 包括宫保鸡丁、麻婆豆腐等经典菜品
- **酒店房间** (64间) - 包括8201-8232, 8301-8332房间
- **KTV房间** (1间) - KTV-001
- **支付方式** (5种) - 现金、支付宝、微信支付、信用卡、银行转账
- **系统设置** - 店铺信息、通知设置、汇率等
- **费用数据** - 员工工资、水电费、食材采购等
- **签账账户** (2个) - VIP客户、企业账户
- **订单数据** (3个) - 包括已完成和待处理订单
- **用户数据** (2个) - 管理员和员工账户
- **库存数据** (5种) - 大米、鸡肉、豆腐、辣椒、鸡蛋
- **角色权限** - 管理员、员工、经理角色及权限
- **KTV预订** (1个) - 预订示例
- **酒店预订** (1个) - 预订示例
- **营业数据** (1天) - 营业报告示例

### 5. 验证初始化
初始化完成后，可以通过以下方式验证：
```sql
-- 检查菜品数量
SELECT COUNT(*) FROM kv_store WHERE key LIKE 'dishes:%';

-- 检查酒店房间数量
SELECT COUNT(*) FROM kv_store WHERE key LIKE 'hotel_rooms:%';

-- 检查所有数据
SELECT COUNT(*) FROM kv_store;
```

### 6. 故障排除
- **连接问题**: 确保连接字符串格式正确，检查防火墙设置，验证用户名和密码
- **权限问题**: 确保数据库用户有足够的权限创建表和插入数据
- **重复初始化**: 脚本使用 `ON CONFLICT (key) DO NOTHING` 避免重复插入，如果需要重新初始化，请先清空表数据

### 7. 自定义数据
如果需要修改初始数据，请编辑 `init-data.sql` 文件中的INSERT语句，然后重新运行初始化脚本。

### 8. 生产环境部署
在生产环境中，建议：
1. 使用Vercel环境变量配置数据库连接
2. 在部署脚本中自动运行初始化脚本
3. 备份重要数据

## 打印功能配置

本项目支持三种打印方式，请根据实际需求选择：

### 方式对比

| 方式 | 优点 | 缺点 | 成本 | 推荐场景 |
|------|------|------|------|----------|
| **浏览器打印** | 免费、即开即用 | 样式控制有限 | ¥0 | 快速上线、客户自助打印 |
| **云打印服务** | 稳定、支持多设备 | 需付费 | ¥0.1-0.3/张 | **推荐** 多设备、远程打印 |
| **USB/蓝牙打印机** | 速度快、成本低 | 需硬件、浏览器兼容性差 | ¥800-2000 | 收银台固定设备 |

### 快速开始

#### 方式 1: 浏览器打印（默认）
**无需配置**，开箱即用！
```typescript
// 已默认启用，无需额外操作
PrinterService.printOrder(order); // 自动弹出浏览器打印对话框
```

**特点**：
- ✅ 免费
- ✅ 支持所有浏览器
- ✅ 适合客户自助打印小票
- ⚠️ 需要用户点击"打印"确认

#### 方式 2: 云打印服务（推荐）⭐

**步骤 1: 购买云打印机**

推荐服务商（按流行度排序）：
1. **飞鹅云打印** (https://www.feieyun.com)
   - 价格：¥199/台（含一年流量费）
   - 优势：稳定、API 文档完善、支持海外使用
   - **推荐购买** ⭐

2. **易联云** (https://www.yilianyun.net)
   - 价格：¥299/台
   - 优势：国内知名品牌

3. **芯烨云打印** (https://www.xpyun.net)
   - 价格：¥188/台
   - 优势：价格便宜

**步骤 2: 获取 API 凭证**

登录飞鹅云后台，获取以下信息：
- **USER**（用户名）：注册手机号或账号
- **UKEY**（密钥）：在"设置"->"开发者密钥"中获取
- **SN**（打印机编号）：打印机设备编号

**步骤 3: 配置环境变量**

在 `.env` 或 `.env.local` 文件中添加：
```bash
# 飞鹅云打印配置
FEYIN_API_URL=https://api.feieyun.cn/Api/Open/
FEYIN_USER=your_username_or_phone
FEYIN_UKEY=your_ukey_from_dashboard
FEYIN_SN=your_printer_sn
```

**步骤 4: 启用云打印**

在应用启动时配置（例如 `App.tsx` 或 `Settings.tsx`）：
```typescript
import { PrinterService } from './services/printer';

// 启用云打印模式
PrinterService.configure({
  mode: 'cloud',
  cloud: {
    apiUrl: import.meta.env.VITE_FEYIN_API_URL || 'https://api.feieyun.cn/Api/Open/',
    user: import.meta.env.VITE_FEYIN_USER || '',
    ukey: import.meta.env.VITE_FEYIN_UKEY || '',
    sn: import.meta.env.VITE_FEYIN_SN || '',
  },
});
```

**步骤 5: 测试打印**
```typescript
// 打印订单
await PrinterService.printOrder({
  id: 'TEST-001',
  items: [{ name: '宫保鸡丁', quantity: 1, price: 28 }],
  total: 28,
  tableId: '8',
  timestamp: new Date().toISOString(),
});
```

#### 方式 3: USB/蓝牙打印机（开发中）
⚠️ **暂未实现**，计划支持 WebUSB API

### 打印内容格式（订单小票，80mm 热敏纸）
```
     江西酒店 Jiangxi Hotel
       Pasay City, Manila
--------------------------------
订单号: ORD-20231222-001
桌号: 8
时间: 2023-12-22 15:30:45
--------------------------------
宫保鸡丁              ₱28.00
  1 x ₱28.00 = ₱28.00
西红柿炒蛋            ₱18.00
  1 x ₱18.00 = ₱18.00
--------------------------------
总计:                 ₱46.00
================================
      谢谢惠顾 Thank You!
     欢迎再次光临!
```

### 常见问题

**Q1: 云打印失败，显示"签名错误"？**
**A**: 检查 UKEY 是否正确，确保从飞鹅云后台复制完整密钥

**Q2: 浏览器打印被拦截？**
**A**: 允许浏览器弹出窗口权限，或使用云打印方式

**Q3: 菲律宾能用飞鹅云打印机吗？**
**A**: 可以！飞鹅云支持海外使用，只需确保打印机能联网

**Q4: 打印成本如何？**
**A**: 
- 浏览器打印：免费（用户自己的打印机）
- 云打印：¥0.1-0.3/张（流量费）
- USB打印机：一次性购买 ¥800-2000

**推荐方案**：先使用浏览器打印快速上线，业务稳定后升级为云打印服务。

## Vercel部署指南

### 环境配置

#### 环境变量设置
在 Vercel 项目的 `Settings -> Environment Variables` 中添加：

| 变量名 | 说明 | 示例 |
|-------|------|------|
| `VITE_ADMIN_USER` | 管理员账号 | admin |
| `VITE_ADMIN_PASS` | 管理员密码 | 您的强密码 |
| `DB_TYPE` | 数据库类型 (memory, neon) | neon (生产环境) |
| `NEON_CONNECTION_STRING` | Neon数据库连接字符串 (当DB_TYPE=neon时) | `postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require` |
| `VITE_APP_URL` | 应用URL，用于二维码生成 (可选) | https://your-app.vercel.app |

### 部署步骤

#### 1. 部署到Vercel
1. 在GitHub中创建新仓库并推送代码
2. 在Vercel中导入项目
3. 设置环境变量
4. 部署应用

#### 2. 初始化生产数据
部署完成后：
1. 访问系统设置面板
2. 点击"状态检查"确认数据库连接正常
3. 点击"初始化系统数据"创建基础数据（需要认证）

#### 3. 数据验证
- 系统将自动创建以下数据表和初始数据：
  - 酒店房间：64个房间（8201-8232, 8301-8332）
  - KTV房间：1个房间
  - 菜品：8个示例菜品
  - 支付方式：5种支付方式
  - 库存：5个库存项目
  - 签单账户：2个示例账户
  - 系统设置：默认配置

### 数据库切换

#### 从内存数据库切换到Neon数据库
1. 更新环境变量 `DB_TYPE=neon`
2. 重启应用
3. 运行数据迁移（如果需要从现有内存数据迁移）

#### 数据迁移
如果需要从内存数据库迁移到Neon数据库：
1. 确保Neon连接字符串正确配置
2. 调用 `/api/migrate` 端点（需要认证）
3. 确认数据迁移成功

### 安全注意事项
- 生产环境务必使用强密码
- 定期备份数据库
- 监控API访问日志
- 使用HTTPS连接

### 运维操作
- 数据同步：通过设置面板一键同步
- 数据备份：自动关联Git Commit Hash
- 操作审计：记录所有敏感操作
- 状态监控：实时检查数据库连接状态

## 部署检查清单

### 部署前准备

#### 1. Neon数据库设置
- [ ] 在 https://neon.tech/ 创建账户
- [ ] 创建新的Neon项目
- [ ] 获取数据库连接字符串
- [ ] 记录连接字符串以备后用

#### 2. 环境变量配置
- [ ] `DB_TYPE=neon` (生产环境)
- [ ] `NEON_CONNECTION_STRING=your_connection_string` 
- [ ] `VITE_ADMIN_USER=your_admin_username`
- [ ] `VITE_ADMIN_PASS=your_secure_password`
- [ ] `VITE_APP_URL=your_app_url` (可选，用于二维码)

#### 3. 代码准备
- [ ] 确认所有功能已测试通过
- [ ] 确认构建命令 `npm run build` 成功
- [ ] 确认初始数据表已完善 (dishes, rooms, payments等)

### 部署步骤

#### 1. 代码部署
- [ ] 将代码推送到GitHub仓库
- [ ] 在Vercel中导入项目
- [ ] 配置环境变量
- [ ] 触发自动部署

#### 2. 数据初始化
- [ ] 部署完成后访问应用
- [ ] 进入系统设置面板
- [ ] 点击"初始化系统数据"按钮
- [ ] 确认数据初始化成功

#### 3. 功能验证
- [ ] 测试"状态检查"功能 - 确认数据库连接正常
- [ ] 测试"数据同步"功能 - 确认备份正常
- [ ] 测试菜品管理功能 - 确认CRUD操作正常
- [ ] 测试订单管理功能 - 确认订单流程正常
- [ ] 测试酒店房间管理 - 确认房间状态更新正常
- [ ] 测试KTV管理功能 - 确认预订功能正常

### 转移完成确认

#### 数据完整性检查
- [ ] 酒店房间数据：64个房间已创建
- [ ] KTV房间数据：1个房间已创建  
- [ ] 菜品数据：8个示例菜品已创建
- [ ] 支付方式：5种支付方式已创建
- [ ] 库存数据：5个库存项目已创建
- [ ] 签单账户：2个示例账户已创建
- [ ] 系统设置：默认配置已创建

#### 性能验证
- [ ] 页面加载时间 < 3秒
- [ ] API响应时间 < 1秒
- [ ] 数据库连接稳定
- [ ] 并发访问正常

#### 安全验证
- [ ] 敏感API端点需要认证
- [ ] 数据访问权限控制正常
- [ ] 日志中不包含敏感信息
- [ ] HTTPS连接正常

### 后续维护

#### 定期任务
- [ ] 定期备份数据库
- [ ] 监控系统性能
- [ ] 检查错误日志
- [ ] 更新安全凭据

#### 应急预案
- [ ] 数据库连接失败时的处理流程
- [ ] 系统故障时的恢复流程
- [ ] 数据备份和恢复流程

### 部署完成
当所有检查项都完成后，您的江西酒店管理系统就已经成功从模拟数据库转移到了正式的Neon PostgreSQL数据库上，可以正式投入生产使用了。

## 发布说明

### 江西酒店管理系统 v2.1.0

#### 版本发布准备

**代码质量:**
- [x] 所有功能模块完成开发
- [x] 代码通过构建验证
- [x] 无关键错误或警告
- [x] 符合代码规范

**文档完整:**
- [x] API文档完整
- [x] 部署文档完整
- [x] 用户手册完整
- [x] 维护文档完整

**测试验证:**
- [x] 功能测试通过
- [x] 集成测试通过
- [x] 部署测试通过
- [x] 性能测试通过

#### 管理面板API集成

**已集成的API端点:**
- `/api/auth/login` - 用户认证
- `/api/db-config` - 数据库配置管理
- `/api/db-status` - 数据库状态检查
- `/api/test-connection` - 数据库连接测试
- `/api/seed` - 数据初始化
- `/api/snapshot` - 数据快照管理（备份、恢复、比较）
- `/api/audit-log` - 审计日志查看
- `/api/roles` - 角色管理
- `/api/users` - 用户管理
- `/api/migrate` - 数据库迁移

所有API端点均已通过管理面板集成验证

#### 安全措施

**API安全**
- [x] 敏感端点Basic Authentication
- [x] 数据恢复操作权限控制
- [x] 系统初始化权限控制

**数据安全**
- [x] 生产环境日志屏蔽敏感信息
- [x] 数据库连接加密
- [x] 用户凭据保护

**操作安全**
- [x] 操作审计日志记录
- [x] 数据备份和恢复验证
- [x] 用户权限验证

#### 功能完整性验证

**核心业务功能:**
- [x] 酒店房间管理 - 64个房间完整支持
- [x] 菜品管理 - 支持完整CRUD操作
- [x] 订单管理 - 支持完整生命周期
- [x] KTV管理 - 支持预订和计费
- [x] 财务系统 - 支持支出和统计
- [x] 库存管理 - 支持跟踪和提醒
- [x] 签单系统 - 支持企业账户管理
- [x] 权限管理 - 支持用户和角色管理

**运维功能:**
- [x] 数据同步 - 一键同步功能
- [x] 数据备份 - 自动快照功能
- [x] 数据恢复 - 安全恢复功能
- [x] 状态监控 - 实时状态检查
- [x] 审计日志 - 完整操作记录

#### 发布说明

江西酒店管理系统 v2.1.0 现已准备就绪，可以部署到生产环境。系统具备完整的酒店管理功能、完善的云同步机制和安全的权限控制，能够满足酒店业务的全面需求。

系统管理员可以通过管理面板直接执行所有运维操作，实现了真正的"一键式"云端同步管理。