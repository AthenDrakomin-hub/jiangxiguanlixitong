// Cache utility for storing and retrieving data with expiration
const CACHE_PREFIX = 'jx_cache_';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * Set data in cache with expiration
 * @param key - Cache key
 * @param data - Data to cache
 * @param duration - Cache duration in milliseconds (default: 5 minutes)
 */
export const setCache = <T>(
  key: string,
  data: T,
  duration: number = DEFAULT_CACHE_DURATION
): void => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const expiry = Date.now() + duration;
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry,
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Failed to set cache:', error);
  }
};

/**
 * Get data from cache if not expired
 * @param key - Cache key
 * @returns Cached data or null if not found or expired
 */
export const getCache = <T>(key: string): T | null => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const cacheItem: CacheItem<T> = JSON.parse(cached);

    // Check if cache has expired
    if (Date.now() > cacheItem.expiry) {
      // Remove expired cache
      localStorage.removeItem(cacheKey);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.warn('Failed to get cache:', error);
    return null;
  }
};

/**
 * Clear cache by key
 * @param key - Cache key to clear
 */
export const clearCache = (key: string): void => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = (): void => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear all cache:', error);
  }
};

/**
 * Get cache info (timestamp and expiry) without returning data
 * @param key - Cache key
 * @returns Cache metadata or null if not found
 */
export const getCacheInfo = (
  key: string
): { timestamp: number; expiry: number } | null => {
  try {
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const cacheItem: CacheItem<unknown> = JSON.parse(cached);
    return {
      timestamp: cacheItem.timestamp,
      expiry: cacheItem.expiry,
    };
  } catch (error) {
    console.warn('Failed to get cache info:', error);
    return null;
  }
};
