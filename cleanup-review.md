# 项目清理审核清单

## 可以清理的文件

### 1. 测试和验证相关文件
- [x] `check-api.js` - API检查脚本
- [x] `check-table-structure.js` - 表结构检查脚本
- [x] `test-db-connection.js` - 数据库连接测试脚本
- [x] `test-github-sync.js` - GitHub同步测试脚本

### 2. 部署验证文件
- [x] `scripts/deployment-validation.js` - 部署验证脚本
- [x] `scripts/deployment-validation.ts` - 部署验证脚本TypeScript版本

### 3. 部署前检查文件
- [x] `scripts/pre-deploy-check.js` - 部署前检查脚本

### 4. 模板和说明文件
- [x] `MENU_IMPORT_INSTRUCTIONS.txt` - 菜单导入说明
- [x] `menu_template.csv` - 菜单模板CSV文件

### 5. 配置文件
- [x] `config/appConfig.ts` - 应用配置文件（如果内容简单可内联）

### 6. 工具Hook
- [x] `hooks/useDebouncedAutoSave.ts` - 防抖自动保存Hook（如果未使用）

### 7. 工具函数
- [x] `utils/performance.ts` - 性能工具函数
- [x] `utils/security.ts` - 安全工具函数

### 8. 测试组件
- [x] `src/AutoDetectTest.tsx` - 自动检测测试组件
- [x] `src/pwa-test.ts` - PWA测试文件
- [x] `src/autodetect-validation.ts` - 自动检测验证文件

## 项目中存在的占位符和虚拟数据

### 1. 默认管理员凭据
- `.env.local` 和 `.env.example` 中的默认凭据：
  ```
  VITE_ADMIN_USER=admin
  VITE_ADMIN_PASS=jx88888888
  ```

### 2. 组件中的虚拟数据
- `services/mockData.ts` - 包含初始空数据的模拟数据文件，其中KTV房间数据为预设值

### 3. 默认配置
- `utils/i18n.ts` - 包含三种语言(zh-CN, en, fil)的默认翻译字典
- `services/storage.ts` - 包含默认存储配置，包含S3、GitHub和TiDB的默认配置占位符

### 4. 打印服务中的测试数据
- `services/printer.ts` - 包含默认商店信息占位符：
  ```javascript
  return {
    name: '江西酒店 Jiangxi Hotel',
    address: 'Pasay City',
    phone: '',
    openingHours: '10:00 - 02:00',
    wifiSsid: '',
    wifiPassword: ''
  };
  ```

## 建议操作

### 清理文件
1. 审核并删除不必要的测试和验证文件
2. 删除重复的部署验证脚本
3. 删除菜单模板和说明文件（如果不再需要）
4. 检查并可能删除未使用的配置和工具文件
5. 删除测试组件和相关文件

### 处理占位符和虚拟数据
1. 更改默认管理员凭据或使其可配置
2. 检查并清理组件中的虚拟数据
3. 评估配置文件中的默认值是否合适
4. 更新打印服务中的默认商店信息