import { SystemDictionary } from '../types.js';
import { apiClient } from '../services/apiClient.js';

class DictionaryService {
  private static instance: DictionaryService;
  private dictionaryCache: Map<string, SystemDictionary> = new Map();
  private initialized = false;

  static getInstance(): DictionaryService {
    if (!DictionaryService.instance) {
      DictionaryService.instance = new DictionaryService();
    }
    return DictionaryService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const entries = await apiClient.fetchCollection<SystemDictionary>('system_dictionary');
      this.dictionaryCache.clear();
      entries.forEach(entry => {
        this.dictionaryCache.set(entry.key_code, entry);
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize dictionary cache:', error);
    }
  }

  // 获取翻译文本
  getTranslation(key_code: string, language: 'zh_cn' | 'en_ph' = 'zh_cn'): string {
    const entry = this.dictionaryCache.get(key_code);
    if (!entry) {
      // 如果找不到对应的词典条目，返回key_code作为fallback
      return key_code;
    }
    
    return entry[language] || key_code;
  }

  // 根据用户角色获取对应语言的翻译
  getTranslationForRole(key_code: string, userRole: string = 'staff'): string {
    // 管理员看中文，员工看菲律宾文
    const language = userRole === 'admin' || userRole === 'manager' ? 'zh_cn' : 'en_ph';
    return this.getTranslation(key_code, language);
  }

  // 获取词典条目
  getEntry(key_code: string): SystemDictionary | undefined {
    return this.dictionaryCache.get(key_code);
  }

  // 获取所有词典条目
  getAllEntries(): SystemDictionary[] {
    return Array.from(this.dictionaryCache.values());
  }

  // 获取特定分类的词典条目
  getEntriesByCategory(category: string): SystemDictionary[] {
    return this.getAllEntries().filter(entry => entry.category === category);
  }

  // 强制刷新缓存
  async refresh(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }
}

export const dictionaryService = DictionaryService.getInstance();