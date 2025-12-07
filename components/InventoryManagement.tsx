
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, PackageCheck, PackageX, RefreshCw } from 'lucide-react';
import { Ingredient } from '../types';

interface InventoryManagementProps {
  inventory: Ingredient[];
  setInventory: React.Dispatch<React.SetStateAction<Ingredient[]>>;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ inventory, setInventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: '',
    quantity: 0,
    unit: 'kg',
    threshold: 5
  });

  const lowStockItems = inventory.filter(item => item.quantity <= item.threshold);

  const handleOpenModal = (item?: Ingredient) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        quantity: 0,
        unit: 'kg',
        threshold: 5
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this item? 确定要删除该食材记录吗？')) {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingItem) {
      setInventory(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, updatedAt: now } as Ingredient 
          : item
      ));
    } else {
      const newItem: Ingredient = {
        ...formData as Ingredient,
        id: `ING-${Date.now()}`,
        updatedAt: now
      };
      setInventory(prev => [newItem, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleQuickUpdate = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity, updatedAt: new Date().toISOString() };
      }
      return item;
    }));
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">库存管理 Inventory</h2>
          <p className="text-slate-500 text-sm">Manage ingredients & stock levels</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus size={20} />
          <span>Add Item 录入食材</span>
        </button>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Items 总食材</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{inventory.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <PackageCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock 告急</p>
            <h3 className={`text-2xl font-bold mt-1 ${lowStockItems.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {lowStockItems.length}
            </h3>
          </div>
          <div className={`p-3 rounded-lg ${lowStockItems.length > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-green-50 text-green-600'}`}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
            <p className="text-sm font-medium text-slate-500">Status 状态</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">
              {lowStockItems.length > 0 ? 'Need Restock 需补货' : 'Good 充足'}
            </h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
            <PackageX size={24} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search items / 搜索食材..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Name 名称</th>
                <th className="px-6 py-4 font-medium">Stock 库存</th>
                <th className="px-6 py-4 font-medium">Threshold 阈值</th>
                <th className="px-6 py-4 font-medium">Status 状态</th>
                <th className="px-6 py-4 font-medium">Updated 更新</th>
                <th className="px-6 py-4 font-medium text-right">Action 操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const isLow = item.quantity <= item.threshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <span className="font-bold text-slate-700 min-w-[3rem]">
                           {item.quantity} <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                         </span>
                         <div className="flex items-center gap-1">
                           <button onClick={() => handleQuickUpdate(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600">-</button>
                           <button onClick={() => handleQuickUpdate(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600">+</button>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.threshold} {item.unit}
                    </td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <AlertTriangle size={12} /> Low 库存不足
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          OK 充足
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInventory.length === 0 && (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
               <PackageX size={48} className="text-slate-200" />
               <p>No Items Found / 没有找到相关食材</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingItem ? 'Edit Item 编辑食材' : 'Add Item 录入新食材'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name 食材名称</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. Beef / 牛肉"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity 数量</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={e => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit 单位</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="kg/pack"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alert Threshold 预警阈值</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.threshold}
                    onChange={e => setFormData(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">Alert if lower than this</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel 取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/10"
                >
                  Save 保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
