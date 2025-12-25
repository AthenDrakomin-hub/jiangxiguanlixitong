import { dbManager } from '../lib/database.js';
import { DatabaseConfig, StorageType } from '../types.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // CORS 头设置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  // 添加权限校验
  const authHeader = req.headers.get('Authorization');
  const adminKey = process.env.ADMIN_KEY || process.env.VITE_ADMIN_KEY;
  
  // 验证Bearer认证头
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({
        success: false,
        message: '认证失败：缺少 Bearer Token',
      }),
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }
  
  const providedKey = authHeader.substring(7); // 移除 "Bearer " 前缀
  
  if (!adminKey || providedKey !== adminKey) {
    return new Response(
      JSON.stringify({
        success: false,
        message: '认证失败：密钥不匹配',
      }),
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }

  try {
    // 获取内存数据库中的所有数据
    const memoryDb = dbManager.getDatabase(); // 假设当前是内存数据库
    
    // 获取所有菜品数据
    const dishes = await memoryDb.getAll<any>('dishes:');
    
    // 获取所有酒店房间数据
    const hotelRooms = await memoryDb.getAll<any>('hotel_rooms:');
    
    // 获取所有KTV房间数据
    const ktvRooms = await memoryDb.getAll<any>('ktv_rooms:');
    
    // 获取所有库存数据
    const inventory = await memoryDb.getAll<any>('inventory:');
    
    // 获取所有支付方式数据
    const paymentMethods = await memoryDb.getAll<any>('payment_methods:');
    
    // 获取所有系统设置数据
    const systemSettings = await memoryDb.getAll<any>('system_settings:');
    
    // 获取所有签单账户数据
    const signBillAccounts = await memoryDb.getAll<any>('sign_bill_accounts:');
    
    // 获取所有费用数据
    const expenses = await memoryDb.getAll<any>('expenses:');
    
    // 获取所有订单数据
    const orders = await memoryDb.getAll<any>('orders:');
    
    // 切换到 Neon 数据库（需要从环境变量获取配置）
    const dbType = (process.env.DB_TYPE || 'memory') as StorageType;
    
    if (dbType !== 'neon') {
      return new Response(
        JSON.stringify({
          success: false,
          message: '当前数据库类型不是Neon，无法进行迁移',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    const neonConfig: DatabaseConfig = {
      type: 'neon',
      settings: {
        connectionString: process.env.NEON_CONNECTION_STRING || '',
      }
    };
    
    // 临时切换到Neon数据库
    await dbManager.reconfigure(neonConfig);
    const neonDb = dbManager.getDatabase();
    
    // 将数据迁移到Neon数据库
    let migratedCount = 0;
    
    // 迁移菜品数据
    for (const dish of dishes) {
      await neonDb.set(`dishes:${dish.id}`, dish);
      migratedCount++;
    }
    
    // 迁移酒店房间数据
    for (const room of hotelRooms) {
      await neonDb.set(`hotel_rooms:${room.id || room.roomNumber}`, room);
      migratedCount++;
    }
    
    // 迁移KTV房间数据
    for (const room of ktvRooms) {
      await neonDb.set(`ktv_rooms:${room.id || room.name}`, room);
      migratedCount++;
    }
    
    // 迁移库存数据
    for (const item of inventory) {
      await neonDb.set(`inventory:${item.id}`, item);
      migratedCount++;
    }
    
    // 迁移支付方式数据
    for (const method of paymentMethods) {
      await neonDb.set(`payment_methods:${method.id}`, method);
      migratedCount++;
    }
    
    // 迁移系统设置数据
    for (const setting of systemSettings) {
      await neonDb.set(`system_settings:${setting.id}`, setting);
      migratedCount++;
    }
    
    // 迁移签单账户数据
    for (const account of signBillAccounts) {
      await neonDb.set(`sign_bill_accounts:${account.id}`, account);
      migratedCount++;
    }
    
    // 迁移费用数据
    for (const expense of expenses) {
      await neonDb.set(`expenses:${expense.id}`, expense);
      migratedCount++;
    }
    
    // 迁移订单数据
    for (const order of orders) {
      await neonDb.set(`orders:${order.id}`, order);
      migratedCount++;
    }
    
    // 切换回原来的数据库配置（如果需要的话）
    // 这里假设我们保持在Neon数据库配置
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `数据迁移成功！共迁移 ${migratedCount} 条记录`,
        migratedCount,
        details: {
          dishes: dishes.length,
          hotelRooms: hotelRooms.length,
          ktvRooms: ktvRooms.length,
          inventory: inventory.length,
          paymentMethods: paymentMethods.length,
          systemSettings: systemSettings.length,
          signBillAccounts: signBillAccounts.length,
          expenses: expenses.length,
          orders: orders.length,
        }
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('数据迁移失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `数据迁移失败: ${error instanceof Error ? error.message : '未知错误'}`,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}