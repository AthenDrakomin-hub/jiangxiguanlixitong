import { StorageSettings, S3Config, GitHubConfig } from "../types";

const SETTINGS_KEY = 'jx_storage_settings';

// Default Settings
export const DEFAULT_STORAGE_SETTINGS: StorageSettings = {
  type: 'local', // Use local storage as default
  s3Config: {
    region: 'auto',
    bucket: '',
    accessKeyId: '',
    secretAccessKey: '',
    endpoint: '' 
  },
  githubConfig: {
    owner: '',
    repo: '',
    branch: 'main',
    token: '', 
    pathPrefix: 'data'
  }
  // This configuration is no longer used since we've migrated to TiDB
  // supabaseConfig is optional and not included since we're not using Supabase
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
// Actual data logic is now handled by TiDB in tidbAPI.ts
export const loadData = async <T>(_key: string, defaultData: T): Promise<T> => {
    return defaultData;
};

export const saveData = async <T>(_key: string, _data: T): Promise<void> => {
    // No-op
};

export const testS3Connection = async (_config: S3Config): Promise<boolean> => { return false; };
export const testGitHubConnection = async (_config: GitHubConfig): Promise<boolean> => { return false; };