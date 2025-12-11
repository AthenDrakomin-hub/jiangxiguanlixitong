import React, { useState } from 'react';
import { Plus, Upload, Download, Trash2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface DataManagementProps {
  onDataUpdate?: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onDataUpdate }) => {
  const [activeTab, setActiveTab] = useState('dishes');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [bulkData, setBulkData] = useState('');

  // 表格定义
  const tables = [
    { id: 'dishes', name: '菜品管理' },
    { id: 'orders', name: '订单管理' },
    { id: 'expenses', name: '费用管理' },
    { id: 'inventory', name: '库存管理' },
    { id: 'ktv_rooms', name: 'KTV房间' },
    { id: 'sign_bill_accounts', name: '挂账账户' },
    { id: 'hotel_rooms', name: '酒店房间' },
    { id: 'payment_methods', name: '支付方式' }
  ];

  // 字段定义
  const fieldDefinitions: Record<string, Array<{key: string, label: string, type: string}>> = {
    dishes: [
      { key: 'name', label: '菜品名称', type: 'text' },
      { key: 'description', label: '描述', type: 'text' },
      { key: 'price', label: '价格', type: 'number' },
      { key: 'category', label: '分类', type: 'text' },
      { key: 'available', label: '是否可用', type: 'checkbox' },
      { key: 'spiciness', label: '辣度(0-3)', type: 'number' }
    ],
    orders: [
      { key: 'tableNumber', label: '桌号', type: 'text' },
      { key: 'source', label: '来源', type: 'select', options: ['LOBBY', 'ROOM_SERVICE', 'KTV', 'TAKEOUT'] },
      { key: 'status', label: '状态', type: 'select', options: ['待处理', '烹饪中', '已上菜', '已支付', '已完成', '已取消'] },
      { key: 'totalAmount', label: '总金额', type: 'number' },
      { key: 'notes', label: '备注', type: 'text' },
      { key: 'paymentMethod', label: '支付方式', type: 'select', options: ['CASH', 'WECHAT', 'ALIPAY', 'USDT', 'GCASH', 'MAYA', 'UNIONPAY', 'CREDIT_CARD', 'SIGN_BILL'] }
    ],
    expenses: [
      { key: 'amount', label: '金额', type: 'number' },
      { key: 'category', label: '分类', type: 'select', options: ['食材采购', '员工工资', '店铺租金', '水电煤气', '维修保养', '其他支出'] },
      { key: 'description', label: '描述', type: 'text' },
      { key: 'date', label: '日期', type: 'date' }
    ],
    inventory: [
      { key: 'name', label: '物品名称', type: 'text' },
      { key: 'quantity', label: '数量', type: 'number' },
      { key: 'unit', label: '单位', type: 'text' },
      { key: 'minThreshold', label: '最低阈值', type: 'number' }
    ],
    ktv_rooms: [
      { key: 'name', label: '房间名称', type: 'text' },
      { key: 'status', label: '状态', type: 'select', options: ['Available', 'InUse', 'Cleaning', 'Maintenance'] },
      { key: 'hourlyRate', label: '小时费率', type: 'number' }
    ],
    sign_bill_accounts: [
      { key: 'name', label: '客户名称', type: 'text' },
      { key: 'cooperationMethod', label: '合作方式', type: 'text' },
      { key: 'settlementMethod', label: '结算方式', type: 'text' },
      { key: 'approver', label: '批准人', type: 'text' },
      { key: 'phoneNumber', label: '电话号码', type: 'text' },
      { key: 'creditLimit', label: '信用额度', type: 'number' },
      { key: 'currentDebt', label: '当前欠款', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: ['Active', 'Inactive'] }
    ],
    hotel_rooms: [
      { key: 'number', label: '房间号', type: 'text' },
      { key: 'floor', label: '楼层', type: 'number' },
      { key: 'status', label: '状态', type: 'select', options: ['Vacant', 'Occupied'] },
      { key: 'guestName', label: '客人姓名', type: 'text' },
      { key: 'dailyRate', label: '日费率', type: 'number' }
    ],
    payment_methods: [
      { key: 'name', label: '名称', type: 'text' },
      { key: 'englishName', label: '英文名称', type: 'text' },
      { key: 'isEnabled', label: '是否启用', type: 'checkbox' },
      { key: 'paymentType', label: '支付类型', type: 'select', options: ['CASH', 'WECHAT', 'ALIPAY', 'USDT', 'GCASH', 'MAYA', 'UNIONPAY', 'CREDIT_CARD', 'SIGN_BILL'] },
      { key: 'currency', label: '货币', type: 'text' },
      { key: 'exchangeRate', label: '汇率', type: 'number' },
      { key: 'sortOrder', label: '排序', type: 'number' }
    ]
  };

  const handleAddNew = () => {
    setFormData({});
    setShowForm(true);
  };

  const handleFormChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      [key]: value
    });
  };

  const handleSubmit = async () => {
    try {
      // 生成唯一ID
      const dataWithId = {
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await apiClient.create(activeTab, dataWithId);
      
      // 重置表单
      setFormData({});
      setShowForm(false);
      
      // 通知父组件数据已更新
      if (onDataUpdate) onDataUpdate();
      
      alert('数据添加成功！');
    } catch (error) {
      console.error('添加数据失败:', error);
      alert('添加数据失败，请重试');
    }
  };

  const handleBulkImport = async () => {
    try {
      const dataArray = JSON.parse(bulkData);
      if (!Array.isArray(dataArray)) {
        alert('批量数据必须是数组格式');
        return;
      }

      let successCount = 0;
      for (const item of dataArray) {
        try {
          const dataWithId = {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          await apiClient.create(activeTab, dataWithId);
          successCount++;
        } catch (err) {
          console.error('单条数据导入失败:', err);
        }
      }
      
      setBulkData('');
      alert(`成功导入 ${successCount} 条数据`);
      
      // 通知父组件数据已更新
      if (onDataUpdate) onDataUpdate();
    } catch (error) {
      console.error('批量导入失败:', error);
      alert('批量导入失败，请检查数据格式');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Upload className="text-slate-400" size={20} /> 数据管理
      </h3>
      
      {/* 标签页 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => setActiveTab(table.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          <Plus size={16} /> 添加新记录
        </button>
        
        <button
          onClick={() => {
            const textarea = document.createElement('textarea');
            textarea.value = JSON.stringify([], null, 2);
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('已复制模板到剪贴板');
          }}
          className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200"
        >
          <Download size={16} /> 获取模板
        </button>
      </div>
      
      {/* 添加表单 */}
      {showForm && (
        <div className="mb-6 p-4 border border-slate-200 rounded-lg">
          <h4 className="font-bold mb-4">添加新记录</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldDefinitions[activeTab]?.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {field.label}
                </label>
                {field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={!!formData[field.key]}
                    onChange={e => handleFormChange(field.key, e.target.checked)}
                    className="rounded border-slate-300"
                  />
                ) : field.type === 'select' && 'options' in field ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={e => handleFormChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">请选择</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={e => handleFormChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder={field.label}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
            >
              保存
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200"
            >
              取消
            </button>
          </div>
        </div>
      )}
      
      {/* 批量导入 */}
      <div className="mb-6 p-4 border border-slate-200 rounded-lg">
        <h4 className="font-bold mb-4">批量导入</h4>
        <textarea
          value={bulkData}
          onChange={e => setBulkData(e.target.value)}
          placeholder="粘贴JSON格式的批量数据..."
          className="w-full h-32 px-3 py-2 border border-slate-200 rounded-lg mb-3"
        />
        <button
          onClick={handleBulkImport}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          <Upload size={16} /> 批量导入
        </button>
      </div>
    </div>
  );
};

export default DataManagement;