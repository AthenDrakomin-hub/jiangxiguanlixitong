import { useState, useEffect, useCallback } from 'react';
import { getCache, setCache } from '../utils/cache';
import { apiClient } from '../services/apiClient';

/**
 * Custom hook for fetching and caching data
 * @param endpoint - API endpoint to fetch data from
 * @param cacheKey - Key to use for caching
 * @param cacheDuration - Cache duration in milliseconds (default: 5 minutes)
 * @returns Object containing data, loading state, error, and refresh function
 */
export const useCachedData = <T>(
  endpoint: string,
  cacheKey: string,
  cacheDuration: number = 5 * 60 * 1000
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (useCache: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get from cache first if caching is enabled
      if (useCache) {
        const cachedData = getCache<T>(cacheKey);
        if (cachedData) {
          console.log(`[Cache Hit] Returning cached data for ${cacheKey}`);
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      // Fetch fresh data from API
      const response: any = await apiClient.get(endpoint);
      const fetchedData = response.data || response;
      
      // Cache the data if caching is enabled
      if (useCache) {
        setCache(cacheKey, fetchedData, cacheDuration);
      }
      
      setData(fetchedData);
      return fetchedData;
    } catch (err) {
      console.error(`Failed to fetch data from ${endpoint}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, cacheKey, cacheDuration]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh function to force fetch fresh data
  const refresh = useCallback(() => {
    return fetchData(false); // Force fresh data without cache
  }, [fetchData]);

  return { data, loading, error, refresh };
};