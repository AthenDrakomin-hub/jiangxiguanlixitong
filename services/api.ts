
import { Dish, Order, Expense, Ingredient, KTVRoom, SignBillAccount, HotelRoom, ApiResponse } from '../types';
import { loadData, saveData } from './storage';
import { INITIAL_DISHES, INITIAL_ORDERS, INITIAL_EXPENSES, INITIAL_INVENTORY, INITIAL_KTV_ROOMS, INITIAL_SIGN_BILL_ACCOUNTS, INITIAL_HOTEL_ROOMS } from './mockData';

const API_DELAY_MS = 300; 

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to wrap response
const success = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString()
});

export const DataAPI = {
  /**
   * Initialize all application data
   */
  async fetchAll() {
    // await delay(API_DELAY_MS); // Simulate network wait
    const [dishes, orders, expenses, inventory, ktvRooms, signBillAccounts, hotelRooms] = await Promise.all([
      loadData<Dish[]>('dishes', INITIAL_DISHES),
      loadData<Order[]>('orders', INITIAL_ORDERS),
      loadData<Expense[]>('expenses', INITIAL_EXPENSES),
      loadData<Ingredient[]>('inventory', INITIAL_INVENTORY),
      loadData<KTVRoom[]>('ktvRooms', INITIAL_KTV_ROOMS),
      loadData<SignBillAccount[]>('signBillAccounts', INITIAL_SIGN_BILL_ACCOUNTS),
      loadData<HotelRoom[]>('hotelRooms', INITIAL_HOTEL_ROOMS)
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
      await saveData('dishes', dishes);
      return success(true);
    }
  },

  /**
   * Order Operations
   */
  Orders: {
    async save(orders: Order[]) {
      await saveData('orders', orders);
      return success(true);
    }
  },

  /**
   * Inventory Operations
   */
  Inventory: {
    async save(inventory: Ingredient[]) {
      await saveData('inventory', inventory);
      return success(true);
    }
  },

  /**
   * Finance Operations
   */
  Finance: {
    async save(expenses: Expense[]) {
      await saveData('expenses', expenses);
      return success(true);
    }
  },

  /**
   * KTV Operations
   */
  KTV: {
    async save(rooms: KTVRoom[]) {
      await saveData('ktvRooms', rooms);
      return success(true);
    }
  },

  /**
   * Sign Bill Operations
   */
  SignBill: {
    async save(accounts: SignBillAccount[]) {
      await saveData('signBillAccounts', accounts);
      return success(true);
    }
  },

  /**
   * Hotel Room Operations
   */
  Hotel: {
    async save(rooms: HotelRoom[]) {
      await saveData('hotelRooms', rooms);
      return success(true);
    }
  }
};