import { executeQuery } from './tidbClient';
import { 
  Dish, 
  Order, 
  Expense, 
  Ingredient, 
  KTVRoom, 
  SignBillAccount, 
  HotelRoom,
  ApiResponse
} from '../types';
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

// Initialize database tables
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create tables if they don't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS dishes (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        imageUrl VARCHAR(512),
        available BOOLEAN DEFAULT TRUE,
        spiciness INT DEFAULT 0
      )
    `);
    
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        tableNumber VARCHAR(50),
        source ENUM('LOBBY', 'ROOM_SERVICE', 'KTV', 'TAKEOUT') NOT NULL,
        status ENUM('待处理', '烹饪中', '已上菜', '已支付', '已完成', '已取消') NOT NULL,
        totalAmount DECIMAL(10, 2) NOT NULL,
        createdAt DATETIME NOT NULL,
        notes TEXT,
        paymentMethod VARCHAR(50)
      )
    `);
    
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY,
        orderId VARCHAR(36) NOT NULL,
        dishId VARCHAR(36) NOT NULL,
        dishName VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS inventory (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50),
        threshold DECIMAL(10, 2) DEFAULT 0,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(36) PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        category ENUM('食材采购', '员工工资', '店铺租金', '水电煤气', '维修保养', '其他支出') NOT NULL,
        description TEXT,
        date DATE NOT NULL
      )
    `);
    
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS ktv_rooms (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('Small', 'Medium', 'Large', 'VIP') NOT NULL,
        status ENUM('Available', 'InUse', 'Cleaning', 'Maintenance') NOT NULL,
        hourlyRate DECIMAL(10, 2) NOT NULL
      )
    `);
    
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS sign_bill_accounts (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cooperationMethod VARCHAR(255),
        settlementMethod VARCHAR(255),
        approver VARCHAR(255),
        phoneNumber VARCHAR(50),
        creditLimit DECIMAL(10, 2),
        currentDebt DECIMAL(10, 2) NOT NULL DEFAULT 0,
        status ENUM('Active', 'Inactive') NOT NULL,
        lastTransactionDate DATETIME
      )
    `);
    
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS hotel_rooms (
        id VARCHAR(36) PRIMARY KEY,
        number VARCHAR(20) NOT NULL,
        floor INT NOT NULL,
        status ENUM('Vacant', 'Occupied') NOT NULL,
        guestName VARCHAR(255),
        lastOrderTime DATETIME
      )
    `);
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error);
    throw error;
  }
};

export const DataAPI = {
  /**
   * Initialize all application data from TiDB
   */
  async fetchAll() {
    console.log("⚡ Fetching data from TiDB...");
    
    try {
      // Initialize database tables first
      await initializeDatabase();
      
      // Fetch all data
      const dishes = await executeQuery<Dish>('SELECT * FROM dishes');
      const orders = await executeQuery<Order>('SELECT * FROM orders');
      const expenses = await executeQuery<Expense>('SELECT * FROM expenses');
      const inventory = await executeQuery<Ingredient>('SELECT * FROM inventory');
      const ktvRooms = await executeQuery<KTVRoom>('SELECT * FROM ktv_rooms');
      const signBillAccounts = await executeQuery<SignBillAccount>('SELECT * FROM sign_bill_accounts');
      const hotelRooms = await executeQuery<HotelRoom>('SELECT * FROM hotel_rooms');
      
      return {
        dishes: success(dishes.length > 0 ? dishes : INITIAL_DISHES),
        orders: success(orders),
        expenses: success(expenses),
        inventory: success(inventory),
        ktvRooms: success(ktvRooms.length > 0 ? ktvRooms : INITIAL_KTV_ROOMS),
        signBillAccounts: success(signBillAccounts),
        hotelRooms: success(hotelRooms.length > 0 ? hotelRooms : INITIAL_HOTEL_ROOMS)
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
      try {
        // Delete all existing dishes
        await executeQuery('DELETE FROM dishes');
        
        // Insert new dishes
        if (dishes.length > 0) {
          const dishValues = dishes.map(dish => [
            dish.id,
            dish.name,
            dish.description,
            dish.price,
            dish.category,
            dish.imageUrl,
            dish.available,
            dish.spiciness
          ]);
          
          const placeholders = dishValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
          const flatValues = dishValues.flat();
          
          await executeQuery(
            `INSERT INTO dishes (id, name, description, price, category, imageUrl, available, spiciness) VALUES ${placeholders}`,
            flatValues
          );
        }
        
        return success(true);
      } catch (error) {
        return handleError(error, `saving dishes`, false);
      }
    }
  },

  /**
   * Order Operations
   */
  Orders: {
    async save(orders: Order[]) {
      try {
        // Delete all existing orders and order items
        await executeQuery('DELETE FROM order_items');
        await executeQuery('DELETE FROM orders');
        
        // Insert new orders and order items
        if (orders.length > 0) {
          // Insert orders
          const orderValues = orders.map(order => [
            order.id,
            order.tableNumber,
            order.source,
            order.status,
            order.totalAmount,
            order.createdAt,
            order.notes || null,
            order.paymentMethod || null
          ]);
          
          const orderPlaceholders = orderValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
          const flatOrderValues = orderValues.flat();
          
          await executeQuery(
            `INSERT INTO orders (id, tableNumber, source, status, totalAmount, createdAt, notes, paymentMethod) VALUES ${orderPlaceholders}`,
            flatOrderValues
          );
          
          // Insert order items
          const allItems = orders.flatMap(order => 
            order.items.map(item => [item.dishId, item.dishName, item.quantity, item.price, order.id])
          );
          
          if (allItems.length > 0) {
            // Generate IDs for order items
            const itemIds = Array(allItems.length).fill(0).map(() => 
              'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
              })
            );
            
            const itemValuesWithIds = allItems.map((item, index) => [itemIds[index], ...item]);
            const itemPlaceholdersWithIds = itemValuesWithIds.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const flatItemValuesWithIds = itemValuesWithIds.flat();
            
            await executeQuery(
              `INSERT INTO order_items (id, dishId, dishName, quantity, price, orderId) VALUES ${itemPlaceholdersWithIds}`,
              flatItemValuesWithIds
            );
          }
        }
        
        return success(true);
      } catch (error) {
        return handleError(error, `saving orders`, false);
      }
    }
  },

  /**
   * Inventory Operations
   */
  Inventory: {
    async save(inventory: Ingredient[]) {
      try {
        // Delete all existing inventory
        await executeQuery('DELETE FROM inventory');
        
        // Insert new inventory
        if (inventory.length > 0) {
          const inventoryValues = inventory.map(item => [
            item.id,
            item.name,
            item.quantity,
            item.unit,
            item.threshold,
            item.updatedAt
          ]);
          
          const placeholders = inventoryValues.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
          const flatValues = inventoryValues.flat();
          
          await executeQuery(
            `INSERT INTO inventory (id, name, quantity, unit, threshold, updatedAt) VALUES ${placeholders}`,
            flatValues
          );
        }
        
        return success(true);
      } catch (error) {
        return handleError(error, `saving inventory`, false);
      }
    }
  },

  /**
   * Finance Operations
   */
  Finance: {
    async save(expenses: Expense[]) {
      try {
        // Delete all existing expenses
        await executeQuery('DELETE FROM expenses');
        
        // Insert new expenses
        if (expenses.length > 0) {
          const expenseValues = expenses.map(expense => [
            expense.id,
            expense.amount,
            expense.category,
            expense.description,
            expense.date
          ]);
          
          const placeholders = expenseValues.map(() => '(?, ?, ?, ?, ?)').join(', ');
          const flatValues = expenseValues.flat();
          
          await executeQuery(
            `INSERT INTO expenses (id, amount, category, description, date) VALUES ${placeholders}`,
            flatValues
          );
        }
        
        return success(true);
      } catch (error) {
        return handleError(error, `saving expenses`, false);
      }
    }
  },

  /**
   * KTV Operations
   */
  KTV: {
    async save(rooms: KTVRoom[]) {
      try {
        // Delete all existing KTV rooms
        await executeQuery('DELETE FROM ktv_rooms');
        
        // Insert new KTV rooms
        if (rooms.length > 0) {
          const roomValues = rooms.map(room => [
            room.id,
            room.name,
            room.type,
            room.status,
            room.hourlyRate
          ]);
          
          const placeholders = roomValues.map(() => '(?, ?, ?, ?, ?)').join(', ');
          const flatValues = roomValues.flat();
          
          await executeQuery(
            `INSERT INTO ktv_rooms (id, name, type, status, hourlyRate) VALUES ${placeholders}`,
            flatValues
          );
        }
        
        return success(true);
      } catch (error) {
        return handleError(error, `saving KTV rooms`, false);
      }
    }
  },

  /**
   * Sign Bill Operations
   */
  SignBill: {
    async save(accounts: SignBillAccount[]) {
      try {
        // Delete all existing sign bill accounts
        await executeQuery('DELETE FROM sign_bill_accounts');
        
        // Insert new sign bill accounts
        if (accounts.length > 0) {
          const accountValues = accounts.map(account => [
            account.id,
            account.name,
            account.cooperationMethod,
            account.settlementMethod,
            account.approver,
            account.phoneNumber,
            account.creditLimit,
            account.currentDebt,
            account.status,
            account.lastTransactionDate
          ]);
          
          const placeholders = accountValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
          const flatValues = accountValues.flat();
          
          await executeQuery(
            `INSERT INTO sign_bill_accounts (id, name, cooperationMethod, settlementMethod, approver, phoneNumber, creditLimit, currentDebt, status, lastTransactionDate) VALUES ${placeholders}`,
            flatValues
          );
        }
        
        return success(true);
      } catch (error) {
        return handleError(error, `saving sign bill accounts`, false);
      }
    }
  },

  /**
   * Hotel Room Operations
   */
  Hotel: {
    async save(rooms: HotelRoom[]) {
      try {
        // Delete all existing hotel rooms
        await executeQuery('DELETE FROM hotel_rooms');
        
        // Insert new hotel rooms
        if (rooms.length > 0) {
          const roomValues = rooms.map(room => [
            room.id,
            room.number,
            room.floor,
            room.status,
            room.guestName,
            room.lastOrderTime
          ]);
          
          const placeholders = roomValues.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
          const flatValues = roomValues.flat();
          
          await executeQuery(
            `INSERT INTO hotel_rooms (id, number, floor, status, guestName, lastOrderTime) VALUES ${placeholders}`,
            flatValues
          );
        }
        
        return success(true);
      } catch (error) {
        return handleError(error, `saving hotel rooms`, false);
      }
    }
  }
};