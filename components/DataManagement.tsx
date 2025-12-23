import React, { useState } from 'react';
import { Plus, Upload, Download, Zap, X } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface DataManagementProps {
  onDataUpdate?: () => void;
}

interface FieldDefinition {
  key: string;
  label: string;
  type: string;
  options?: string[];
}

interface FormData {
  [key: string]: string | number | boolean | undefined;
}

const DataManagement: React.FC<DataManagementProps> = ({ onDataUpdate }) => {
  const [activeTab, setActiveTab] = useState('dishes');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({});

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // 表格定义
  const tables = [
    { id: 'dishes', name: '菜品管理' },
    { id: 'orders', name: '订单管理' },
    { id: 'expenses', name: '费用管理' },
    { id: 'inventory', name: '库存管理' },
    { id: 'ktv_rooms', name: 'KTV房间' },
    { id: 'sign_bill_accounts', name: '挂账账户' },
    { id: 'hotel_rooms', name: '酒店房间' },
    { id: 'payment_methods', name: '支付方式' },
  ];

  // 字段定义
  const fieldDefinitions: Record<string, FieldDefinition[]> = {
    dishes: [
      { key: 'name', label: '菜品名称', type: 'text' },
      { key: 'description', label: '描述', type: 'text' },
      { key: 'price', label: '价格', type: 'number' },
      { key: 'category', label: '分类', type: 'text' },
      { key: 'available', label: '是否可用', type: 'checkbox' },
      { key: 'spiciness', label: '辣度(0-3)', type: 'number' },
    ],
    orders: [
      { key: 'tableNumber', label: '桌号', type: 'text' },
      {
        key: 'source',
        label: '来源',
        type: 'select',
        options: ['LOBBY', 'ROOM_SERVICE', 'KTV', 'TAKEOUT'],
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: ['待处理', '烹饪中', '已上菜', '已支付', '已完成', '已取消'],
      },
      { key: 'totalAmount', label: '总金额', type: 'number' },
      { key: 'notes', label: '备注', type: 'text' },
      {
        key: 'paymentMethod',
        label: '支付方式',
        type: 'select',
        options: [
          'CASH',
          'WECHAT',
          'ALIPAY',
          'USDT',
          'GCASH',
          'MAYA',
          'UNIONPAY',
          'CREDIT_CARD',
          'SIGN_BILL',
        ],
      },
    ],
    expenses: [
      { key: 'amount', label: '金额', type: 'number' },
      {
        key: 'category',
        label: '分类',
        type: 'select',
        options: [
          '食材采购',
          '员工工资',
          '店铺租金',
          '水电煤气',
          '维修保养',
          '其他支出',
        ],
      },
      { key: 'description', label: '描述', type: 'text' },
      { key: 'date', label: '日期', type: 'date' },
    ],
    inventory: [
      { key: 'name', label: '物品名称', type: 'text' },
      { key: 'quantity', label: '数量', type: 'number' },
      { key: 'unit', label: '单位', type: 'text' },
      { key: 'minThreshold', label: '最低阈值', type: 'number' },
    ],
    ktv_rooms: [
      { key: 'name', label: '房间名称', type: 'text' },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: ['Available', 'InUse', 'Cleaning', 'Maintenance'],
      },
      { key: 'hourlyRate', label: '小时费率', type: 'number' },
    ],
    sign_bill_accounts: [
      { key: 'name', label: '客户名称', type: 'text' },
      { key: 'cooperationMethod', label: '合作方式', type: 'text' },
      { key: 'settlementMethod', label: '结算方式', type: 'text' },
      { key: 'approver', label: '批准人', type: 'text' },
      { key: 'phoneNumber', label: '电话号码', type: 'text' },
      { key: 'creditLimit', label: '信用额度', type: 'number' },
      { key: 'currentDebt', label: '当前欠款', type: 'number' },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: ['Active', 'Inactive'],
      },
    ],
    hotel_rooms: [
      { key: 'number', label: '房间号', type: 'text' },
      { key: 'floor', label: '楼层', type: 'number' },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: ['Vacant', 'Occupied'],
      },
      { key: 'guestName', label: '客人姓名', type: 'text' },
      { key: 'dailyRate', label: '日费率', type: 'number' },
    ],
    payment_methods: [
      { key: 'name', label: '名称', type: 'text' },
      { key: 'englishName', label: '英文名称', type: 'text' },
      { key: 'isEnabled', label: '是否启用', type: 'checkbox' },
      {
        key: 'paymentType',
        label: '支付类型',
        type: 'select',
        options: [
          'CASH',
          'WECHAT',
          'ALIPAY',
          'USDT',
          'GCASH',
          'MAYA',
          'UNIONPAY',
          'CREDIT_CARD',
          'SIGN_BILL',
        ],
      },
      { key: 'currency', label: '货币', type: 'text' },
      { key: 'exchangeRate', label: '汇率', type: 'number' },
      { key: 'sortOrder', label: '排序', type: 'number' },
    ],
  };

  const handleAddNew = () => {
    setFormData({});
    setShowForm(true);
  };

  const handleFormChange = (key: string, value: string | number | boolean) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      // 生成唯一ID
      const dataWithId = {
        id:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await apiClient.create(activeTab, dataWithId);

      // 重置表单
      setFormData({});
      setShowForm(false);

      // 通知父组件数据已更新
      if (onDataUpdate) onDataUpdate();

      setSuccess('数据添加成功！');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('添加数据失败:', error);
      setError('添加数据失败，请重试');
    }
  };



  // 初始化示例数据
  const handleSeedData = async () => {
    if (!confirm('确认要初始化数据吗？\n\n这将统计现有数据量，不会添加任何示例数据。')) {
      return;
    }

    setSeeding(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.seed();
      
      if (response.success) {
        const created = response.created || {};
        const message =
          `✅ 数据初始化成功！\n` +
          `- 菜品: ${created.dishes || 0} 条\n` +
          `- 库存: ${created.inventory || 0} 条\n` +
          `- KTV房间: ${created.ktv_rooms || 0} 个\n` +
          `- 酒店房间: ${created.hotel_rooms || 0} 个\n` +
          `- 支付方式: ${created.payment_methods || 0} 种`;
        
        setSuccess(message);
        
        // 通知父组件数据已更新
        if (onDataUpdate) onDataUpdate();
      } else {
        setError(`初始化失败: ${response.error || '未知错误'}`);
      }
    } catch (err) {
      console.error('数据初始化失败:', err);
      setError('数据初始化失败，请重试');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <X size={18} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          <div className="flex items-center gap-2">
            <Plus size={18} />
            <span className="font-medium whitespace-pre-line">{success}</span>
          </div>
        </div>
      )}

      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
        <Upload className="text-slate-400" size={20} /> 数据管理
      </h3>

      {/* 标签页 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => setActiveTab(table.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === table.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {table.name}
          </button>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          <Plus size={16} /> 添加新记录
        </button>

        <button
          onClick={handleSeedData}
          disabled={seeding}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Zap size={16} className={seeding ? 'animate-pulse' : ''} />
          {seeding ? '初始化中...' : '初始化示例数据'}
        </button>

        <button
          onClick={() => {
            // 生成当前表格类型的模板数据
            const fields = fieldDefinitions[activeTab] || [];
            let templateItems: Record<string, string | number | boolean>[] = [];

            // 根据不同表格类型生成不同的示例数据
            switch (activeTab) {
              case 'dishes':
                templateItems = [
                  {
                    name: '宫保鸡丁',
                    description: '经典川菜，微辣口感',
                    price: 38.0,
                    category: '主食',
                    available: true,
                    spiciness: 2,
                  },
                  {
                    name: '麻婆豆腐',
                    description: '嫩滑豆腐配麻辣酱汁',
                    price: 28.0,
                    category: '主食',
                    available: true,
                    spiciness: 3,
                  },
                ];
                break;

              case 'orders':
                templateItems = [
                  {
                    tableNumber: 'A01',
                    source: 'LOBBY',
                    status: 'Pending',
                    totalAmount: 128.5,
                    notes: '不要香菜，少盐',
                    paymentMethod: 'CASH',
                  },
                ];
                break;

              case 'expenses':
                templateItems = [
                  {
                    amount: 1250.0,
                    category: '食材采购',
                    description: '采购新鲜蔬菜和肉类',
                    date: new Date().toISOString().split('T')[0],
                  },
                ];
                break;

              case 'inventory':
                templateItems = [
                  {
                    name: '鸡胸肉',
                    quantity: 10,
                    unit: '公斤',
                    minThreshold: 5,
                  },
                ];
                break;

              case 'ktv_rooms':
                templateItems = [
                  {
                    name: 'VIP01',
                    status: 'Available',
                    hourlyRate: 88.0,
                  },
                ];
                break;

              case 'sign_bill_accounts':
                templateItems = [
                  {
                    name: 'ABC贸易公司',
                    cooperationMethod: '协议单位',
                    settlementMethod: '月结',
                    approver: '李经理',
                    phoneNumber: '+639123456789',
                    creditLimit: 10000.0,
                    currentDebt: 2500.0,
                    status: 'Active',
                  },
                ];
                break;

              case 'hotel_rooms':
                templateItems = [
                  {
                    number: '8201',
                    floor: 2,
                    status: 'Vacant',
                    guestName: '',
                    dailyRate: 288.0,
                  },
                  {
                    number: '8202',
                    floor: 2,
                    status: 'Vacant',
                    guestName: '',
                    dailyRate: 288.0,
                  },
                  {
                    number: '8301',
                    floor: 3,
                    status: 'Vacant',
                    guestName: '',
                    dailyRate: 288.0,
                  },
                  {
                    number: '8302',
                    floor: 3,
                    status: 'Vacant',
                    guestName: '',
                    dailyRate: 288.0,
                  },
                ];
                break;

              case 'payment_methods':
                templateItems = [
                  {
                    name: '现金支付',
                    englishName: 'Cash',
                    isEnabled: true,
                    paymentType: 'CASH',
                    currency: 'PHP',
                    exchangeRate: 1.0,
                    sortOrder: 1,
                  },
                ];
                break;

              default: {
                // 默认情况下，为每个字段生成示例值
                const templateItem: Record<string, string | number | boolean> =
                  {};
                fields.forEach((field) => {
                  switch (field.type) {
                    case 'number':
                      templateItem[field.key] =
                        field.key.includes('price') ||
                        field.key.includes('Amount') ||
                        field.key.includes('Rate')
                          ? 25.0
                          : field.key.includes('quantity') ||
                              field.key.includes('Quantity')
                            ? 5
                            : 0;
                      break;
                    case 'checkbox':
                      templateItem[field.key] = true;
                      break;
                    case 'select':
                      templateItem[field.key] =
                        field.options && field.options.length > 0
                          ? field.options[0]
                          : '';
                      break;
                    case 'date':
                      templateItem[field.key] = new Date()
                        .toISOString()
                        .split('T')[0];
                      break;
                    default:
                      if (field.key === 'name') {
                        templateItem[field.key] = `示例${field.label}`;
                      } else if (field.key === 'description') {
                        templateItem[field.key] =
                          `这是${field.label}的示例描述`;
                      } else {
                        templateItem[field.key] = `请输入${field.label}`;
                      }
                  }
                });
                templateItems = [templateItem];
              }
            }

            const formattedJson = JSON.stringify(templateItems, null, 2);

            // 复制到剪贴板，兼容更多浏览器
            if (navigator.clipboard && window.isSecureContext) {
              // 使用现代clipboard API
              navigator.clipboard
                .writeText(formattedJson)
                .then(() => {
                  alert(
                    `已复制${tables.find((t) => t.id === activeTab)?.name}模板到剪贴板\n\n模板内容:\n${formattedJson}`
                  );
                })
                .catch((err) => {
                  console.error('复制失败:', err);
                  fallbackCopyTextToClipboard(formattedJson);
                });
            } else {
              // 降级到document.execCommand方法
              fallbackCopyTextToClipboard(formattedJson);
            }

            // 降级复制方法
            function fallbackCopyTextToClipboard(text: string) {
              const textArea = document.createElement('textarea');
              textArea.value = text;

              // 避免滚动到底部
              textArea.style.top = '0';
              textArea.style.left = '0';
              textArea.style.position = 'fixed';
              textArea.style.opacity = '0';

              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();

              try {
                const successful = document.execCommand('copy');
                if (successful) {
                  alert(
                    `已复制${tables.find((t) => t.id === activeTab)?.name}模板到剪贴板\n\n模板内容:\n${text}`
                  );
                } else {
                  alert(`复制失败，请手动复制以下内容:\n\n${text}`);
                }
              } catch (err) {
                alert(`复制失败，请手动复制以下内容:\n\n${text}`);
                console.error('复制失败:', err);
              }

              document.body.removeChild(textArea);
            }
          }}
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
        >
          <Download size={16} /> 获取模板
        </button>
      </div>

      {/* 添加表单 */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-slate-200 p-4">
          <h4 className="mb-4 font-bold">添加新记录</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fieldDefinitions[activeTab]?.map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {field.label}
                </label>
                {field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={formData[field.key] === true}
                    onChange={(e) =>
                      handleFormChange(field.key, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key]?.toString() || ''}
                    onChange={(e) =>
                      handleFormChange(field.key, e.target.value)
                    }
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
            >
              保存
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
            >
              取消
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default DataManagement;