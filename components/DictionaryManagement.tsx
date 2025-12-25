import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Save, X, Filter } from 'lucide-react';
import { SystemDictionary } from '../types.js';
import { dictionaryAPI } from '../api/system-dictionary.js';
import { auditLogger } from '../services/auditLogger.js';

const DictionaryManagement: React.FC = () => {
  const [dictionaries, setDictionaries] = useState<SystemDictionary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDict, setEditingDict] = useState<SystemDictionary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formState, setFormState] = useState<Omit<SystemDictionary, 'createdAt' | 'updatedAt'>>({
    key_code: '',
    category: '',
    zh_cn: '',
    en_ph: '',
    description: ''
  });

  // 加载词库数据
  useEffect(() => {
    loadDictionaries();
  }, []);

  const loadDictionaries = async () => {
    try {
      setLoading(true);
      const data = await dictionaryAPI.getDictionaryEntries();
      setDictionaries(data);
    } catch (err) {
      console.error('加载词库失败:', err);
      setError('加载词库失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDict) {
        // 更新现有条目
        const updatedDict = await dictionaryAPI.updateDictionaryEntry(editingDict.key_code, formState);
        setDictionaries(prev => 
          prev.map(d => d.key_code === editingDict.key_code ? updatedDict : d)
        );
        auditLogger.log('dictionary_updated', { key_code: editingDict.key_code, user: 'current_user' });
      } else {
        // 创建新条目
        const newDict = await dictionaryAPI.createDictionaryEntry(formState);
        setDictionaries(prev => [...prev, newDict]);
        auditLogger.log('dictionary_created', { key_code: formState.key_code, user: 'current_user' });
      }
      
      resetForm();
    } catch (err) {
      console.error('保存词库条目失败:', err);
      setError('保存词库条目失败');
    }
  };

  const handleEdit = (dict: SystemDictionary) => {
    setEditingDict(dict);
    setFormState({
      key_code: dict.key_code,
      category: dict.category,
      zh_cn: dict.zh_cn,
      en_ph: dict.en_ph,
      description: dict.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (key_code: string) => {
    if (window.confirm('确定要删除这个词库条目吗？')) {
      try {
        const success = await dictionaryAPI.deleteDictionaryEntry(key_code);
        if (success) {
          setDictionaries(prev => prev.filter(d => d.key_code !== key_code));
          auditLogger.log('dictionary_deleted', { key_code, user: 'current_user' });
        }
      } catch (err) {
        console.error('删除词库条目失败:', err);
        setError('删除词库条目失败');
      }
    }
  };

  const resetForm = () => {
    setFormState({
      key_code: '',
      category: '',
      zh_cn: '',
      en_ph: '',
      description: ''
    });
    setEditingDict(null);
    setShowForm(false);
    setError(null);
  };

  const filteredDictionaries = dictionaries.filter(dict => {
    const matchesSearch = !searchTerm || 
      dict.key_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dict.zh_cn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dict.en_ph.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dict.description && dict.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || dict.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(dictionaries.map(d => d.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-500">加载词库中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">词库管理</h1>
          <p className="text-slate-600">管理系统翻译词典</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:mt-0"
        >
          <Plus size={18} />
          添加词条
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜索关键词、中文或英文..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded border border-slate-300 px-3 py-2"
            >
              <option value="">所有分类</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 词库列表 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">关键词</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">分类</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">中文</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">英文/菲律宾文</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">描述</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredDictionaries.map((dict) => (
                <tr key={dict.key_code} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm text-slate-700">{dict.key_code}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {dict.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">{dict.zh_cn}</td>
                  <td className="px-4 py-3">{dict.en_ph}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{dict.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(dict)}
                        className="rounded bg-blue-100 p-1 text-blue-700 hover:bg-blue-200"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(dict.key_code)}
                        className="rounded bg-red-100 p-1 text-red-700 hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDictionaries.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            {searchTerm || filterCategory ? '没有找到匹配的词库条目' : '暂无词库条目'}
          </div>
        )}
      </div>

      {/* 添加/编辑表单 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingDict ? '编辑词库条目' : '添加词库条目'}
              </h3>
              <button
                onClick={resetForm}
                className="rounded-full p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    关键词 (唯一标识)
                  </label>
                  <input
                    type="text"
                    name="key_code"
                    value={formState.key_code}
                    onChange={handleFormChange}
                    required
                    disabled={!!editingDict}
                    className="w-full rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                    placeholder="如: ORDER_PENDING"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    分类
                  </label>
                  <select
                    name="category"
                    value={formState.category}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded border border-slate-300 px-3 py-2"
                  >
                    <option value="">选择分类</option>
                    <option value="STATUS">状态</option>
                    <option value="PAYMENT">支付</option>
                    <option value="UI">界面操作</option>
                    <option value="EXPENSE">财务分类</option>
                    <option value="OTHER">其他</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  中文显示
                </label>
                <input
                  type="text"
                  name="zh_cn"
                  value={formState.zh_cn}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="如: 待接单"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  英文/菲律宾文显示
                </label>
                <input
                  type="text"
                  name="en_ph"
                  value={formState.en_ph}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="如: Pending / New Order"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  描述
                </label>
                <textarea
                  name="description"
                  value={formState.description}
                  onChange={handleFormChange}
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  placeholder="词条用途备注"
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <Save size={18} />
                  保存
                </button>
                <button
                  type="button"
                  onClick={resetForm}
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
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default DictionaryManagement;