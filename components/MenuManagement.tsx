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
import { Dish, DishCategory } from '../types.js';
import { auditLogger } from '../services/auditLogger.js';
import { formatCurrency } from '../utils/i18n.js';
import { apiClient } from '../services/apiClient.js';
import { menuAPI } from '../api/menu.js';
import ImageLazyLoad from './ImageLazyLoad';

interface MenuManagementProps {
  // Props are no longer needed as we're using the API directly
}

const MenuManagement: React.FC<MenuManagementProps> = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDishForm, setShowDishForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [editingCategory, setEditingCategory] = useState<DishCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dishForm, setDishForm] = useState<Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    name_en: '',
    category: '',
    price: 0,
    active: true,
    description: '',
    image: '',
    ingredients: [],
    tags: []
  });
  const [categoryForm, setCategoryForm] = useState<Omit<DishCategory, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    name_en: '',
    description: '',
    sortOrder: 0,
    active: true
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadedDishes, loadedCategories] = await Promise.all([
        menuAPI.getDishes(),
        menuAPI.getCategories()
      ]);
      setDishes(loadedDishes);
      setCategories(loadedCategories);
    } catch (err) {
      console.error('Failed to load menu data:', err);
      setError('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleDishFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setDishForm(prev => ({ ...prev, [name]: val }));
  };

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setCategoryForm(prev => ({ ...prev, [name]: val }));
  };

  const handleDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDish) {
        const updatedDish = await menuAPI.updateDish(editingDish.id, dishForm);
        setDishes(prev => prev.map(d => d.id === editingDish.id ? updatedDish : d));
        auditLogger.log('dish_updated', { dishId: updatedDish.id, user: 'current_user' });
      } else {
        const newDish = await menuAPI.createDish(dishForm);
        setDishes(prev => [...prev, newDish]);
        auditLogger.log('dish_created', { dishId: newDish.id, user: 'current_user' });
      }
      
      resetDishForm();
    } catch (err) {
      console.error('Failed to save dish:', err);
      setError('Failed to save dish');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        const updatedCategory = await menuAPI.updateCategory(editingCategory.id, categoryForm);
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? updatedCategory : c));
        auditLogger.log('category_updated', { categoryId: updatedCategory.id, user: 'current_user' });
      } else {
        const newCategory = await menuAPI.createCategory(categoryForm);
        setCategories(prev => [...prev, newCategory]);
        auditLogger.log('category_created', { categoryId: newCategory.id, user: 'current_user' });
      }
      
      resetCategoryForm();
    } catch (err) {
      console.error('Failed to save category:', err);
      setError('Failed to save category');
    }
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      name_en: dish.name_en || '',
      category: dish.category,
      price: dish.price,
      active: dish.active,
      description: dish.description || '',
      image: dish.image || '',
      ingredients: dish.ingredients || [],
      tags: dish.tags || []
    });
    setShowDishForm(true);
  };

  const handleEditCategory = (category: DishCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      name_en: category.name_en,
      description: category.description || '',
      sortOrder: category.sortOrder,
      active: category.active
    });
    setShowCategoryForm(true);
  };

  const handleDeleteDish = async (id: string) => {
    if (window.confirm('确定要删除这道菜吗？')) {
      try {
        const success = await menuAPI.deleteDish(id);
        if (success) {
          setDishes(prev => prev.filter(d => d.id !== id));
          auditLogger.log('dish_deleted', { dishId: id, user: 'current_user' });
        }
      } catch (err) {
        console.error('Failed to delete dish:', err);
        setError('Failed to delete dish');
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('确定要删除这个分类吗？')) {
      try {
        const success = await menuAPI.deleteCategory(id);
        if (success) {
          setCategories(prev => prev.filter(c => c.id !== id));
          // Also update dishes that belonged to this category
          setDishes(prev => prev.map(d => 
            d.category === id ? { ...d, category: '未分类' } : d
          ));
          auditLogger.log('category_deleted', { categoryId: id, user: 'current_user' });
        }
      } catch (err) {
        console.error('Failed to delete category:', err);
        setError('Failed to delete category');
      }
    }
  };

  const resetDishForm = () => {
    setDishForm({
      name: '',
      name_en: '',
      category: '',
      price: 0,
      active: true,
      description: '',
      image: '',
      ingredients: [],
      tags: []
    });
    setEditingDish(null);
    setShowDishForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      name_en: '',
      description: '',
      sortOrder: 0,
      active: true
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  // Filter dishes based on search and category
  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      const matchesSearch = !searchTerm || 
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [dishes, searchTerm, selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">菜单管理</h1>
          <p className="text-slate-600">管理菜品和分类</p>
        </div>
        <div className="mt-4 flex gap-2 sm:mt-0">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Layers size={18} />
            添加分类
          </button>
          <button
            onClick={() => setShowDishForm(true)}
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            添加菜品
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜索菜品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded border border-slate-300 px-3 py-2"
            >
              <option value="all">所有分类</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">菜品分类</h2>
          <span className="text-sm text-slate-600">{categories.length} 个分类</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <div key={category.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-slate-600">{category.name_en}</p>
                  {category.description && (
                    <p className="mt-1 text-sm text-slate-500">{category.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.active ? '启用' : '禁用'}
                    </span>
                    <span className="text-xs text-slate-500">排序: {category.sortOrder}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="rounded bg-blue-100 p-1 text-blue-700 hover:bg-blue-200"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="rounded bg-red-100 p-1 text-red-700 hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dishes Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">菜品列表</h2>
          <span className="text-sm text-slate-600">{filteredDishes.length} 道菜品</span>
        </div>
        
        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDishes.map(dish => (
              <div key={dish.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start gap-4">
                  {dish.image ? (
                    <div className="h-16 w-16 flex-shrink-0 rounded-md bg-slate-100">
                      <ImageLazyLoad 
                        src={dish.image} 
                        alt={dish.name}
                        className="h-full w-full rounded-md object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-slate-100">
                      <Utensils size={24} className="text-slate-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{dish.name}</h3>
                        <p className="text-sm text-slate-600">{dish.name_en}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditDish(dish)}
                          className="rounded bg-blue-100 p-1 text-blue-700 hover:bg-blue-200"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          className="rounded bg-red-100 p-1 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-lg font-bold text-green-700">{formatCurrency(dish.price, 'PHP')}</p>
                      {dish.description && (
                        <p className="mt-1 text-sm text-slate-600">{dish.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          dish.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {dish.active ? '上架' : '下架'}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                          {dish.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">
            没有找到匹配的菜品
          </div>
        )}
      </div>

      {/* Dish Form Modal */}
      {showDishForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingDish ? '编辑菜品' : '添加菜品'}
              </h3>
              <button
                onClick={resetDishForm}
                className="rounded-full p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleDishSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    中文名称
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={dishForm.name}
                    onChange={handleDishFormChange}
                    required
                    className="w-full rounded border border-slate-300 px-3 py-2"
                    placeholder="如: 宫保鸡丁"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    英文名称
                  </label>
                  <input
                    type="text"
                    name="name_en"
                    value={dishForm.name_en}
                    onChange={handleDishFormChange}
                    required
                    className="w-full rounded border border-slate-300 px-3 py-2"
                    placeholder="如: Kung Pao Chicken"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    价格
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={dishForm.price}
                    onChange={handleDishFormChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded border border-slate-300 px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    分类
                  </label>
                  <select
                    name="category"
                    value={dishForm.category}
                    onChange={handleDishFormChange}
                    required
                    className="w-full rounded border border-slate-300 px-3 py-2"
                  >
                    <option value="">选择分类</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  描述
                </label>
                <textarea
                  name="description"
                  value={dishForm.description}
                  onChange={handleDishFormChange}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="菜品描述..."
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  图片链接
                </label>
                <input
                  type="text"
                  name="image"
                  value={dishForm.image}
                  onChange={handleDishFormChange}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="图片URL..."
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  id="dish-active"
                  checked={dishForm.active}
                  onChange={(e) => setDishForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <label htmlFor="dish-active" className="text-sm font-medium text-slate-700">
                  上架状态
                </label>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <Check size={18} />
                  保存
                </button>
                <button
                  type="button"
                  onClick={resetDishForm}
                  className="flex items-center gap-2 rounded border border-slate-300 px-4 py-2 hover:bg-slate-50"
                >
                  <X size={18} />
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCategory ? '编辑分类' : '添加分类'}
              </h3>
              <button
                onClick={resetCategoryForm}
                className="rounded-full p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  中文名称
                </label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryFormChange}
                  required
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="如: 主食"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  英文名称
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={categoryForm.name_en}
                  onChange={handleCategoryFormChange}
                  required
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="如: Staple Food"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  描述
                </label>
                <textarea
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryFormChange}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="分类描述..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    排序
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={categoryForm.sortOrder}
                    onChange={handleCategoryFormChange}
                    required
                    min="0"
                    className="w-full rounded border border-slate-300 px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    状态
                  </label>
                  <select
                    name="active"
                    value={categoryForm.active.toString()}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, active: e.target.value === 'true' }))}
                    className="w-full rounded border border-slate-300 px-3 py-2"
                  >
                    <option value="true">启用</option>
                    <option value="false">禁用</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <Check size={18} />
                  保存
                </button>
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="flex items-center gap-2 rounded border border-slate-300 px-4 py-2 hover:bg-slate-50"
                >
                  <X size={18} />
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-red-50 p-4 text-red-700 shadow-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 rounded-full p-1 hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;