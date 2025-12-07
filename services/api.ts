
import { Dish, Order, Expense, Ingredient, KTVRoom, SignBillAccount, HotelRoom, ApiResponse } from '../types';
import { getSupabase } from './supabaseClient';
import { INITIAL_DISHES, INITIAL_KTV_ROOMS, INITIAL_HOTEL_ROOMS } from './mockData';

// Helper to wrap response
const success = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString()
});

// Helper to handle Supabase fetch errors or empty states
async function fetchTable<T>(tableName: string, fallback: T): Promise<T> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return fallback;
    }
    // If empty (first launch), verify if we should return fallback or empty array
    // For fixed resources like Rooms, we might want to init them if table is empty
    if (!data || data.length === 0) {
        if (tableName === 'hotel_rooms' && Array.isArray(fallback) && fallback.length > 0) return fallback;
        if (tableName === 'ktv_rooms' && Array.isArray(fallback) && fallback.length > 0) return fallback;
        if (tableName === 'dishes' && Array.isArray(fallback) && fallback.length > 0) return fallback;
        return [] as unknown as T;
    }
    return data as unknown as T;
  } catch (e) {
    console.error(`Exception fetching ${tableName}:`, e);
    return fallback;
  }
}

// Helper to save (upsert) data
// Note: Frontend sends the *entire* array. 
// Ideally we should only send changed rows, but to match existing architecture, we upsert the whole batch.
async function saveTable(tableName: string, data: any[]) {
  if (!data || data.length === 0) return;
  
  const supabase = getSupabase();
  const { error } = await supabase.from(tableName).upsert(data);
  if (error) {
    console.error(`Error saving ${tableName}:`, error);
    throw error;
  }
}

export const DataAPI = {
  /**
   * Initialize all application data from Supabase
   */
  async fetchAll() {
    console.log("⚡ Fetching data from Supabase...");
    
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
      dishes: success(dishes),
      orders: success(orders),
      expenses: success(expenses),
      inventory: success(inventory),
      ktvRooms: success(ktvRooms),
      signBillAccounts: success(signBillAccounts),
      hotelRooms: success(hotelRooms)
    };
  },

  /**
   * Menu Operations
   */
  Menu: {
    async save(dishes: Dish[]) {
      await saveTable('dishes', dishes);
      return success(true);
    }
  },

  /**
   * Order Operations
   */
  Orders: {
    async save(orders: Order[]) {
      await saveTable('orders', orders);
      return success(true);
    }
  },

  /**
   * Inventory Operations
   */
  Inventory: {
    async save(inventory: Ingredient[]) {
      await saveTable('inventory', inventory);
      return success(true);
    }
  },

  /**
   * Finance Operations
   */
  Finance: {
    async save(expenses: Expense[]) {
      await saveTable('expenses', expenses);
      return success(true);
    }
  },

  /**
   * KTV Operations
   */
  KTV: {
    async save(rooms: KTVRoom[]) {
      await saveTable('ktv_rooms', rooms);
      return success(true);
    }
  },

  /**
   * Sign Bill Operations
   */
  SignBill: {
    async save(accounts: SignBillAccount[]) {
      await saveTable('sign_bill_accounts', accounts);
      return success(true);
    }
  },

  /**
   * Hotel Room Operations
   */
  Hotel: {
    async save(rooms: HotelRoom[]) {
      await saveTable('hotel_rooms', rooms);
      return success(true);
    }
  }
};
