import { StorageSettings } from "../types";

const SETTINGS_KEY = 'jx_storage_settings';

// Default Settings
export const DEFAULT_STORAGE_SETTINGS: StorageSettings = {
  type: 'blob', // Use Vercel Blob storage as default
};

export const getStorageSettings = (): StorageSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      // Merge with defaults to ensure new fields exist if loading old settings
      return { ...DEFAULT_STORAGE_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_STORAGE_SETTINGS;
  } catch (e) {
    return DEFAULT_STORAGE_SETTINGS;
  }
};

export const saveStorageSettings = (settings: StorageSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Deprecated: Old storage methods kept only if needed for migration utilities later
// All data logic is now handled exclusively by Vercel Blob Storage
export const loadData = async <T>(_key: string, defaultData: T): Promise<T> => {
    return defaultData;
};

export const saveData = async <T>(_key: string, _data: T): Promise<void> => {
    // No-op
};