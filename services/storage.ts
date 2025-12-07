import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { StorageSettings, S3Config, GitHubConfig } from "../types";

const SETTINGS_KEY = 'jx_storage_settings';

// Default Settings
export const DEFAULT_STORAGE_SETTINGS: StorageSettings = {
  type: 'local',
  s3Config: {
    region: 'us-east-1',
    bucket: '',
    accessKeyId: '',
    secretAccessKey: ''
  },
  githubConfig: {
    owner: 'AthenDrakomin-hub',
    repo: 'Hotel-database',
    branch: 'main',
    token: '', // Security: Please input this in the UI Settings page
    pathPrefix: 'data'
  }
};

export const getStorageSettings = (): StorageSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...DEFAULT_STORAGE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_STORAGE_SETTINGS;
  } catch (e) {
    return DEFAULT_STORAGE_SETTINGS;
  }
};

export const saveStorageSettings = (settings: StorageSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// --- Utils: Base64 Handling for UTF-8 (Chinese support) ---
const encodeBase64 = (str: string) => {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
};

const decodeBase64 = (base64: string) => {
    const binString = atob(base64.replace(/\s/g, ''));
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    return new TextDecoder().decode(bytes);
};

// --- GitHub Helper ---

const getGitHubPath = (key: string, config: GitHubConfig) => {
  const folder = config.pathPrefix ? config.pathPrefix.replace(/\/$/, '') : 'data';
  return `${folder}/${key}.json`;
};

const githubDownload = async <T>(key: string, config: GitHubConfig): Promise<T | null> => {
  if (!config.token || !config.owner || !config.repo) return null;
  
  const path = getGitHubPath(key, config);
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API Error: ${res.statusText}`);

    const json = await res.json();
    if (json.content) {
      const decoded = decodeBase64(json.content);
      return JSON.parse(decoded) as T;
    }
  } catch (e) {
    console.error(`[GitHub] Failed to download ${key}:`, e);
  }
  return null;
};

const githubUpload = async (key: string, data: any, config: GitHubConfig) => {
  if (!config.token || !config.owner || !config.repo) return;

  const path = getGitHubPath(key, config);
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  const content = encodeBase64(JSON.stringify(data, null, 2));

  try {
    // 1. Get current SHA (Check if file exists)
    let sha: string | undefined;
    try {
       const getRes = await fetch(`${url}?ref=${config.branch}`, {
          headers: { 
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
       });
       if (getRes.ok) {
           const getJson = await getRes.json();
           sha = getJson.sha;
       }
    } catch (e) { /* File likely doesn't exist, proceed to create */ }

    // 2. PUT (Create or Update)
    // [skip ci] is added to commit message to prevent Vercel from triggering a new build on data change
    const body = {
        message: `Update ${key} data [skip ci]`, 
        content: content,
        branch: config.branch,
        sha: sha
    };

    const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(body)
    });

    if (!putRes.ok) {
        const errText = await putRes.text();
        console.error(`[GitHub] Failed to upload ${key}:`, errText);
    }
  } catch (e) {
    console.error(`[GitHub] Exception uploading ${key}:`, e);
  }
};

export const testGitHubConnection = async (config: GitHubConfig): Promise<boolean> => {
  if (!config.token || !config.owner || !config.repo) return false;
  try {
    // Try to fetch repo metadata to verify permissions
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return res.ok;
  } catch (e) {
    console.error("GitHub Connection Test Failed:", e);
    return false;
  }
};

// --- S3 Helper ---

const createS3Client = (config: S3Config) => {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint || undefined,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true, 
  });
};

const s3Upload = async (key: string, data: any, config: S3Config) => {
  const client = createS3Client(config);
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: `${key}.json`,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  });
  await client.send(command);
};

const s3Download = async <T>(key: string, config: S3Config): Promise<T | null> => {
  const client = createS3Client(config);
  try {
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: `${key}.json`,
    });
    const response = await client.send(command);
    if (response.Body) {
      const str = await response.Body.transformToString();
      return JSON.parse(str) as T;
    }
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw error;
  }
  return null;
};

// --- Main Service Methods ---

export const loadData = async <T>(key: string, defaultData: T): Promise<T> => {
  const settings = getStorageSettings();
  const localKey = `jx_${key}`;

  try {
    // Strategy: Try Remote first, fall back to Local, finally Default
    let remoteData: T | null = null;

    if (settings.type === 's3') {
       remoteData = await s3Download<T>(key, settings.s3Config);
    } else if (settings.type === 'github') {
       remoteData = await githubDownload<T>(key, settings.githubConfig);
    }

    if (remoteData) return remoteData;

    // Fallback to local
    const local = localStorage.getItem(localKey);
    return local ? JSON.parse(local) : defaultData;

  } catch (e) {
    console.warn(`[Storage] Failed to load ${key} from ${settings.type}, falling back to local.`, e);
    const local = localStorage.getItem(localKey);
    return local ? JSON.parse(local) : defaultData;
  }
};

export const saveData = async <T>(key: string, data: T): Promise<void> => {
  const settings = getStorageSettings();
  const localKey = `jx_${key}`;

  // Always save to local storage (Cache/Backup)
  try {
    localStorage.setItem(localKey, JSON.stringify(data));
  } catch (e) {
    console.error("[Storage] LocalStorage quota exceeded or error", e);
  }

  // Sync to Remote if enabled
  if (settings.type === 's3') {
    s3Upload(key, data, settings.s3Config).catch(err => {
      console.error(`[Storage] Failed to save ${key} to S3`, err);
    });
  } else if (settings.type === 'github') {
    githubUpload(key, data, settings.githubConfig).catch(err => {
      console.error(`[Storage] Failed to save ${key} to GitHub`, err);
    });
  }
};

export const testS3Connection = async (config: S3Config): Promise<boolean> => {
  try {
    const client = createS3Client(config);
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: 'connection_test.json',
      Body: JSON.stringify({ status: 'ok', time: new Date().toISOString() }),
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error("S3 Connection Test Failed:", error);
    return false;
  }
};