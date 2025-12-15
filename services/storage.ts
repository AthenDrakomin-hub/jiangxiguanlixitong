import { StorageSettings } from '../types';

const SETTINGS_KEY = 'jx_storage_settings';

// Default Settings
export const DEFAULT_STORAGE_SETTINGS: StorageSettings = {
  type: 'blob', // Use Vercel Blob storage as default
};

export const getStorageSettings = (): StorageSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_STORAGE_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_STORAGE_SETTINGS;
  } catch (error: unknown) {
    console.error('Failed to parse storage settings:', error);
    return DEFAULT_STORAGE_SETTINGS;
  }
};

export const saveStorageSettings = (settings: StorageSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Deprecated: Old storage methods kept only if needed for migration utilities later
// All data logic is now handled exclusively by Vercel Blob Storage
// 产品备注: 为loadData函数的参数指定明确的类型，避免使用any
export const loadData = async <T>(key: string, defaultData: T): Promise<T> => {
  console.warn(`loadData is deprecated. Key: ${key}`);
  return defaultData;
};

// 产品备注: 为saveData函数的参数指定明确的类型，避免使用any
export const saveData = async <T>(key: string, data: T): Promise<void> => {
  console.warn(`saveData is deprecated. Key: ${key}, Data:`, data);
  // No-op
};
