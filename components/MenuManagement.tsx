import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ImageIcon,
  Upload,
  X,
  Check,
  Layers,
  Beaker,
  Loader2,
  Download,
  FileSpreadsheet,
  Utensils,
  AlertCircle,
} from 'lucide-react';
import { Dish, Category, Ingredient, DishIngredient } from '../types';
import { auditLogger } from '../services/auditLogger';
import { apiClient } from '../services/apiClient';

// dnd-kit imports (commented out as not currently used)
/*
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
*/

import ImageLazyLoad from './ImageLazyLoad';

interface MenuManagementProps {
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  categories: Category[];
  setCategories?: React.Dispatch<React.SetStateAction<Category[]>>;
  // 产品备注: 为inventory属性指定明确的类型，避免使用any
  inventory: Ingredient[];
}

const MenuManagement: React.FC<MenuManagementProps> = ({
  dishes,
  setDishes,
  categories,
  inventory,
}) => {
  interface DishCardProps {
    dish: Dish;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onEdit: (dish: Dish) => void;
    onDelete: (id: string) => void;
  }

  const DishCard: React.FC<DishCardProps> = ({
    dish,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
  }) => {
    return (
      <div
        className={`overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${isSelected ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-100'}`}
      >
        <div className="relative">
          <div className="relative aspect-square overflow-hidden bg-slate-100">
            {dish.imageUrl ? (
              <ImageLazyLoad
                src={dish.imageUrl}
                alt={dish.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <Utensils size={32} />
              </div>
            )}

            <div className="absolute left-2 top-2 flex gap-1">
              {dish.spiciness > 0 && (
                <span className="flex items-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                  {Array(dish.spiciness)
                    .fill(0)
                    .map((_, i) => (
                      <span key={i}>🌶️</span>
                    ))}
                </span>
              )}
            </div>

            <button
              onClick={() => onSelect(dish.id)}
              className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${isSelected ? 'border-red-500 bg-red-500 text-white' : 'border-slate-300 bg-white text-white hover:border-red-500'}`}
            >
              {isSelected && <Check size={14} />}
            </button>

            {!dish.available && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate font-bold text-slate-800">{dish.name}</h3>
              <span className="whitespace-nowrap font-bold text-red-600">
                ₱{dish.price.toFixed(2)}
              </span>
            </div>

            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {dish.description}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="inline-block rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                {dish.category}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(dish)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  title="Edit 编辑"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(dish.id)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Delete 删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 默认每页20条记录

  // 图片上传状态
  const [isUploading, setIsUploading] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState<Omit<Dish, 'id'> & { id?: string }>({
    name: '',
    description: '',
    price: 0,
    category: categories[0] || 'Main Course',
    imageUrl: '',
    available: true,
    spiciness: 0,
  });

  // 分类管理状态
  const [newCategory, setNewCategory] = useState('');

  // 食材管理状态（用于菜品配方）
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQty, setIngredientQty] = useState('');

  // 过滤和搜索逻辑
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesSearch =
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || dish.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [dishes, searchTerm, selectedCategory]);

  // 分页计算
  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDishes = filteredDishes.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 重置分页当过滤条件改变时
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Delete ${selectedIds.size} dishes? 确定要删除选中的菜品吗？`))
      return;

    try {
      // 批量删除后端数据
      for (const id of selectedIds) {
        await apiClient.delete('dishes', id);
      }

      setDishes((prev) => prev.filter((d) => !selectedIds.has(d.id)));
      setSelectedIds(new Set());
      setError(null);
    } catch (error) {
      console.error('批量删除失败:', error);
      setError('批量删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleBulkAvailability = (newState: boolean) => {
    if (selectedIds.size === 0) return;

    setDishes((prev) =>
      prev.map((d) =>
        selectedIds.has(d.id) ? { ...d, available: newState } : d
      )
    );
    setSelectedIds(new Set());
  };

  const openAddModal = () => {
    setEditingDish(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: categories[0] || 'Main Course',
      imageUrl: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
      available: true,
      spiciness: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dish: Dish) => {
    setEditingDish(dish);
    setFormData(dish);
    setIsModalOpen(true);
  };

  const handleDeleteDish = async (id: string) => {
    const dish = dishes.find((d) => d.id === id);
    if (!dish) return;

    if (!confirm('Delete this dish? 确定要删除这道菜吗？')) return;

    try {
      // 删除后端数据
      await apiClient.delete('dishes', id);

      // 更新前端状态
      setDishes((prev) => prev.filter((d) => d.id !== id));
      if (selectedIds.has(id)) {
        const newSet = new Set(selectedIds);
        newSet.delete(id);
        setSelectedIds(newSet);
      }

      // 记录删除菜品日志
      auditLogger.log('warn', 'DISH_DELETE', `删除菜品: ${dish.name}`, 'admin');
      setError(null);
    } catch (error) {
      console.error('删除菜品失败:', error);
      setError('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDish) {
        // 更新现有菜品
        const updatedDish = { ...editingDish, ...formData } as Dish;
        await apiClient.update('dishes', editingDish.id, updatedDish);

        setDishes((prev) =>
          prev.map((d) => (d.id === editingDish.id ? updatedDish : d))
        );

        // 记录更新菜品日志
        auditLogger.log(
          'info',
          'DISH_UPDATE',
          `更新菜品: ${updatedDish.name}`,
          'admin'
        );
      } else {
        // 添加新菜品
        const newDish: Dish = {
          ...(formData as Dish),
          id: Math.random().toString(36).substr(2, 9),
        };
        await apiClient.create('dishes', newDish);

        setDishes((prev) => [...prev, newDish]);

        // 记录添加菜品日志
        auditLogger.log(
          'info',
          'DISH_ADD',
          `添加新菜品: ${newDish.name}`,
          'admin'
        );
      }

      setIsModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('保存菜品失败:', error);
      setError('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleAddIngredient = () => {
    if (!selectedIngredientId || !ingredientQty) return;
    const qty = parseFloat(ingredientQty);
    if (isNaN(qty) || qty <= 0) return;

    const newIng: DishIngredient = {
      ingredientId: selectedIngredientId,
      quantity: qty,
    };

    setFormData((prev) => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), newIng],
    }));

    setSelectedIngredientId('');
    setIngredientQty('');
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);

    // Directly use Base64 encoding without Supabase
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Max 5MB. 图片太大');
      return;
    }

    await handleImageUpload(file);
  };

  const openImportModal = () => {
    setShowImportModal(true);
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      // 注意：这里应该通过父组件传递的函数来更新分类
      // 由于当前组件没有接收 setCategories 函数，我们暂时只更新本地状态
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    // Don't allow removing categories that have dishes
    const hasDishes = dishes.some((dish) => dish.category === cat);
    if (hasDishes) {
      alert(
        `无法删除分类 "${cat}"，因为还有菜品属于此分类。请先将这些菜品移动到其他分类。`
      );
      return;
    }

    // 注意：这里应该通过父组件传递的函数来更新分类
    // 由于当前组件没有接收 setCategories 函数，我们暂时只更新本地状态

    // Reset form category if it was the removed category
    if (formData.category === cat) {
      setFormData((prev) => ({
        ...prev,
        category:
          categories.length > 1
            ? categories.find((c) => c !== cat) || categories[0]
            : 'Main Course',
      }));
    }
  };

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (
        isBulkActionsOpen &&
        !(e.target as Element).closest('.bulk-actions-container')
      ) {
        setIsBulkActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [isBulkActionsOpen]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">操作失败</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm font-medium text-red-800 underline hover:text-red-900"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <Utensils className="text-slate-700" /> Menu Management 菜单管理
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage Dishes / Pamahalaan ang mga Pagkain
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={openImportModal}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200"
          >
            <Download size={16} /> Import 导入
          </button>

          <button
            onClick={() => setShowCategoryManager(true)}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200"
          >
            <Layers size={16} /> Categories 分类
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white shadow-lg transition-colors hover:bg-slate-800"
          >
            <Plus size={16} /> Add Dish 添加菜品
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search dishes... 搜索菜品"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="All">All Categories 所有分类</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-800">
              {selectedIds.size} item(s) selected 已选择 {selectedIds.size} 项
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-red-700 transition-colors hover:bg-red-200"
            >
              <Trash2 size={16} /> Delete 删除
            </button>

            <button
              onClick={() => {
                const selectedDishes = dishes.filter((d) =>
                  selectedIds.has(d.id)
                );
                const newState = !selectedDishes.every((d) => d.available);
                handleBulkAvailability(newState);
              }}
              className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-200"
            >
              <Check size={16} /> Toggle Availability 切换可用性
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition-colors hover:bg-slate-50"
            >
              Clear 取消选择
            </button>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      {paginatedDishes.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-white py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            <Utensils size={24} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700">
            {searchTerm || selectedCategory !== 'All'
              ? 'No dishes found 未找到菜品'
              : 'No dishes available 暂无菜品'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm || selectedCategory !== 'All'
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first dish to get started'}
          </p>

          <button
            onClick={openAddModal}
            className="mx-auto mt-6 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800"
          >
            <Plus size={16} /> Add First Dish 添加首个菜品
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                isSelected={selectedIds.has(dish.id)}
                onSelect={toggleSelection}
                onEdit={openEditModal}
                onDelete={handleDeleteDish}
              />
            ))}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                显示第 {startIndex + 1} 到{' '}
                {Math.min(startIndex + itemsPerPage, filteredDishes.length)}{' '}
                条记录， 共 {filteredDishes.length} 条记录
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    currentPage === 1
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  上一页
                </button>

                {/* 页码按钮 */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // 只显示当前页前后几页，避免页码过多
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 3 ||
                    pageNum === currentPage + 3
                  ) {
                    // 显示省略号
                    return (
                      <span
                        key={pageNum}
                        className="px-3 py-1.5 text-slate-400"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    currentPage === totalPages
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 p-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingDish ? 'Edit Dish / I-edit' : 'Add Dish / Magdagdag'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Name / Pangalan
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. Spicy Tofu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Price / Presyo (₱)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Category / Kategorya
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Spiciness / Anghang (0-3)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      value={formData.spiciness}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          spiciness: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-red-600"
                    />
                    <div className="mt-1 flex justify-between text-xs text-slate-400">
                      <span>None</span>
                      <span>Mild</span>
                      <span>Medium</span>
                      <span>Hot</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.available}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          available: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <label
                      htmlFor="available"
                      className="text-sm font-medium text-slate-700"
                    >
                      Available / Magagamit
                    </label>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Description / Paglalarawan
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Image / Larawan
                    </label>

                    <div className="space-y-3">
                      <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-red-200">
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Loader2 className="animate-spin" size={24} />
                            <span className="text-xs">
                              Uploading to &#39;dish-images&#39;...
                            </span>
                          </div>
                        ) : formData.imageUrl ? (
                          <>
                            <img
                              src={formData.imageUrl}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <label
                                className="cursor-pointer rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                                title="Change"
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleFileUpload}
                                />
                                <Upload size={20} />
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    imageUrl: '',
                                  }))
                                }
                                className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-red-600/80"
                                title="Remove"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-slate-400 transition-all hover:bg-red-50/30 hover:text-red-500">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                            <div className="mb-3 rounded-full bg-white p-3 shadow-sm">
                              <Upload size={24} />
                            </div>
                            <span className="text-sm font-medium">
                              Click to Upload 上传图片
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <ImageIcon size={16} className="text-slate-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Or enter Image URL... 或输入图片链接"
                          value={formData.imageUrl}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recipe / BOM Section */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Beaker size={16} /> Recipe / Resipe
                    </h4>

                    <div className="mb-3 flex gap-2">
                      <select
                        value={selectedIngredientId}
                        onChange={(e) =>
                          setSelectedIngredientId(e.target.value)
                        }
                        className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      >
                        <option value="">Select Ingredient 选择食材...</option>
                        {inventory.map((ing: Ingredient) => (
                          <option
                            key={ing.id?.toString() || `ing-${Math.random()}`}
                            value={ing.id}
                          >
                            {ing.name} ({ing.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Qty 数量"
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                        value={ingredientQty}
                        onChange={(e) => setIngredientQty(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleAddIngredient}
                        disabled={!selectedIngredientId || !ingredientQty}
                        className="rounded-lg bg-slate-900 p-1.5 text-white disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {formData.ingredients &&
                        formData.ingredients.map((item, idx) => {
                          const ingName =
                            inventory.find((i) => i.id === item.ingredientId)
                              ?.name || 'Unknown';
                          const ingUnit =
                            inventory.find((i) => i.id === item.ingredientId)
                              ?.unit || '';
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded border border-slate-200 bg-white p-2 text-sm"
                            >
                              <span>{ingName}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">
                                  {item.quantity} {ingUnit}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveIngredient(idx)}
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      {(!formData.ingredients ||
                        formData.ingredients.length === 0) && (
                        <div className="py-2 text-center text-xs text-slate-400">
                          No ingredients bound. 暂无配方
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Stock deducted automatically. Awtomatikong ibabawas ang
                      stock.
                    </p>
                  </div>
                </div>
              </div>
            </form>

            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white p-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100"
              >
                Cancel / Kanselahin
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isUploading}
                className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white shadow-sm shadow-red-200 transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Save / I-save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
            <div className="flex items-start justify-between bg-slate-900 p-6 text-white">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <FileSpreadsheet size={20} /> 菜单数据导入/导出
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Import/Export Menu Data
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-bold text-blue-800">
                    <Download size={16} /> 下载模板
                  </h4>
                  <p className="mb-3 text-sm text-blue-700">
                    下载标准CSV模板，填写菜单数据后上传导入
                  </p>
                  <button
                    onClick={() => {
                      // Create CSV template
                      const csvContent =
                        'id,name,description,price,category,imageUrl,available,spiciness\n,,,"0","热菜",,"true","0"';
                      const blob = new Blob([csvContent], {
                        type: 'text/csv;charset=utf-8;',
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.setAttribute('href', url);
                      link.setAttribute('download', 'menu_template.csv');
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    <Download size={16} /> 下载CSV模板
                  </button>
                </div>

                <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-bold text-green-800">
                    <Upload size={16} /> 上传导入
                  </h4>
                  <p className="mb-3 text-sm text-green-700">
                    上传填写好的CSV文件，批量导入菜单数据
                  </p>
                  <div className="flex w-full items-center justify-center">
                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50 hover:bg-green-100">
                      <div className="flex flex-col items-center justify-center pb-6 pt-5">
                        <FileSpreadsheet className="mb-2 h-8 w-8 text-green-500" />
                        <p className="text-sm text-green-500">
                          <span className="font-semibold">点击上传CSV文件</span>
                        </p>
                        <p className="text-xs text-green-400">支持CSV格式</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploading(true);
                            try {
                              // Parse CSV file
                              const text = await file.text();
                              const lines = text
                                .split('\n')
                                .filter((line) => line.trim() !== '');
                              if (lines.length <= 1) {
                                alert('文件为空或格式不正确');
                                return;
                              }

                              // Validate header
                              const header = lines[0]
                                .split(',')
                                .map((field) =>
                                  field.trim().replace(/^"|"$/g, '')
                                );
                              const requiredHeaders = [
                                'id',
                                'name',
                                'description',
                                'price',
                                'category',
                                'imageUrl',
                                'available',
                                'spiciness',
                              ];
                              const missingHeaders = requiredHeaders.filter(
                                (h) => !header.includes(h)
                              );
                              if (missingHeaders.length > 0) {
                                alert(
                                  `CSV文件缺少必要列: ${missingHeaders.join(', ')}`
                                );
                                return;
                              }

                              // Skip header line
                              const dataLines = lines.slice(1);
                              const newDishes: Partial<Dish>[] = [];

                              for (let i = 0; i < dataLines.length; i++) {
                                const line = dataLines[i];
                                const [
                                  id,
                                  name,
                                  description,
                                  price,
                                  category,
                                  imageUrl,
                                  available,
                                  spiciness,
                                ] = line
                                  .split(',')
                                  .map((field) =>
                                    field.trim().replace(/^"|"$/g, '')
                                  );

                                // Validate data
                                if (!name) {
                                  alert(
                                    `第${i + 2}行数据错误: 菜品名称不能为空`
                                  );
                                  continue;
                                }

                                if (isNaN(parseFloat(price))) {
                                  alert(`第${i + 2}行数据错误: 价格必须为数字`);
                                  continue;
                                }

                                if (isNaN(parseInt(spiciness))) {
                                  alert(`第${i + 2}行数据错误: 辣度必须为数字`);
                                  continue;
                                }

                                if (
                                  available !== 'true' &&
                                  available !== 'false'
                                ) {
                                  alert(
                                    `第${i + 2}行数据错误: 可用性字段必须为 true 或 false`
                                  );
                                  continue;
                                }

                                newDishes.push({
                                  id: id || `import-${Date.now()}-${i}`,
                                  name: name,
                                  description: description || '',
                                  price: parseFloat(price),
                                  category: category || '热菜',
                                  imageUrl: imageUrl || '',
                                  available: available === 'true',
                                  spiciness: parseInt(spiciness),
                                });
                              }

                              // Add to existing dishes
                              setDishes((prev) => [
                                ...prev,
                                ...(newDishes as Dish[]),
                              ]);

                              // 使用 apiClient 批量导入
                              try {
                                await apiClient.post('/dishes/batch', { dishes: newDishes });
                                alert(`成功导入 ${newDishes.length} 个菜品`);
                              } catch (apiError) {
                                console.error('API调用失败:', apiError);
                                alert('导入成功但保存到数据库失败，请手动保存');
                              }

                              setShowImportModal(false);
                            } catch (error) {
                              console.error('导入失败:', error);
                              alert('导入失败，请检查文件格式是否正确');
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <h4 className="mb-2 font-bold text-amber-800">注意事项</h4>
                  <ul className="space-y-1 text-sm text-amber-700">
                    <li>• CSV文件需包含完整的表头信息</li>
                    <li>• 价格和辣度需为数字格式</li>
                    <li>• 可用性字段请填写 true 或 false</li>
                    <li>• 如ID为空，系统将自动生成唯一ID</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
            <div className="flex items-start justify-between bg-slate-900 p-6 text-white">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <Layers size={20} /> 菜单分类管理
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Manage Menu Categories
                </p>
              </div>
              <button
                onClick={() => setShowCategoryManager(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  添加新分类 / Add New Category
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="新分类名称"
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="mb-3 font-medium text-slate-700">
                  现有分类 / Existing Categories
                </h4>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {categories.map((cat) => {
                    const dishCount = dishes.filter(
                      (d) => d.category === cat
                    ).length;
                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <div>
                          <span className="font-medium text-slate-800">
                            {cat}
                          </span>
                          <span className="ml-2 text-xs text-slate-500">
                            ({dishCount} 菜品)
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveCategory(cat)}
                          disabled={dishCount > 0}
                          className={`rounded p-1 ${
                            dishCount > 0
                              ? 'cursor-not-allowed text-slate-300'
                              : 'text-red-500 hover:bg-red-100'
                          }`}
                          title={
                            dishCount > 0
                              ? '无法删除：仍有菜品属于此分类'
                              : '删除分类'
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
                <p>• 分类名称不能重复</p>
                <p>• 有菜品的分类无法删除</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
