
/**
 * Upstash Redis 客户端 - 优化版
 * 
 * 适配 Vercel KV 自动注入的环境变量
 */

import { Redis } from '@upstash/redis';

// 优先读取 Vercel KV 自动注入的变量，其次读取 Upstash 原生变量
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

let redisClient: Redis | null = null;

/**
 * 获取 Redis 客户端实例 (单例)
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    if (!redisUrl || !redisToken) {
      console.warn('⚠️ 数据库环境变量未配置 (KV_REST_API_URL / TOKEN)');
      return createFallbackRedisClient();
    }

    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
      automaticDeserialization: true,
    });
    console.log('✅ 数据库客户端初始化成功');
  }
  return redisClient;
}

/**
 * 模拟客户端 - 用于开发环境或未配置数据库时防止系统崩溃
 */
function createFallbackRedisClient(): Redis {
  const memoryStore = new Map<string, any>();
  console.info('🛠️ 系统正运行在【模拟数据库】模式');
  
  return {
    get: async (key: string) => memoryStore.get(key) || null,
    set: async (key: string, value: any) => { memoryStore.set(key, value); return 'OK'; },
    del: async (key: string) => memoryStore.delete(key) ? 1 : 0,
    smembers: async (key: string) => memoryStore.get(key) || [],
    sadd: async (key: string, member: string) => {
      const s = new Set(memoryStore.get(key) || []);
      s.add(member);
      memoryStore.set(key, Array.from(s));
      return 1;
    },
    srem: async (key: string, member: string) => {
      const s = new Set(memoryStore.get(key) || []);
      const res = s.delete(member) ? 1 : 0;
      memoryStore.set(key, Array.from(s));
      return res;
    },
    ping: async () => 'PONG'
  } as any;
}

/**
 * 获取连接状态详情
 */
export function getConnectionStatus() {
  return {
    connected: !!redisClient,
    hasUrl: !!redisUrl,
    hasToken: !!redisToken,
    isRealConnection: !!(redisUrl && redisToken),
    ready: !!(redisUrl && redisToken && redisClient)
  };
}

// Fixed: Add testRedisConnection implementation
export async function testRedisConnection() {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return { connected: result === 'PONG' };
  } catch (error: any) {
    return { connected: false, error: error.message };
  }
}

export default getRedisClient();
