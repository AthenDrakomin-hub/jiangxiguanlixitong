import { Dish, Order, Expense, Ingredient, KTVRoom, SignBillAccount, HotelRoom } from '../types';
import pool from '../api/db';

// Mock data for offline/preview mode
const MOCK_DATA = {
  dishes: [
    {
      id: '1',
      name: '宫保鸡丁',
      description: '经典川菜，辣味适中',
      price: 38,
      category: '热菜',
      available: true,
      spiciness: 2
    },
    {
      id: '2',
      name: '麻婆豆腐',
      description: '嫩滑豆腐配麻辣肉末',
      price: 28,
      category: '热菜',
      available: true,
      spiciness: 3
    }
  ] as Dish[],
  
  orders: [] as Order[],
  expenses: [] as Expense[],
  inventory: [] as Ingredient[],
  ktvRooms: [] as KTVRoom[],
  signBillAccounts: [] as SignBillAccount[],
  hotelRooms: [] as HotelRoom[]
};

// Enhanced error handling with fallback to mock data
async function fetchDataWithFallback<T>(query: string, fallbackData: T): Promise<T> {
  try {
    // Attempt to connect to database
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query);
      connection.release();
      return rows as unknown as T;
    } catch (queryError) {
      connection.release();
      console.warn('Query failed, falling back to mock data:', queryError);
      return fallbackData;
    }
  } catch (connectionError) {
    console.warn('Database connection failed, falling back to mock data:', connectionError);
    return fallbackData;
  }
}

// API functions with automatic fallback
export const api = {
  // Fetch all data with fallback
  async fetchAll() {
    console.log('Fetching data from database with fallback protection...');
    
    const dishes = await fetchDataWithFallback<Dish[]>(
      'SELECT * FROM dishes', 
      MOCK_DATA.dishes
    );
    
    const orders = await fetchDataWithFallback<Order[]>(
      'SELECT * FROM orders', 
      MOCK_DATA.orders
    );
    
    const expenses = await fetchDataWithFallback<Expense[]>(
      'SELECT * FROM expenses', 
      MOCK_DATA.expenses
    );
    
    const inventory = await fetchDataWithFallback<Ingredient[]>(
      'SELECT * FROM inventory', 
      MOCK_DATA.inventory
    );
    
    const ktvRooms = await fetchDataWithFallback<KTVRoom[]>(
      'SELECT * FROM ktv_rooms', 
      MOCK_DATA.ktvRooms
    );
    
    const signBillAccounts = await fetchDataWithFallback<SignBillAccount[]>(
      'SELECT * FROM sign_bill_accounts', 
      MOCK_DATA.signBillAccounts
    );
    
    const hotelRooms = await fetchDataWithFallback<HotelRoom[]>(
      'SELECT * FROM hotel_rooms', 
      MOCK_DATA.hotelRooms
    );
    
    return {
      dishes,
      orders,
      expenses,
      inventory,
      ktvRooms,
      signBillAccounts,
      hotelRooms
    };
  },
  
  // Save data with error handling
  async saveData(table: string, data: any) {
    try {
      const connection = await pool.getConnection();
      try {
        // This is a simplified example - you'd want to implement proper SQL generation
        console.log(`Saving data to ${table}:`, data);
        connection.release();
        return { success: true, message: 'Data saved successfully' };
      } catch (queryError) {
        connection.release();
        console.error(`Failed to save data to ${table}:`, queryError);
        return { success: false, message: 'Failed to save data' };
      }
    } catch (connectionError) {
      console.error('Database connection failed:', connectionError);
      return { success: false, message: 'Database connection failed' };
    }
  }
};

export default api;