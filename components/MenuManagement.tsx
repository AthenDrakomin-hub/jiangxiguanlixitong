
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, ImageIcon, Upload, X, ChevronDown, Check, Layers, ArrowUpCircle, ArrowDownCircle, GripVertical, Beaker, Loader2, Download, FileSpreadsheet, Utensils } from 'lucide-react';
import { Dish, Category } from '../types';
import auditLogger from '../services/auditLogger';

// dnd-kit imports
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

import ImageLazyLoad from './ImageLazyLoad';

interface MenuManagementProps {
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  categories: Category[];
}

const MenuManagement: React.FC<MenuManagementProps> = ({ dishes, setDishes, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{id: string, index: number} | null>(null);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // 默认每页20条记录
  
  // 图片上传状态
  const [isUploading, setIsUploading] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState<Omit<Dish, 'id'> & {id?: string}>({
    name: '',
    description: '',
    price: 0,
    category: categories[0] || 'Main Course',
    imageUrl: '',
    available: true,
    spiciness: 0
  });
  
  // 分类管理状态
  const [newCategory, setNewCategory] = useState('');
  
  // 食材管理状态（用于菜品配方）
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQty, setIngredientQty] = useState('');
  
  // 过滤和搜索逻辑
  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dish.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [dishes, searchTerm, selectedCategory]);
  
  // 分页计算
  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDishes = filteredDishes.slice(startIndex, startIndex + itemsPerPage);
  
  // 重置分页当过滤条件改变时
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isSortingEnabled = searchTerm === '' && selectedCategory === 'All';

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Delete ${selectedIds.size} dishes? 确定要删除选中的菜品吗？`)) return;

    setDishes(prev => prev.filter(d => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
  };

  const handleBulkAvailability = (newState: boolean) => {
    if (selectedIds.size === 0) return;

    setDishes(prev => prev.map(d => selectedIds.has(d.id) ? { ...d, available: newState } : d));
    setSelectedIds(new Set());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDishes((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
      spiciness: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dish: Dish) => {
    setEditingDish(dish);
    setFormData(dish);
    setIsModalOpen(true);
  };

  const handleDeleteDish = (id: string) => {
    if (confirm('Delete this dish? 确定要删除这道菜吗？')) {
      setDishes(prev => prev.filter(d => d.id !== id));
      if (selectedIds.has(id)) {
        const newSet = new Set(selectedIds);
        newSet.delete(id);
        setSelectedIds(newSet);
      }
    }
    
    // 记录删除菜品日志
    auditLogger.log('warn', 'DISH_DELETE', `删除菜品: ${name}`, 'admin');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDish) {
      // 更新现有菜品
      const updatedDish = { ...editingDish, ...formData } as Dish;
      setDishes(prev => prev.map(d => d.id === editingDish.id ? updatedDish : d));
      
      // 记录更新菜品日志
      auditLogger.log('info', 'DISH_UPDATE', `更新菜品: ${updatedDish.name}`, 'admin');
    } else {
      // 添加新菜品
      const newDish: Dish = {
        ...formData as Dish,
        id: Math.random().toString(36).substr(2, 9)
      };
      setDishes(prev => [...prev, newDish]);
      
      // 记录添加菜品日志
      auditLogger.log('info', 'DISH_ADD', `添加新菜品: ${newDish.name}`, 'admin');
    }
    setIsModalOpen(false);
  };

  const handleAddIngredient = () => {
    if (!selectedIngredientId || !ingredientQty) return;
    const qty = parseFloat(ingredientQty);
    if (isNaN(qty) || qty <= 0) return;

    const newIng: any = {
      ingredientId: selectedIngredientId,
      quantity: qty
    };

    setFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), newIng]
    }));
    
    setSelectedIngredientId('');
    setIngredientQty('');
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);

    // Directly use Base64 encoding without Supabase
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Max 5MB. 图片太大");
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
    const hasDishes = dishes.some(dish => dish.category === cat);
    if (hasDishes) {
      alert(`无法删除分类 "${cat}"，因为还有菜品属于此分类。请先将这些菜品移动到其他分类。`);
      return;
    }
    
    // 注意：这里应该通过父组件传递的函数来更新分类
    // 由于当前组件没有接收 setCategories 函数，我们暂时只更新本地状态
    
    // Reset form category if it was the removed category
    if (formData.category === cat) {
      setFormData(prev => ({
        ...prev,
        category: categories.length > 1 ? categories.find(c => c !== cat) || categories[0] : 'Main Course'
      }));
    }
  };

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (isBulkActionsOpen && !(e.target as Element).closest('.bulk-actions-container')) {
        setIsBulkActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [isBulkActionsOpen]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Utensils className="text-slate-700" /> Menu Management 菜单管理
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage Dishes / Pamahalaan ang mga Pagkain</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={openImportModal}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Download size={16} /> Import 导入
          </button>
          
          <button 
            onClick={() => setShowCategoryManager(true)}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Layers size={16} /> Categories 分类
          </button>
          
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
          >
            <Plus size={16} /> Add Dish 添加菜品
          </button>
        </div>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search dishes... 搜索菜品"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="All">All Categories 所有分类</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-800 font-medium">
              {selectedIds.size} item(s) selected 已选择 {selectedIds.size} 项
            </span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 size={16} /> Delete 删除
            </button>
            
            <button 
              onClick={() => {
                const selectedDishes = dishes.filter(d => selectedIds.has(d.id));
                const newState = !selectedDishes.every(d => d.available);
                handleBulkAvailability(newState);
              }}
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Check size={16} /> Toggle Availability 切换可用性
            </button>
            
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-2 bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Clear 取消选择
            </button>
          </div>
        </div>
      )}
      
      {/* Menu Items Grid */}
      {paginatedDishes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils size={24} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700">
            {searchTerm || selectedCategory !== 'All' ? 'No dishes found 未找到菜品' : 'No dishes available 暂无菜品'}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {searchTerm || selectedCategory !== 'All' ? 'Try adjusting your search or filter criteria' : 'Add your first dish to get started'}
          </p>
          
          <button 
            onClick={openAddModal}
            className="mt-6 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors mx-auto"
          >
            <Plus size={16} /> Add First Dish 添加首个菜品
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedDishes.map((dish, index) => (
              <SortableDishCard 
                key={dish.id} 
                id={dish.id}
                index={startIndex + index}
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
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-slate-500">
                显示第 {startIndex + 1} 到 {Math.min(startIndex + itemsPerPage, filteredDishes.length)} 条记录，
                共 {filteredDishes.length} 条记录
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    currentPage === 1 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
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
                        className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
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
                      <span key={pageNum} className="px-3 py-1.5 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    currentPage === totalPages 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-slate-800">
                {editingDish ? 'Edit Dish / I-edit' : 'Add Dish / Magdagdag'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name / Pangalan</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. Spicy Tofu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price / Presyo (₱)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category / Kategorya</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Spiciness / Anghang (0-3)</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      value={formData.spiciness}
                      onChange={e => setFormData(prev => ({ ...prev, spiciness: Number(e.target.value) }))}
                      className="w-full accent-red-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
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
                      onChange={e => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor="available" className="text-sm font-medium text-slate-700">Available / Magagamit</label>
                  </div>

                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description / Paglalarawan</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Image / Larawan</label>
                    
                    <div className="space-y-3">
                      <div className="aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group transition-colors hover:border-red-200">
                        {isUploading ? (
                           <div className="flex flex-col items-center gap-2 text-slate-400">
                              <Loader2 className="animate-spin" size={24} />
                              <span className="text-xs">Uploading to 'dish-images'...</span>
                           </div>
                        ) : formData.imageUrl ? (
                          <>
                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                               <label className="cursor-pointer p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors" title="Change">
                                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                  <Upload size={20} />
                               </label>
                               <button 
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                  className="p-2 bg-white/20 hover:bg-red-600/80 rounded-full text-white backdrop-blur-sm transition-colors"
                                  title="Remove"
                               >
                                  <X size={20} />
                               </button>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50/30 transition-all">
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                            <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                              <Upload size={24} />
                            </div>
                            <span className="text-sm font-medium">Click to Upload 上传图片</span>
                          </label>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <ImageIcon size={16} className="text-slate-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Or enter Image URL... 或输入图片链接"
                          value={formData.imageUrl}
                          onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-slate-50 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recipe / BOM Section */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                       <Beaker size={16} /> Recipe / Resipe
                     </h4>
                     
                     <div className="flex gap-2 mb-3">
                        <select 
                           value={selectedIngredientId}
                           onChange={e => setSelectedIngredientId(e.target.value)}
                           className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                        >
                           <option value="">Select Ingredient 选择食材...</option>
                           {inventory.map(ing => (
                             <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                           ))}
                        </select>
                        <input 
                           type="number" 
                           placeholder="Qty 数量" 
                           className="w-20 text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                           value={ingredientQty}
                           onChange={e => setIngredientQty(e.target.value)}
                        />
                        <button 
                           type="button"
                           onClick={handleAddIngredient}
                           disabled={!selectedIngredientId || !ingredientQty}
                           className="bg-slate-900 text-white p-1.5 rounded-lg disabled:opacity-50"
                        >
                           <Plus size={16} />
                        </button>
                     </div>

                     <div className="space-y-2 max-h-40 overflow-y-auto">
                        {formData.ingredients && formData.ingredients.map((item, idx) => {
                          const ingName = inventory.find(i => i.id === item.ingredientId)?.name || 'Unknown';
                          const ingUnit = inventory.find(i => i.id === item.ingredientId)?.unit || '';
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-slate-200">
                               <span>{ingName}</span>
                               <div className="flex items-center gap-2">
                                  <span className="font-mono">{item.quantity} {ingUnit}</span>
                                  <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-slate-400 hover:text-red-500">
                                    <X size={14} />
                                  </button>
                               </div>
                            </div>
                          )
                        })}
                        {(!formData.ingredients || formData.ingredients.length === 0) && (
                          <div className="text-center text-slate-400 text-xs py-2">No ingredients bound. 暂无配方</div>
                        )}
                     </div>
                     <p className="text-xs text-slate-400 mt-2">Stock deducted automatically. Awtomatikong ibabawas ang stock.</p>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel / Kanselahin
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUploading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm shadow-red-200 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save / I-save'}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileSpreadsheet size={20} /> 菜单数据导入/导出
                </h3>
                <p className="text-slate-400 text-sm mt-1">Import/Export Menu Data</p>
              </div>
              <button 
                onClick={() => setShowImportModal(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <Download size={16} /> 下载模板
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    下载标准CSV模板，填写菜单数据后上传导入
                  </p>
                  <button 
                    onClick={() => {
                      // Create CSV template
                      const csvContent = "id,name,description,price,category,imageUrl,available,spiciness\n,,,\"0\",\"热菜\",,\"true\",\"0\"";
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.setAttribute('href', url);
                      link.setAttribute('download', 'menu_template.csv');
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} /> 下载CSV模板
                  </button>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <Upload size={16} /> 上传导入
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    上传填写好的CSV文件，批量导入菜单数据
                  </p>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-300 rounded-lg cursor-pointer bg-green-50 hover:bg-green-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileSpreadsheet className="w-8 h-8 mb-2 text-green-500" />
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
                              const lines = text.split('\n').filter(line => line.trim() !== '');
                              if (lines.length <= 1) {
                                alert('文件为空或格式不正确');
                                return;
                              }
                              
                              // Validate header
                              const header = lines[0].split(',').map(field => field.trim().replace(/^"|"$/g, ''));
                              const requiredHeaders = ['id', 'name', 'description', 'price', 'category', 'imageUrl', 'available', 'spiciness'];
                              const missingHeaders = requiredHeaders.filter(h => !header.includes(h));
                              if (missingHeaders.length > 0) {
                                alert(`CSV文件缺少必要列: ${missingHeaders.join(', ')}`);
                                return;
                              }
                              
                              // Skip header line
                              const dataLines = lines.slice(1);
                              const newDishes: Partial<Dish>[] = [];
                              
                              for (let i = 0; i < dataLines.length; i++) {
                                const line = dataLines[i];
                                const [id, name, description, price, category, imageUrl, available, spiciness] = line.split(',').map(field => field.trim().replace(/^"|"$/g, ''));
                                
                                // Validate data
                                if (!name) {
                                  alert(`第${i+2}行数据错误: 菜品名称不能为空`);
                                  continue;
                                }
                                
                                if (isNaN(parseFloat(price))) {
                                  alert(`第${i+2}行数据错误: 价格必须为数字`);
                                  continue;
                                }
                                
                                if (isNaN(parseInt(spiciness))) {
                                  alert(`第${i+2}行数据错误: 辣度必须为数字`);
                                  continue;
                                }
                                
                                if (available !== 'true' && available !== 'false') {
                                  alert(`第${i+2}行数据错误: 可用性字段必须为 true 或 false`);
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
                                  spiciness: parseInt(spiciness)
                                });
                              }
                              
                              // Add to existing dishes
                              setDishes(prev => [...prev, ...newDishes as Dish[]]);
                              
                              // Save to backend API
                              try {
                                const response = await fetch('/api/dishes/batch', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ dishes: newDishes }),
                                });
                                
                                const result = await response.json();
                                if (result.success) {
                                  alert(`成功导入 ${newDishes.length} 个菜品`);
                                } else {
                                  alert(`导入成功但保存到数据库失败: ${result.message}`);
                                }
                              } catch (apiError) {
                                console.error('API调用失败:', apiError);
                                alert('导入成功但保存到数据库失败，请手动保存');
                              }
                              
                              setIsImportModalOpen(false);
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
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h4 className="font-bold text-amber-800 mb-2">注意事项</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
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
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Layers size={20} /> 菜单分类管理
                </h3>
                <p className="text-slate-400 text-sm mt-1">Manage Menu Categories</p>
              </div>
              <button 
                onClick={() => setShowCategoryManager(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  添加新分类 / Add New Category
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="新分类名称"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-medium text-slate-700 mb-3">现有分类 / Existing Categories</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map(cat => {
                    const dishCount = dishes.filter(d => d.category === cat).length;
                    return (
                      <div 
                        key={cat} 
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div>
                          <span className="font-medium text-slate-800">{cat}</span>
                          <span className="text-xs text-slate-500 ml-2">({dishCount} 菜品)</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveCategory(cat)}
                          disabled={dishCount > 0}
                          className={`p-1 rounded ${
                            dishCount > 0 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-red-500 hover:bg-red-100'
                          }`}
                          title={dishCount > 0 ? "无法删除：仍有菜品属于此分类" : "删除分类"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
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
