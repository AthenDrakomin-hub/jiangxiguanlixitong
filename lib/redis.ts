/**
 * Upstash Redis 客户端 - 官方集成方案
 * 
 * 实现 Vercel 与 Upstash Redis 的最佳实践集成
 * 遵循官方推荐的连接管理、安全配置和性能优化方案
 */

import { Redis } from '@upstash/redis';

// 环境变量验证 - 确保必要配置存在
const requiredEnvVars = [
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Missing required environment variable: ${envVar}`);
  }
}

// Redis 客户端实例（单例模式，避免重复创建）
let redisClient: Redis | null = null;

/**
 * 获取 Redis 客户端实例
 * 实现连接复用，提升性能并减少连接数
 * 
 * @returns Redis 客户端实例
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    // 验证环境变量
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    
    if (!url || !token) {
      console.warn(
        '⚠️  Missing Upstash Redis environment variables. ' +
        'Running in fallback mode with limited functionality.'
      );
      // 在开发环境中，如果没有环境变量，创建一个模拟的客户端
      // 这样可以让前端在本地开发时正常运行
      redisClient = createFallbackRedisClient();
    } else {
      // 创建 Redis 客户端实例
      redisClient = new Redis({
        url,
        token,
        // 启用自动反序列化，简化数据处理
        automaticDeserialization: true,
      });

      console.log('✅ Redis client initialized successfully');
    }
  }

  return redisClient;
}

/**
 * 创建一个模拟的Redis客户端用于本地开发
 * 当环境变量缺失时使用
 */
function createFallbackRedisClient(): Redis {
  // 创建一个简单的内存存储模拟器
  const memoryStore = new Map<string, any>();
  
  // 返回一个模拟的Redis客户端
  return {
    get: async (key: string) => {
      return memoryStore.get(key) || null;
    },
    set: async (key: string, value: any) => {
      memoryStore.set(key, value);
      return 'OK';
    },
    del: async (key: string) => {
      const existed = memoryStore.has(key);
      memoryStore.delete(key);
      return existed ? 1 : 0;
    },
    smembers: async (key: string) => {
      const value = memoryStore.get(key);
      return Array.isArray(value) ? value : [];
    },
    sadd: async (key: string, ...members: string[]) => {
      let added = 0;
      let current = memoryStore.get(key) as string[] || [];
      
      for (const member of members) {
        if (!current.includes(member)) {
          current.push(member);
          added++;
        }
      }
      
      memoryStore.set(key, current);
      return added;
    },
    srem: async (key: string, ...members: string[]) => {
      let removed = 0;
      let current = memoryStore.get(key) as string[] || [];
      
      for (const member of members) {
        const index = current.indexOf(member);
        if (index !== -1) {
          current.splice(index, 1);
          removed++;
        }
      }
      
      memoryStore.set(key, current);
      return removed;
    },
    ping: async () => {
      return 'PONG';
    },
    // 添加其他可能需要的方法
    json: {
      get: async (key: string) => {
        return memoryStore.get(key) || null;
      },
      set: async (key: string, path: string, value: any) => {
        // 使用路径信息构建存储键，模拟Redis JSON.set行为
        const storageKey = path !== '$' ? `${key}:${path}` : key;
        memoryStore.set(storageKey, value);
        return 'OK';
      }
    }
  } as Redis;
}

/**
 * 测试 Redis 连接状态
 * 
 * @returns 连接状态和详细信息
 */
export async function testRedisConnection(): Promise<{
  connected: boolean;
  error?: string;
  info?: Record<string, any>;
}> {
  try {
    const client = getRedisClient();
    
    // 执行简单的 ping 操作测试连接
    const result = await client.ping();
    
    if (result === 'PONG') {
      return {
        connected: true,
        info: { ping: result }
      };
    }
    
    return {
      connected: false,
      error: 'Unexpected ping response'
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 获取连接状态详情
 * 
 * @returns 详细的连接状态信息
 */
export function getConnectionStatus() {
  const hasUrl = !!process.env.KV_REST_API_URL;
  const hasToken = !!process.env.KV_REST_API_TOKEN;
  const isInitialized = !!redisClient;
  
  return {
    connected: isInitialized,
    hasUrl,
    hasToken,
    urlPreview: process.env.KV_REST_API_URL 
      ? `${process.env.KV_REST_API_URL.substring(0, 30)}...` 
      : 'NOT_SET',
    initialized: isInitialized,
    ready: hasUrl && hasToken && isInitialized
  };
}

// 导出默认的 Redis 客户端实例
export default getRedisClient();