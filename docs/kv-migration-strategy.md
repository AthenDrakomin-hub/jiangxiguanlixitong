// kv-migration-strategy.md

# Vercel KV (Upstash) 迁移策略

## 当前架构分析

### Blob Storage 使用情况
1. **数据存储**: 使用 `@vercel/blob` 包存储 JSON 数据
2. **API 层**: `api/index.ts` 提供 RESTful 接口访问 Blob 数据
3. **数据结构**: 每个实体类型存储为单独的 JSON 文件
4. **访问模式**: 通过前缀列表和单独文件访问

### 存储的数据类型
- dishes (菜品)
- orders (订单)
- expenses (支出)
- inventory (库存)
- ktv_rooms (KTV房间)
- sign_bill_accounts (签单账户)
- hotel_rooms (酒店房间)
- payment_methods (支付方式)

## 迁移目标

将数据存储从 Vercel Blob Storage 迁移到 Vercel KV (基于 Upstash Redis)

## 迁移策略

### 1. 数据模型转换

#### Blob Storage 方式
```
dishes/dish1.json
dishes/dish2.json
orders/order1.json
orders/order2.json
```

#### KV Storage 方式
```
dishes:dish1 -> {JSON data}
dishes:dish2 -> {JSON data}
orders:order1 -> {JSON data}
orders:order2 -> {JSON data}
dishes:index -> ["dish1", "dish2", ...]
orders:index -> ["order1", "order2", ...]
```

### 2. 键命名规范

| 实体类型 | 键格式 | 示例 |
|---------|-------|------|
| 菜品 | `dishes:{id}` | `dishes:item123` |
| 订单 | `orders:{id}` | `orders:ord456` |
| 支出 | `expenses:{id}` | `expenses:exp789` |
| 库存 | `inventory:{id}` | `inventory:inv012` |
| KTV房间 | `ktv_rooms:{id}` | `ktv_rooms:ktv345` |
| 签单账户 | `sign_bill_accounts:{id}` | `sign_bill_accounts:sba678` |
| 酒店房间 | `hotel_rooms:{id}` | `hotel_rooms:hr901` |
| 索引 | `{entity_type}:index` | `dishes:index` |

### 3. 索引管理

为了模拟 Blob 的列表功能，我们需要维护每个实体类型的索引：

```
// 添加新项目时
SET dishes:newid {JSON}
SADD dishes:index newid

// 删除项目时
DEL dishes:deleteid
SREM dishes:index deleteid

// 获取所有项目
SMEMBERS dishes:index
GET dishes:id1
GET dishes:id2
...
```

## 迁移步骤

### 第一阶段：基础设施准备
1. 创建 Upstash Redis 数据库
2. 配置环境变量
3. 安装 `@upstash/redis` 客户端

### 第二阶段：并行数据访问层
1. 创建 KV 客户端封装
2. 修改 API 层同时支持 Blob 和 KV
3. 添加配置选项切换存储后端

### 第三阶段：数据迁移
1. 创建迁移脚本从 Blob 到 KV
2. 执行数据迁移
3. 验证数据完整性

### 第四阶段：切换和清理
1. 切换应用到 KV 存储
2. 移除 Blob 相关代码
3. 清理旧的 Blob 数据（可选）

## 技术实现细节

### KV 客户端封装

```typescript
// kv-client.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const kvClient = {
  // 获取单个项目
  async get(key: string) {
    const data = await redis.get(key);
    return data ? JSON.parse(data as string) : null;
  },
  
  // 设置单个项目
  async set(key: string, value: any) {
    return await redis.set(key, JSON.stringify(value));
  },
  
  // 删除单个项目
  async del(key: string) {
    return await redis.del(key);
  },
  
  // 获取索引
  async getIndex(entityType: string) {
    const indexKey = `${entityType}:index`;
    return await redis.smembers(indexKey);
  },
  
  // 添加到索引
  async addToIndex(entityType: string, id: string) {
    const indexKey = `${entityType}:index`;
    return await redis.sadd(indexKey, id);
  },
  
  // 从索引删除
  async removeFromIndex(entityType: string, id: string) {
    const indexKey = `${entityType}:index`;
    return await redis.srem(indexKey, id);
  }
};
```

### API 层修改

```typescript
// api/index.ts (修改后)
import { kvClient } from '../lib/kv-client';
import { put, list, del as blobDel } from '@vercel/blob';

// 配置选项
const USE_KV_STORAGE = process.env.USE_KV_STORAGE === 'true';

// 根据配置选择存储后端
async function getData(collectionName: string) {
  if (USE_KV_STORAGE) {
    // 使用 KV 存储
    const ids = await kvClient.getIndex(collectionName);
    const items = [];
    for (const id of ids) {
      const item = await kvClient.get(`${collectionName}:${id}`);
      if (item) items.push(item);
    }
    return items;
  } else {
    // 使用 Blob 存储
    const blobList = await list({ prefix: `${collectionName}/` });
    const items = [];
    for (const blob of blobList.blobs) {
      const response = await fetch(blob.url);
      const item = await response.json();
      items.push(item);
    }
    return items;
  }
}
```

## 迁移脚本

```javascript
// scripts/migrate-blob-to-kv.js
import { list } from '@vercel/blob';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

const COLLECTIONS = [
  'dishes', 'orders', 'expenses', 'inventory',
  'ktv_rooms', 'sign_bill_accounts', 'hotel_rooms'
];

async function migrateCollection(collectionName) {
  console.log(`Migrating ${collectionName}...`);
  
  // 从 Blob 获取数据
  const blobList = await list({ prefix: `${collectionName}/` });
  const ids = [];
  
  for (const blob of blobList.blobs) {
    const response = await fetch(blob.url);
    const item = await response.json();
    
    // 提取 ID（假设文件名为 {id}.json）
    const id = blob.pathname.split('/').pop().replace('.json', '');
    
    // 存储到 KV
    await redis.set(`${collectionName}:${id}`, JSON.stringify(item));
    ids.push(id);
    
    console.log(`  Migrated ${id}`);
  }
  
  // 更新索引
  if (ids.length > 0) {
    const indexKey = `${collectionName}:index`;
    await redis.del(indexKey); // 清除旧索引
    await redis.sadd(indexKey, ...ids); // 添加新索引
  }
  
  console.log(`Completed ${collectionName}: ${ids.length} items`);
}

async function main() {
  for (const collection of COLLECTIONS) {
    await migrateCollection(collection);
  }
  console.log('Migration completed!');
}

main();
```

## 风险和缓解措施

### 风险 1: 数据不一致
**缓解**: 使用事务或原子操作确保数据一致性

### 风险 2: 迁移过程中数据变更
**缓解**: 在低峰期执行迁移，或实现增量同步机制

### 风险 3: 性能问题
**缓解**: 对 KV 查询进行适当缓存，优化索引结构

## 验证计划

1. **数据完整性验证**: 比较迁移前后数据
2. **性能基准测试**: 对比 Blob 和 KV 访问速度
3. **功能测试**: 确保所有应用功能正常工作
4. **回滚计划**: 准备快速切换回 Blob 存储的方案