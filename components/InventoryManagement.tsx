import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  PackageCheck,
  PackageX,
  X,
} from 'lucide-react';
import { Ingredient } from '../types';
import { apiClient } from '../services/apiClient';
import { auditLogger } from '../services/auditLogger';

interface InventoryManagementProps {
  inventory: Ingredient[];
  setInventory: React.Dispatch<React.SetStateAction<Ingredient[]>>;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({
  inventory,
  setInventory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: '',
    quantity: 0,
    unit: 'kg',
    threshold: 5,
  });

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.threshold
  );

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
        threshold: 5,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;

    if (!confirm('Delete this item? 确定要删除该食材记录吗？')) return;

    try {
      await apiClient.delete('inventory', id);
      setInventory((prev) => prev.filter((item) => item.id !== id));
      auditLogger.log('warn', 'INVENTORY_DELETE', `删除食材: ${item.name}`, 'admin');
      setError(null);
    } catch (error) {
      setError('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    try {
      if (editingItem) {
        const updatedItem = {
          ...editingItem,
          ...formData,
          updatedAt: now,
        } as Ingredient;

        await apiClient.update('inventory', editingItem.id, updatedItem);
        setInventory((prev) =>
          prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
        );
        auditLogger.log(
          'info',
          'INVENTORY_UPDATE',
          `更新食材: ${updatedItem.name}`,
          'admin'
        );
      } else {
        const newItem: Ingredient = {
          ...(formData as Ingredient),
          id: `ING-${Date.now()}`,
          updatedAt: now,
        };

        await apiClient.create('inventory', newItem);
        setInventory((prev) => [newItem, ...prev]);
        auditLogger.log(
          'info',
          'INVENTORY_CREATE',
          `添加食材: ${newItem.name}`,
          'admin'
        );
      }

      setIsModalOpen(false);
      setError(null);
    } catch (error) {
      setError('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleQuickUpdate = async (id: string, delta: number) => {
    try {
      const item = inventory.find((i) => i.id === id);
      if (!item) return;

      const newQuantity = Math.max(0, item.quantity + delta);
      const updatedItem = {
        ...item,
        quantity: newQuantity,
        updatedAt: new Date().toISOString(),
      };

      await apiClient.update('inventory', id, updatedItem);
      setInventory((prev) =>
        prev.map((i) => (i.id === id ? updatedItem : i))
      );

      auditLogger.log(
        'info',
        'INVENTORY_ADJUST',
        `库存调整: ${item.name} ${delta > 0 ? '+' : ''}${delta} ${item.unit}`,
        'admin'
      );

      setError(null);
    } catch (error) {
      setError('库存调整失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <X size={18} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Inventory 库存管理
          </h2>
          <p className="text-sm text-slate-500">Pamamahala ng Imbentaryo</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-slate-800"
        >
          <Plus size={20} />
          <span>Add Item / Magdagdag</span>
        </button>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Items / Kabuuan
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-800">
              {inventory.length}
            </h3>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <PackageCheck size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Low Stock / Mababa ang stock
            </p>
            <h3
              className={`mt-1 text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-slate-800'}`}
            >
              {lowStockItems.length}
            </h3>
          </div>
          <div
            className={`rounded-lg p-3 ${lowStockItems.length > 0 ? 'animate-pulse bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
          >
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Status / Kalagayan
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-800">
              {lowStockItems.length > 0 ? 'Need Restock 需补货' : 'Good 充足'}
            </h3>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
            <PackageX size={24} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row">
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search / 搜索 / Hanapin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Name / Pangalan</th>
                <th className="px-6 py-4 font-medium">Stock / Imbentaryo</th>
                <th className="px-6 py-4 font-medium">Threshold / Limit</th>
                <th className="px-6 py-4 font-medium">Status / Kalagayan</th>
                <th className="px-6 py-4 font-medium">Updated</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const isLow = item.quantity <= item.threshold;
                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="min-w-[3rem] font-bold text-slate-700">
                          {item.quantity}{' '}
                          <span className="text-xs font-normal text-slate-400">
                            {item.unit}
                          </span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickUpdate(item.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleQuickUpdate(item.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.threshold} {item.unit}
                    </td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          <AlertTriangle size={12} /> Low / Mababa
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
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
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
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
            <div className="flex flex-col items-center gap-3 p-12 text-center text-slate-400">
              <PackageX size={48} className="text-slate-200" />
              <p>No Items Found / Walang nakita</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingItem ? 'Edit Item / I-edit' : 'Add Item / Magdagdag'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name / Pangalan
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. Beef / 牛肉"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Quantity / Dami
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantity: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Unit / Yunit
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, unit: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="kg/pack"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Alert Threshold / Limitasyon
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.threshold}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        threshold: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    Alert level
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg py-2 text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancel / Kanselahin
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-slate-900 py-2 font-medium text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-slate-800"
                >
                  Save / I-save
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
