# 测试脚本说明

此文件夹包含用于测试和维护系统的各种脚本。

## 脚本列表

1. **cleanup-duplicate-dishes.ts** - 清理重复菜品并修复索引数据类型错误
2. **verify-cleaned-data.ts** - 验证清理后的菜品数据
3. **rebuild-dish-indexes.ts** - 重建菜品索引
4. **prod-verification.ts** - 生产环境功能验证脚本
5. **fix-data-structures.ts** - 修复数据结构问题
6. **check-data-structure.ts** - 检查数据实际结构
7. **test-connection-local.ts** - 本地数据库连接测试脚本
8. **test-env.ts** - 环境变量测试脚本
9. **test-list-keys.ts** - 列出数据库中所有键值对的测试脚本
10. **verify-data-match.ts** - 验证数据库数据与项目代码匹配性的脚本
11. **api-test-connection.ts** - API端的数据库连接测试脚本
12. **api-test-db.ts** - API端的数据库功能测试脚本

## 运行方法

要运行任何脚本，请使用以下命令：

```bash
$env:KV_REST_API_URL="your_upstash_endpoint"; $env:KV_REST_API_TOKEN="your_upstash_token"; npx tsx test-scripts/[脚本名称]
```

例如：
```bash
$env:KV_REST_API_URL="https://suited-bream-41078.upstash.io"; $env:KV_REST_API_TOKEN="AaB2AAIncDE2MDExNzc0NzZmZDM0M2FiOTc2YjZhOTU1ZGFkODM3Y3AxNDEwNzg"; npx tsx test-scripts/prod-verification.ts
```