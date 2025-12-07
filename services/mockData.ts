
import { Category, Dish, Order, OrderStatus, Expense, ExpenseCategory, Ingredient, KTVRoom, SignBillAccount, HotelRoom } from '../types';

export const INITIAL_DISHES: Dish[] = [
  {
    id: '1',
    name: '江西小炒黄牛肉',
    description: '经典辣味小炒，搭配鲜红辣椒和香菜，鲜嫩多汁，香辣开胃，江西菜的代表作。',
    price: 560,
    category: Category.HOT_DISH,
    imageUrl: 'https://picsum.photos/400/300?random=1',
    available: true,
    spiciness: 3
  },
  {
    id: '2',
    name: '粉蒸肉',
    description: '五花肉裹上香料米粉，蒸至软糯，肥而不腻，米粉香气浓郁。',
    price: 480,
    category: Category.HOT_DISH,
    imageUrl: 'https://picsum.photos/400/300?random=2',
    available: true,
    spiciness: 1
  },
  {
    id: '3',
    name: '南昌拌粉',
    description: '传统米粉搭配花生米、萝卜干、剁椒和特制酱汁搅拌，爽滑劲道。',
    price: 230,
    category: Category.STAPLE,
    imageUrl: 'https://picsum.photos/400/300?random=3',
    available: true,
    spiciness: 2
  },
  {
    id: '4',
    name: '鄱阳湖胖鱼头',
    description: '选用鄱阳湖大鱼头，剁椒红烧，肉质鲜美，汤汁浓郁。',
    price: 1050,
    category: Category.SPECIAL,
    imageUrl: 'https://picsum.photos/400/300?random=4',
    available: false,
    spiciness: 2
  },
  {
    id: '5',
    name: '瓦罐土鸡汤',
    description: '采用传统瓦罐煨制，加入中药材慢火细炖，汤鲜味美，滋补养生。',
    price: 720,
    category: Category.SOUP,
    imageUrl: 'https://picsum.photos/400/300?random=5',
    available: true,
    spiciness: 0
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    tableNumber: 'LOBBY',
    source: 'LOBBY',
    items: [
      { dishId: '1', dishName: '江西小炒黄牛肉', quantity: 1, price: 560 },
      { dishId: '3', dishName: '南昌拌粉', quantity: 2, price: 230 }
    ],
    status: OrderStatus.SERVED,
    totalAmount: 1020,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    notes: 'Less Oil / 少放油'
  },
  {
    id: 'ORD-1002',
    tableNumber: 'LOBBY',
    source: 'LOBBY',
    items: [
      { dishId: '2', dishName: '粉蒸肉', quantity: 1, price: 480 },
      { dishId: '5', dishName: '瓦罐土鸡汤', quantity: 1, price: 720 }
    ],
    status: OrderStatus.COOKING,
    totalAmount: 1200,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'ORD-1003',
    tableNumber: '8205',
    source: 'ROOM_SERVICE',
    items: [
      { dishId: '1', dishName: '江西小炒黄牛肉', quantity: 2, price: 560 }
    ],
    status: OrderStatus.PENDING,
    totalAmount: 1120,
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString()
  },
  {
    id: 'ORD-1004',
    tableNumber: 'Takeout-001',
    source: 'TAKEOUT',
    items: [
      { dishId: '3', dishName: '南昌拌粉', quantity: 5, price: 230 }
    ],
    status: OrderStatus.PENDING,
    totalAmount: 1150,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    notes: 'Deliver to Malibay Plaza'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'EXP-1',
    amount: 5000,
    category: ExpenseCategory.INGREDIENTS,
    description: '每日蔬菜肉类采购 / Daily Market',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // Yesterday
  },
  {
    id: 'EXP-2',
    amount: 2000,
    category: ExpenseCategory.UTILITIES,
    description: '燃气费充值 / Gas Refill',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  },
  {
    id: 'EXP-3',
    amount: 1200,
    category: ExpenseCategory.MAINTENANCE,
    description: '更换厨房灯泡 / Kitchen Light Fix',
    date: new Date(Date.now()).toISOString() // Today
  }
];

export const INITIAL_INVENTORY: Ingredient[] = [
  { id: 'ING-1', name: '黄牛肉 (Beef)', quantity: 15, unit: 'kg', threshold: 5, updatedAt: new Date().toISOString() },
  { id: 'ING-2', name: '五花肉 (Pork Belly)', quantity: 8, unit: 'kg', threshold: 10, updatedAt: new Date().toISOString() },
  { id: 'ING-3', name: '江西米粉 (Rice Noodle)', quantity: 50, unit: 'pack', threshold: 20, updatedAt: new Date().toISOString() },
  { id: 'ING-4', name: '红尖椒 (Chili)', quantity: 2, unit: 'kg', threshold: 3, updatedAt: new Date().toISOString() },
  { id: 'ING-5', name: '菜籽油 (Oil)', quantity: 12, unit: 'bottle', threshold: 2, updatedAt: new Date().toISOString() },
  { id: 'ING-6', name: '胖鱼头 (Fish Head)', quantity: 4, unit: 'pc', threshold: 5, updatedAt: new Date().toISOString() },
];

// Single KTV VIP Room
export const INITIAL_KTV_ROOMS: KTVRoom[] = [
  { id: 'KTV-VIP', name: '4F-VIP豪包', type: 'VIP', status: 'Available', hourlyRate: 1500, currentSong: '', currentSession: undefined },
];

export const INITIAL_SIGN_BILL_ACCOUNTS: SignBillAccount[] = [
  {
    id: 'SB-001',
    name: '市建工集团-李总',
    cooperationMethod: '协议单位',
    settlementMethod: '月结',
    approver: '张总经理',
    phoneNumber: '09171234567',
    currentDebt: 45000,
    status: 'Active',
    lastTransactionDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'SB-002',
    name: 'Solar Casino Marketing',
    cooperationMethod: '长期合作',
    settlementMethod: '季结',
    approver: '王店长',
    phoneNumber: '09668888888',
    currentDebt: 125000,
    creditLimit: 500000,
    status: 'Active',
    lastTransactionDate: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
  },
  {
    id: 'SB-003',
    name: 'Mr. Tan (VIP)',
    cooperationMethod: '熟客挂帐',
    settlementMethod: '单笔结',
    approver: '张总经理',
    phoneNumber: '09999999999',
    currentDebt: 0,
    status: 'Active',
    lastTransactionDate: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString()
  }
];

// Generate Hotel Rooms: 82xx (2F) and 83xx (3F)
// Logic: Skip any number containing '4' (e.g. 8204, 8214, 8224, 8234, 8240-8249)
const generateHotelRooms = (): HotelRoom[] => {
  const rooms: HotelRoom[] = [];
  
  const createRoomsForFloor = (floorPrefix: string, floorNum: number) => {
    let count = 0;
    // Iterate enough times to get ~30 rooms even after skipping 4s
    for (let i = 1; i <= 60; i++) {
      const numStr = i.toString().padStart(2, '0');
      // FILTER: Skip any room number containing '4'
      if (numStr.includes('4')) continue;
      
      const fullNumber = `${floorPrefix}${numStr}`;
      // Also check full number just in case (e.g. 84xx - though we are doing 82/83)
      if (fullNumber.includes('4')) continue;

      rooms.push({
        id: `RM-${fullNumber}`,
        number: fullNumber,
        floor: floorNum,
        status: 'Vacant',
        orders: []
      });
      
      count++;
      if (count >= 32) break; // Limit to 32 rooms per floor
    }
  };

  createRoomsForFloor('82', 2); // 2nd Floor
  createRoomsForFloor('83', 3); // 3rd Floor
  
  // Mock a few active rooms
  if (rooms.length > 5) {
      rooms[2].status = 'Occupied'; // e.g. 8203
      rooms[2].guestName = 'Mr. Chen';
  }
  
  return rooms;
};

export const INITIAL_HOTEL_ROOMS: HotelRoom[] = generateHotelRooms();