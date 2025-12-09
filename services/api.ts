import { Dish, Order, Expense, Ingredient, KTVRoom, SignBillAccount, HotelRoom, ApiResponse } from '../types';
import { getSupabase } from './supabaseClient';
import { INITIAL_DISHES, INITIAL_KTV_ROOMS, INITIAL_HOTEL_ROOMS } from './mockData';

// Helper to wrap response
const success = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString()
});

// Enhanced error handler with user-friendly messages
const handleError = <T>(error: any, operation: string, fallbackData: T): ApiResponse<T> => {
  console.error(`Error in ${operation}:`, error);
  
  // User-friendly error messages
  let message = "操作失败，请稍后重试";
  if (error?.message) {
    if (error.message.includes("NetworkError")) {
      message = "网络连接失败，请检查网络设置";
    } else if (error.message.includes("401") || error.message.includes("403")) {
      message = "权限不足，请检查登录状态";
    } else if (error.message.includes("404")) {
      message = "请求的资源不存在";
    } else if (error.message.includes("timeout")) {
      message = "请求超时，请稍后重试";
    }
  }
  
  return {
    success: false,
    data: fallbackData,
    message,
    timestamp: new Date().toISOString()
  };
};

// Helper to handle Supabase fetch errors or empty states
async function fetchTable<T>(tableName: string, fallback: T): Promise<ApiResponse<T>> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return handleError(error, `fetching ${tableName}`, fallback);
    }
    // If empty (first launch), verify if we should return fallback or empty array
    // For fixed resources like Rooms, we might want to init them if table is empty
    if (!data || data.length === 0) {
        if (tableName === 'hotel_rooms' && Array.isArray(fallback) && fallback.length > 0) return success(fallback);
        if (tableName === 'ktv_rooms' && Array.isArray(fallback) && fallback.length > 0) return success(fallback);
        if (tableName === 'dishes' && Array.isArray(fallback) && fallback.length > 0) return success(fallback);
        return success([] as unknown as T);
    }
    return success(data as unknown as T);
  } catch (e) {
    console.error(`Exception fetching ${tableName}:`, e);
    return handleError(e, `fetching ${tableName}`, fallback);
  }
}

// Helper to save (upsert) data
// Note: Frontend sends the *entire* array. 
// Ideally we should only send changed rows, but to match existing architecture, we upsert the whole batch.
async function saveTable(tableName: string, data: any[]): Promise<ApiResponse<boolean>> {
  if (!data || data.length === 0) return success(true);
  
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from(tableName).upsert(data);
    if (error) {
      console.error(`Error saving ${tableName}:`, error);
      return handleError(error, `saving ${tableName}`, false);
    }
    return success(true);
  } catch (e) {
    return handleError(e, `saving ${tableName}`, false);
  }
}

export const DataAPI = {
  /**
   * Initialize all application data from Supabase
   */
  async fetchAll() {
    console.log("⚡ Fetching data from Supabase...");
    
    try {
      const [dishes, orders, expenses, inventory, ktvRooms, signBillAccounts, hotelRooms] = await Promise.all([
        fetchTable<Dish[]>('dishes', INITIAL_DISHES),
        fetchTable<Order[]>('orders', []),
        fetchTable<Expense[]>('expenses', []),
        fetchTable<Ingredient[]>('inventory', []),
        fetchTable<KTVRoom[]>('ktv_rooms', INITIAL_KTV_ROOMS),
        fetchTable<SignBillAccount[]>('sign_bill_accounts', []),
        fetchTable<HotelRoom[]>('hotel_rooms', INITIAL_HOTEL_ROOMS)
      ]);
      
      return {
        dishes,
        orders,
        expenses,
        inventory,
        ktvRooms,
        signBillAccounts,
        hotelRooms
      };
    } catch (error) {
      console.error("Failed to load initial data", error);
      return handleError(error, "loading initial data", {
        dishes: INITIAL_DISHES,
        orders: [],
        expenses: [],
        inventory: [],
        ktvRooms: INITIAL_KTV_ROOMS,
        signBillAccounts: [],
        hotelRooms: INITIAL_HOTEL_ROOMS
      });
    }
  },

  /**
   * Menu Operations
   */
  Menu: {
    async save(dishes: Dish[]) {
      return await saveTable('dishes', dishes);
    }
  },

  /**
   * Order Operations
   */
  Orders: {
    async save(orders: Order[]) {
      return await saveTable('orders', orders);
    }
  },

  /**
   * Inventory Operations
   */
  Inventory: {
    async save(inventory: Ingredient[]) {
      return await saveTable('inventory', inventory);
    }
  },

  /**
   * Finance Operations
   */
  Finance: {
    async save(expenses: Expense[]) {
      return await saveTable('expenses', expenses);
    }
  },

  /**
   * KTV Operations
   */
  KTV: {
    async save(rooms: KTVRoom[]) {
      return await saveTable('ktv_rooms', rooms);
    }
  },

  /**
   * Sign Bill Operations
   */
  SignBill: {
    async save(accounts: SignBillAccount[]) {
      return await saveTable('sign_bill_accounts', accounts);
    }
  },

  /**
   * Hotel Room Operations
   */
  Hotel: {
    async save(rooms: HotelRoom[]) {
      return await saveTable('hotel_rooms', rooms);
    }
  }
};