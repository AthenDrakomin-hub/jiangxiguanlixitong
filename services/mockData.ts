
import { Category, Dish, Order, OrderStatus, Expense, ExpenseCategory, Ingredient, KTVRoom, SignBillAccount, HotelRoom } from '../types';

// 1. Menu: Start Empty
export const INITIAL_DISHES: Dish[] = [];

// 2. Orders: Start Empty
export const INITIAL_ORDERS: Order[] = [];

// 3. Expenses: Start Empty
export const INITIAL_EXPENSES: Expense[] = [];

// 4. Inventory: Start Empty
export const INITIAL_INVENTORY: Ingredient[] = [];

// 5. KTV Rooms: Infrastructure exists, but status is available/empty
export const INITIAL_KTV_ROOMS: KTVRoom[] = [
  { id: 'KTV-VIP', name: '4F-VIP豪包', type: 'VIP', status: 'Available', hourlyRate: 1500, currentSong: '', currentSession: undefined },
  { id: 'KTV-01', name: '4F-K01', type: 'Large', status: 'Available', hourlyRate: 1000, currentSong: '', currentSession: undefined },
  { id: 'KTV-02', name: '4F-K02', type: 'Medium', status: 'Available', hourlyRate: 800, currentSong: '', currentSession: undefined },
  { id: 'KTV-03', name: '4F-K03', type: 'Small', status: 'Available', hourlyRate: 500, currentSong: '', currentSession: undefined },
];

// 6. Sign Bill Accounts: Start Empty
export const INITIAL_SIGN_BILL_ACCOUNTS: SignBillAccount[] = [];

// 7. Hotel Rooms: Generate room numbers (infrastructure), but ensure they are Vacant
// Logic: 82xx (2F) and 83xx (3F), skipping numbers with '4'
const generateHotelRooms = (): HotelRoom[] => {
  const rooms: HotelRoom[] = [];
  
  const createRoomsForFloor = (floorPrefix: string, floorNum: number) => {
    let count = 0;
    for (let i = 1; i <= 60; i++) {
      const numStr = i.toString().padStart(2, '0');
      if (numStr.includes('4')) continue;
      
      const fullNumber = `${floorPrefix}${numStr}`;
      if (fullNumber.includes('4')) continue;

      rooms.push({
        id: `RM-${fullNumber}`,
        number: fullNumber,
        floor: floorNum,
        status: 'Vacant', // Default to Vacant
        orders: [],       // No orders
        guestName: undefined
      });
      
      count++;
      if (count >= 32) break; 
    }
  };

  createRoomsForFloor('82', 2); // 2nd Floor
  createRoomsForFloor('83', 3); // 3rd Floor
  
  return rooms;
};

export const INITIAL_HOTEL_ROOMS: HotelRoom[] = generateHotelRooms();
