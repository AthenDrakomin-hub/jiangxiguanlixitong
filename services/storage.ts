import { StorageSettings, S3Config, GitHubConfig, TiDBConfig } from "../types";

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
  },
  // Note: TiDB configuration is managed through environment variables and db.ts
  // This is kept for backward compatibility and future extension
  tidbConfig: {
    host: '',
    port: 4000,
    user: '',
    password: '',
    database: '',
    ssl: true
  }
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
// Placeholder for future TiDB connection test
export const testTiDBConnection = async (_config: TiDBConfig): Promise<boolean> => { return false; };

// 添加 GitHub 数据同步功能
export const syncDataToGitHub = async (githubConfig: GitHubConfig, data: any, filename: string): Promise<boolean> => {
  try {
    const { owner, repo, branch, token, pathPrefix = 'data' } = githubConfig;
    
    // 准备文件路径
    const filePath = `${pathPrefix}/${filename}`;
    
    // 将数据转换为 JSON 字符串
    const content = JSON.stringify(data, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    // GitHub API URL
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    
    // 获取当前文件的 SHA（如果存在）
    let sha = '';
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (response.ok) {
        const fileInfo = await response.json();
        sha = fileInfo.sha;
      }
    } catch (e) {
      // 文件不存在，这是正常的
    }
    
    // 创建或更新文件
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update ${filename}`,
        content: encodedContent,
        branch: branch,
        sha: sha // 如果文件存在，需要提供 SHA
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('GitHub sync error:', error);
    return false;
  }
};

// 批量同步所有数据到 GitHub
export const syncAllDataToGitHub = async (githubConfig: GitHubConfig, allData: any): Promise<boolean> => {
  try {
    const tables = [
      'dishes', 'orders', 'expenses', 'inventory', 
      'ktv_rooms', 'sign_bill_accounts', 'hotel_rooms', 'payment_methods'
    ];
    
    // 并行同步所有数据表
    const results = await Promise.all(
      tables.map(table => {
        const data = allData[table] || [];
        return syncDataToGitHub(githubConfig, data, `${table}.json`);
      })
    );
    
    // 检查所有同步是否成功
    return results.every(result => result);
  } catch (error) {
    console.error('Batch sync error:', error);
    return false;
  }
};
