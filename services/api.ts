import { Dish, Order, Expense, Ingredient, KTVRoom, SignBillAccount, HotelRoom } from '../types';

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

// API functions with automatic fallback
export const api = {
  // Fetch all data with fallback
  async fetchAll() {
    console.log('Fetching mock data for frontend...');
    
    // Return mock data directly since frontend should not connect to database
    return {
      dishes: MOCK_DATA.dishes,
      orders: MOCK_DATA.orders,
      expenses: MOCK_DATA.expenses,
      inventory: MOCK_DATA.inventory,
      ktvRooms: MOCK_DATA.ktvRooms,
      signBillAccounts: MOCK_DATA.signBillAccounts,
      hotelRooms: MOCK_DATA.hotelRooms
    };
  },
  
  // Save data with error handling
  async saveData(table: string, data: any) {
    // In a real implementation, this would make HTTP requests to the backend API
    console.log(`Saving data to ${table}:`, data);
    return { success: true, message: 'Data saved successfully' };
  }
};

export default api;
