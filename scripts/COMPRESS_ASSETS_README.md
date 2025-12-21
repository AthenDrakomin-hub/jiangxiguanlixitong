# 前端资源压缩工具

本工具提供安全的前端资源压缩功能，避免DEP0190警告和安全风险。

## 功能

### compressOrderJS(location)
安全地压缩单个客房点餐页面的JS文件。

```javascript
import { compressOrderJS } from './scripts/compress-frontend-assets.js';

// 压缩客房8201的JS文件
await compressOrderJS('8201');
```

### compressAllOrderJS(pattern)
安全地批量压缩所有客房点餐页面的JS文件。

```javascript
import { compressAllOrderJS } from './scripts/compress-frontend-assets.js';

// 批量压缩所有客房JS文件
await compressAllOrderJS('order-*.js');
```

## 命令行使用

```bash
# 压缩单个客房JS文件
npm run compress-assets 8201

# 批量压缩所有客房JS文件
npm run compress-assets-all
```

## 安全特性

1. **参数验证**：严格验证客房号格式，防止命令注入
2. **方案1**：对于不需要shell特性的命令，移除`shell: true`选项
3. **方案2**：对于需要shell特性的命令，使用`shell-quote`库自动转义参数
4. **白名单校验**：使用白名单机制验证输入参数
5. **错误处理**：完善的错误处理和日志记录

## 解决的警告

- `DEP0190`: 通过移除`shell: true`选项或安全地处理命令字符串来解决此警告