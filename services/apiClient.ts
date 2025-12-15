import { getCache, setCache } from '../utils/cache';
import {
  Dish,
  Order,
  Expense,
  Ingredient,
  KTVRoom,
  SignBillAccount,
  HotelRoom,
  PaymentMethod,
} from '../types';

// 定义通用的API响应接口
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// 定义fetchAll返回的数据结构
interface FetchAllResponse {
  dishes: Dish[];
  orders: Order[];
  expenses: Expense[];
  inventory: Ingredient[];
  ktvRooms: KTVRoom[];
  signBillAccounts: SignBillAccount[];
  hotelRooms: HotelRoom[];
  paymentMethods: PaymentMethod[];
}

// 定义更具体的类型
type ApiData = Record<string, string | number | boolean | object | Array<any>>;

// Define the return type for fetchAll

export const apiClient = {
  // Generic GET request
  get: async (endpoint: string, useCache: boolean = false) => {
    try {
      // Try to get from cache first if caching is enabled
      if (useCache) {
        const cachedData = getCache(endpoint);
        if (cachedData) {
          console.log(`[Cache Hit] Returning cached data for ${endpoint}`);
          return cachedData;
        }
      }

      const response = await fetch(`/api/${endpoint}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Cache the data if caching is enabled
      if (useCache) {
        setCache(endpoint, data);
      }

      return data;
    } catch (error) {
      console.error(`Failed to fetch from ${endpoint}:`, error);
      throw error;
    }
  },

  // Generic POST request
  // 产品备注: 为data参数指定明确的类型，避免使用any
  post: async <T = any>(
    endpoint: string,
    data: ApiData
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to post to ${endpoint}:`, error);
      throw error;
    }
  },

  // Generic PUT request
  // 产品备注: 为data参数指定明确的类型，避免使用any
  put: async <T = any>(
    endpoint: string,
    id: string,
    data: ApiData
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`/api/${endpoint}?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to update ${endpoint} with id ${id}:`, error);
      throw error;
    }
  },

  // Generic DELETE request
  delete: async (endpoint: string, id: string) => {
    try {
      const response = await fetch(`/api/${endpoint}?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to delete ${endpoint} with id ${id}:`, error);
      throw error;
    }
  },

  // Fetch all data with fallback protection
  fetchAll: async (useCache: boolean = false) => {
    try {
      // Parallel fetch for better performance
      const [
        dishesRes,
        ordersRes,
        expensesRes,
        inventoryRes,
        ktvRoomsRes,
        signBillAccountsRes,
        hotelRoomsRes,
        paymentMethodsRes,
      ] = await Promise.allSettled([
        apiClient.get('dishes', useCache),
        apiClient.get('orders', useCache),
        apiClient.get('expenses', useCache),
        apiClient.get('inventory', useCache),
        apiClient.get('ktv_rooms', useCache),
        apiClient.get('sign_bill_accounts', useCache),
        apiClient.get('hotel_rooms', useCache),
        apiClient.get('payment_methods', useCache),
      ]);

      return {
        dishes: dishesRes.status === 'fulfilled' ? dishesRes.value.data : [],
        orders: ordersRes.status === 'fulfilled' ? ordersRes.value.data : [],
        expenses:
          expensesRes.status === 'fulfilled' ? expensesRes.value.data : [],
        inventory:
          inventoryRes.status === 'fulfilled' ? inventoryRes.value.data : [],
        ktvRooms:
          ktvRoomsRes.status === 'fulfilled' ? ktvRoomsRes.value.data : [],
        signBillAccounts:
          signBillAccountsRes.status === 'fulfilled'
            ? signBillAccountsRes.value.data
            : [],
        hotelRooms:
          hotelRoomsRes.status === 'fulfilled' ? hotelRoomsRes.value.data : [],
        paymentMethods:
          paymentMethodsRes.status === 'fulfilled'
            ? paymentMethodsRes.value.data
            : [],
      } as FetchAllResponse;
    } catch (error) {
      console.error('Critical failure in fetchAll:', error);
      throw error;
    }
  },

  // Create new record
  // 产品备注: 为data参数指定明确的类型，避免使用any
  create: async <T = any>(
    table: string,
    data: ApiData
  ): Promise<ApiResponse<T>> => {
    // Clear cache for this table when creating new record
    clearCacheForTable(table);
    return await apiClient.post<T>(table, data);
  },

  // Update existing record
  // 产品备注: 为data参数指定明确的类型，避免使用any
  update: async <T = any>(
    table: string,
    id: string,
    data: ApiData
  ): Promise<ApiResponse<T>> => {
    // Clear cache for this table when updating record
    clearCacheForTable(table);
    return await apiClient.put<T>(table, id, data);
  },

  // Delete record
  remove: async (table: string, id: string) => {
    // Clear cache for this table when deleting record
    clearCacheForTable(table);
    return await apiClient.delete(table, id);
  },
};

// Helper function to clear cache for a specific table
const clearCacheForTable = (table: string) => {
  try {
    localStorage.removeItem(`jx_cache_${table}`);
  } catch (error) {
    console.warn(`Failed to clear cache for table ${table}:`, error);
  }
};
