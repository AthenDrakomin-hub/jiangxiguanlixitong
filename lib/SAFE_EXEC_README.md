# 安全执行工具 (Safe Execution Utilities)

本模块提供了一套安全的执行工具，用于防止 `DEP0190` 警告和安全问题，特别是在使用 `child_process` 函数时。

## 功能

### safeSpawn(command, args, options)

安全地启动子进程，避免 shell 注入风险。

```javascript
import { safeSpawn } from './lib/safe-exec.js';

// 安全的方式启动子进程（推荐）
const child = safeSpawn('uglifyjs', [
  './public/order-8201.js',
  '-o',
  './public/order-8201.min.js',
]);
```

### safeExecWithShell(command, args, options)

安全地执行带有 shell 选项的命令。

```javascript
import { safeExecWithShell } from './lib/safe-exec.js';

// 必须使用 shell 时的安全方式
const child = safeExecWithShell('uglifyjs', [
  './public/order-*.js',
  '-o',
  './public/order.min.js',
]);
```

### validateLocation(location)

验证和清理前端生成的位置参数（如房间号）。

```javascript
import { validateLocation } from './lib/safe-exec.js';

// 验证房间号参数
const location = validateLocation(req.query.location);
if (!location) {
  return res.status(400).send('无效的客房号');
}
```

### escapeHtml(str)

转义 HTML 以防止 XSS 攻击。

```javascript
import { escapeHtml } from './lib/safe-exec.js';

// 转义用户输入
const safeLocation = escapeHtml(location);
```

## 最佳实践

1. **优先使用 `safeSpawn`**：除非必须使用 shell 特性，否则应避免使用 `shell: true` 选项
2. **参数验证**：始终验证传递给子进程的参数
3. **位置参数校验**：对用于生成前端界面的位置参数进行严格校验
4. **HTML 转义**：在生成前端界面时转义所有用户输入

## 解决的警告

- `DEP0190`: 通过移除 `shell: true` 选项或安全地处理命令字符串来解决此警告
