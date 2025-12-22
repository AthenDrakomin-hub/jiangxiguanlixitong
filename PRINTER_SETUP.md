# 打印功能配置指南

本项目支持三种打印方式，请根据实际需求选择：

---

## 📖 方式对比

| 方式 | 优点 | 缺点 | 成本 | 推荐场景 |
|------|------|------|------|----------|
| **浏览器打印** | 免费、即开即用 | 样式控制有限 | ¥0 | 快速上线、客户自助打印 |
| **云打印服务** | 稳定、支持多设备 | 需付费 | ¥0.1-0.3/张 | **推荐** 多设备、远程打印 |
| **USB/蓝牙打印机** | 速度快、成本低 | 需硬件、浏览器兼容性差 | ¥800-2000 | 收银台固定设备 |

---

## 🚀 快速开始

### 方式 1: 浏览器打印（默认）

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

---

### 方式 2: 云打印服务（推荐）⭐

#### 步骤 1: 购买云打印机

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

#### 步骤 2: 获取 API 凭证

登录飞鹅云后台，获取以下信息：
- **USER**（用户名）：注册手机号或账号
- **UKEY**（密钥）：在"设置"->"开发者密钥"中获取
- **SN**（打印机编号）：打印机设备编号

#### 步骤 3: 配置环境变量

在 `.env` 或 `.env.local` 文件中添加：

```bash
# 飞鹅云打印配置
FEYIN_API_URL=https://api.feieyun.cn/Api/Open/
FEYIN_USER=your_username_or_phone
FEYIN_UKEY=your_ukey_from_dashboard
FEYIN_SN=your_printer_sn
```

#### 步骤 4: 启用云打印

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

#### 步骤 5: 测试打印

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

---

### 方式 3: USB/蓝牙打印机（开发中）

⚠️ **暂未实现**，计划支持 WebUSB API

---

## 🛠️ 代码示例

### Settings.tsx 中配置云打印

```typescript
import { PrinterService } from '../services/printer';

const Settings = () => {
  const [printerMode, setPrinterMode] = useState<'browser' | 'cloud'>('browser');
  const [cloudConfig, setCloudConfig] = useState({
    user: '',
    ukey: '',
    sn: '',
  });

  const handleSavePrinterConfig = () => {
    PrinterService.configure({
      mode: printerMode,
      cloud: printerMode === 'cloud' ? {
        apiUrl: 'https://api.feieyun.cn/Api/Open/',
        ...cloudConfig,
      } : undefined,
    });
    alert('打印配置已保存！');
  };

  return (
    <div>
      <h3>打印设置</h3>
      <select value={printerMode} onChange={(e) => setPrinterMode(e.target.value as any)}>
        <option value="browser">浏览器打印</option>
        <option value="cloud">云打印服务</option>
      </select>

      {printerMode === 'cloud' && (
        <div>
          <input
            placeholder="飞鹅云用户名"
            value={cloudConfig.user}
            onChange={(e) => setCloudConfig({ ...cloudConfig, user: e.target.value })}
          />
          <input
            placeholder="飞鹅云 UKEY"
            value={cloudConfig.ukey}
            onChange={(e) => setCloudConfig({ ...cloudConfig, ukey: e.target.value })}
          />
          <input
            placeholder="打印机 SN"
            value={cloudConfig.sn}
            onChange={(e) => setCloudConfig({ ...cloudConfig, sn: e.target.value })}
          />
        </div>
      )}

      <button onClick={handleSavePrinterConfig}>保存配置</button>
    </div>
  );
};
```

---

## 📝 打印内容格式

### 订单小票（80mm 热敏纸）

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

---

## ❓ 常见问题

### Q1: 云打印失败，显示"签名错误"？
**A**: 检查 UKEY 是否正确，确保从飞鹅云后台复制完整密钥

### Q2: 浏览器打印被拦截？
**A**: 允许浏览器弹出窗口权限，或使用云打印方式

### Q3: 菲律宾能用飞鹅云打印机吗？
**A**: 可以！飞鹅云支持海外使用，只需确保打印机能联网

### Q4: 打印成本如何？
**A**: 
- 浏览器打印：免费（用户自己的打印机）
- 云打印：¥0.1-0.3/张（流量费）
- USB打印机：一次性购买 ¥800-2000

---

## 📞 技术支持

- 飞鹅云文档: https://www.feieyun.com/open/index.html
- 项目 Issues: https://github.com/your-repo/issues

---

**推荐方案**：先使用浏览器打印快速上线，业务稳定后升级为云打印服务。
