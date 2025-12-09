
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Upload, X, ChevronDown, Check, Layers, ArrowUpCircle, ArrowDownCircle, GripVertical, Beaker, Loader2 } from 'lucide-react';
import { Dish, Ingredient, DishIngredient } from '../types';

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

interface MenuManagementProps {
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  inventory: Ingredient[];
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

// Sortable Item Component
const SortableDishCard = ({ dish, isSelected, toggleSelection, handleOpenModal, handleDelete, isDragEnabled }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: dish.id, disabled: !isDragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      className={`bg-white rounded-xl shadow-sm border overflow-hidden group hover:shadow-md transition-all duration-200 relative ${
        isSelected ? 'ring-2 ring-red-500 border-red-500' : 'border-slate-100'
      } ${isDragging ? 'shadow-xl scale-105' : ''}`}
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={dish.imageUrl} 
          alt={dish.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Selection Checkbox Overlay */}
        <div 
          className="absolute top-2 left-2 z-10 p-1 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); toggleSelection(dish.id); }}
        >
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shadow-sm transition-all ${
            isSelected 
              ? 'bg-red-600 border-red-600 text-white scale-110' 
              : 'bg-white/90 border-slate-300 text-transparent hover:border-red-400'
          }`}>
            <Check size={14} strokeWidth={3} />
          </div>
        </div>

        {/* Drag Handle */}
        {isDragEnabled && (
          <div 
            {...listeners} 
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
             <div className="bg-black/30 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/50">
               <GripVertical size={16} />
             </div>
          </div>
        )}

        {!dish.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
            <span className="text-white font-bold px-3 py-1 bg-red-600 rounded-full text-sm shadow-lg">Sold Out / Ubos Na</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); handleOpenModal(dish); }}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(dish.id); }}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="p-4" onClick={() => toggleSelection(dish.id)}> 
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-800 line-clamp-1">{dish.name}</h3>
          <span className="font-bold text-red-600">₱{dish.price}</span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 h-10">{dish.description}</p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-slate-100 rounded text-slate-600">{dish.category}</span>
            {dish.ingredients && dish.ingredients.length > 0 && (
              <span className="flex items-center gap-1 text-emerald-600" title="BOM Active">
                <Beaker size={12} />
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i < dish.spiciness ? 'bg-red-500' : 'bg-slate-200'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuManagement: React.FC<MenuManagementProps> = ({ dishes, setDishes, inventory, categories, setCategories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Dish>>({
    name: '',
    description: '',
    price: 0,
    category: categories[0] || '热菜',
    imageUrl: '',
    spiciness: 0,
    available: true,
    ingredients: []
  });

  const [newCategory, setNewCategory] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [ingredientQty, setIngredientQty] = useState<string>('');

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

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDishes.length && filteredDishes.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDishes.map(d => d.id)));
    }
  };

  const handleBulkAction = (action: 'enable' | 'disable' | 'delete') => {
    if (selectedIds.size === 0) return;

    if (action === 'delete') {
      if (!confirm(`Delete ${selectedIds.size} dishes? 确定要删除选中的菜品吗？`)) return;
      setDishes(prev => prev.filter(d => !selectedIds.has(d.id)));
    } else if (action === 'enable') {
      setDishes(prev => prev.map(d => selectedIds.has(d.id) ? { ...d, available: true } : d));
    } else if (action === 'disable') {
      setDishes(prev => prev.map(d => selectedIds.has(d.id) ? { ...d, available: false } : d));
    }
    
    setSelectedIds(new Set());
    setIsBulkMenuOpen(false);
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

  const handleOpenModal = (dish?: Dish) => {
    if (dish) {
      setEditingDish(dish);
      setFormData(dish);
    } else {
      setEditingDish(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: categories[0] || '热菜',
        imageUrl: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
        spiciness: 0,
        available: true,
        ingredients: []
      });
    }
    setSelectedIngredientId('');
    setIngredientQty('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this dish? 确定要删除这道菜吗？')) {
      setDishes(prev => prev.filter(d => d.id !== id));
      if (selectedIds.has(id)) {
        const newSet = new Set(selectedIds);
        newSet.delete(id);
        setSelectedIds(newSet);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDish) {
      setDishes(prev => prev.map(d => d.id === editingDish.id ? { ...d, ...formData } as Dish : d));
    } else {
      const newDish: Dish = {
        ...formData as Dish,
        id: Math.random().toString(36).substr(2, 9)
      };
      setDishes(prev => [...prev, newDish]);
    }
    setIsModalOpen(false);
  };

  const handleAddIngredient = () => {
    if (!selectedIngredientId || !ingredientQty) return;
    const qty = parseFloat(ingredientQty);
    if (isNaN(qty) || qty <= 0) return;

    const newIng: DishIngredient = {
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

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
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
    
    setCategories(categories.filter(c => c !== cat));
    
    // Reset form category if it was the removed category
    if (formData.category === cat) {
      setFormData(prev => ({
        ...prev,
        category: categories.length > 1 ? categories.find(c => c !== cat) || categories[0] : '热菜'
      }));
    }
  };

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (isBulkMenuOpen && !(e.target as Element).closest('.bulk-menu-container')) {
        setIsBulkMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [isBulkMenuOpen]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Menu Management 菜单管理</h2>
            <p className="text-slate-500 text-sm">Pamamahala ng Menu</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCategoryManagerOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Layers size={20} />
            <span>分类管理</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
          >
            <Plus size={20} />
            <span>Add Dish / Magdagdag</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search / 搜索 / Hanapin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
        >
          <option value="All">All Categories / Lahat</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-slate-100 shadow-sm animate-fade-in">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800 select-none">
            <div 
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                filteredDishes.length > 0 && selectedIds.size === filteredDishes.length
                  ? 'bg-red-600 border-red-600 text-white' 
                  : 'bg-white border-slate-300'
              }`}
              onClick={(e) => {
                e.preventDefault();
                toggleSelectAll();
              }}
            >
              {(filteredDishes.length > 0 && selectedIds.size === filteredDishes.length) && <Check size={14} />}
            </div>
            Select All / Piliin Lahat ({selectedIds.size})
          </label>
        </div>

        <div className="flex items-center gap-3">
          {!isSortingEnabled && (
             <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
               * Clear filters to sort
             </span>
          )}

          <div className="relative bulk-menu-container">
             <button 
               onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
               disabled={selectedIds.size === 0}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                 selectedIds.size > 0 
                   ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm' 
                   : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
               }`}
             >
               <Layers size={16} />
               <span>Batch / Maramihan</span>
               <ChevronDown size={14} className={`transition-transform ${isBulkMenuOpen ? 'rotate-180' : ''}`} />
             </button>
             
             {isBulkMenuOpen && selectedIds.size > 0 && (
               <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                 <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                   Selected {selectedIds.size}
                 </div>
                 <button 
                   onClick={() => handleBulkAction('enable')} 
                   className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition-colors"
                 >
                   <ArrowUpCircle size={16} />
                   Enable / Paganahin
                 </button>
                 <button 
                   onClick={() => handleBulkAction('disable')} 
                   className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2 transition-colors"
                 >
                   <ArrowDownCircle size={16} />
                   Disable / Huwag Paganahin
                 </button>
                 <div className="h-px bg-slate-100 my-1"></div>
                 <button 
                   onClick={() => handleBulkAction('delete')} 
                   className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors"
                 >
                   <Trash2 size={16} />
                   Delete / Tanggalin
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={filteredDishes.map(d => d.id)} 
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => (
              <SortableDishCard
                key={dish.id}
                dish={dish}
                isSelected={selectedIds.has(dish.id)}
                toggleSelection={toggleSelection}
                handleOpenModal={handleOpenModal}
                handleDelete={handleDelete}
                isDragEnabled={isSortingEnabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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

      {isCategoryManagerOpen && (
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
                onClick={() => setIsCategoryManagerOpen(false)} 
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
