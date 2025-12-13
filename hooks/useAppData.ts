import { useState, useEffect, useCallback } from 'react';
import { getCache, setCache, clearCache } from '../utils/cache';
import { apiClient } from '../services/apiClient';
import { Dish, Order, Expense, Ingredient, KTVRoom, SignBillAccount, HotelRoom } from '../types';

/**
 * App data structure
 */
interface AppData {
  dishes: Dish[];
  orders: Order[];
  expenses: Expense[];
  inventory: Ingredient[];
  ktvRooms: KTVRoom[];
  signBillAccounts: SignBillAccount[];
  hotelRooms: HotelRoom[];
}

/**
 * Custom hook for managing all app data with caching
 * @param cacheDuration - Cache duration in milliseconds (default: 5 minutes)
 * @returns Object containing app data, loading state, error, and refresh function
 */
export const useAppData = (cacheDuration: number = 5 * 60 * 1000) => {
  const [data, setData] = useState<AppData>({
    dishes: [],
    orders: [],
    expenses: [],
    inventory: [],
    ktvRooms: [],
    signBillAccounts: [],
    hotelRooms: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllData = useCallback(async (useCache: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get from cache first if caching is enabled
      if (useCache) {
        const cachedData = getCache<AppData>('app_data');
        if (cachedData) {
          console.log('[Cache Hit] Returning cached app data');
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      // Fetch fresh data from API
      const response = await apiClient.fetchAll();
      
      const appData: AppData = {
        dishes: response.dishes || [],
        orders: response.orders || [],
        expenses: response.expenses || [],
        inventory: response.inventory || [],
        ktvRooms: response.ktvRooms || [],
        signBillAccounts: response.signBillAccounts || [],
        hotelRooms: response.hotelRooms || []
      };
      
      // Cache the data if caching is enabled
      if (useCache) {
        setCache('app_data', appData, cacheDuration);
      }
      
      setData(appData);
      return appData;
    } catch (err) {
      console.error('Failed to fetch app data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [cacheDuration]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Refresh function to force fetch fresh data
  const refresh = useCallback(() => {
    return fetchAllData(false); // Force fresh data without cache
  }, [fetchAllData]);

  // Clear cache function
  const clearAppCache = useCallback(() => {
    clearCache('app_data');
  }, []);

  return { data, loading, error, refresh, clearAppCache };
};