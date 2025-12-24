# 测试目录

此目录包含项目的各种测试脚本和测试文件。

## 测试脚本列表

### Neon 数据库连接测试
- **文件**: `test-neon-connection.ts`
- **用途**: 测试与 Neon 数据库的连接
- **运行命令**: `npm run test:neon`

要运行此测试，需要先在 `.env` 文件中配置正确的 `NEON_CONNECTION_STRING`。

## 运行测试

```bash
# 运行 Neon 数据库连接测试
npm run test:neon
```

## 添加新测试

所有新的测试脚本都应该放在这个目录中，并在上面的列表中添加相应的说明。