# 数据库初始化指南

本指南介绍如何为酒店管理系统初始化数据库和初始数据。

## 1. 安装依赖

确保项目已安装Neon数据库驱动：

```bash
npm install @neondatabase/serverless
```

## 2. 环境变量配置

在运行初始化脚本之前，需要配置数据库连接字符串。在`.env`文件中添加：

```env
NEON_CONNECTION_STRING=postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
# 或者使用 DATABASE_URL
DATABASE_URL=postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
```

## 3. 使用TypeScript初始化脚本

### 方法一：使用TypeScript脚本（推荐）

运行TypeScript初始化脚本：

```bash
# 使用tsx运行脚本
npx tsx init-neon-db-simple.ts
```

或者使用esrun：

```bash
npx esrun init-neon-db-simple.ts
```

### 方法二：使用SQL脚本

直接在Neon控制台或psql中执行SQL脚本：

```bash
psql -d "your_neon_connection_string" -f init-data.sql
```

## 4. 初始化内容

初始化脚本将创建以下数据：

### 表结构
- `kv_store` - 键值存储表，用于存储所有应用数据

### 初始数据
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

## 5. 验证初始化

初始化完成后，可以通过以下方式验证：

```sql
-- 检查菜品数量
SELECT COUNT(*) FROM kv_store WHERE key LIKE 'dishes:%';

-- 检查酒店房间数量
SELECT COUNT(*) FROM kv_store WHERE key LIKE 'hotel_rooms:%';

-- 检查所有数据
SELECT COUNT(*) FROM kv_store;
```

## 6. 故障排除

### 连接问题
- 确保连接字符串格式正确
- 检查防火墙设置
- 验证用户名和密码

### 权限问题
- 确保数据库用户有足够的权限创建表和插入数据

### 重复初始化
- 脚本使用 `ON CONFLICT (key) DO NOTHING` 避免重复插入
- 如果需要重新初始化，请先清空表数据

## 7. 自定义数据

如果需要修改初始数据，请编辑 `init-data.sql` 文件中的INSERT语句，然后重新运行初始化脚本。

## 8. 生产环境部署

在生产环境中，建议：

1. 使用Vercel环境变量配置数据库连接
2. 在部署脚本中自动运行初始化脚本
3. 备份重要数据