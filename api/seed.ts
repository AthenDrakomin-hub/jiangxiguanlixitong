import { kvClient } from '../lib/kv-client.js';

// Edge Runtime 配置
export const config = {
  runtime: 'edge-runtime@1.5.0',
};

/**
 * 数据初始化端点
 * POST /api/seed - 初始化示例数据
 */
export default async function handler(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed. Use POST',
      }),
      { status: 405, headers: corsHeaders }
    );
  }

  if (!kvClient.isConnected()) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Database not connected',
      }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const createdItems: Record<string, number> = {};

    // 1. 初始化菜品数据
    const sampleDishes = [
      { name: '宫保鸡丁', nameEn: 'Kung Pao Chicken', price: 28, category: '热菜', available: true },
      { name: '西红柿炒蛋', nameEn: 'Tomato Egg', price: 18, category: '家常菜', available: true },
      { name: '麻婆豆腐', nameEn: 'Mapo Tofu', price: 22, category: '热菜', available: true },
      { name: '红烧肉', nameEn: 'Braised Pork', price: 38, category: '热菜', available: true },
      { name: '凉拌黄瓜', nameEn: 'Cucumber Salad', price: 12, category: '凉菜', available: true },
      { name: '米饭', nameEn: 'Rice', price: 3, category: '主食', available: true },
      { name: '可乐', nameEn: 'Coca Cola', price: 8, category: '酒水', available: true },
      { name: '青岛啤酒', nameEn: 'Tsingtao Beer', price: 15, category: '酒水', available: true },
    ];

    for (const dish of sampleDishes) {
      await kvClient.create('dishes', dish);
    }
    createdItems.dishes = sampleDishes.length;

    // 2. 初始化库存数据
    const sampleInventory = [
      { name: '鸡肉', nameEn: 'Chicken', quantity: 50, unit: 'kg', minQuantity: 10 },
      { name: '西红柿', nameEn: 'Tomato', quantity: 30, unit: 'kg', minQuantity: 5 },
      { name: '鸡蛋', nameEn: 'Egg', quantity: 100, unit: '个', minQuantity: 20 },
      { name: '豆腐', nameEn: 'Tofu', quantity: 20, unit: 'kg', minQuantity: 5 },
      { name: '五花肉', nameEn: 'Pork Belly', quantity: 40, unit: 'kg', minQuantity: 10 },
      { name: '黄瓜', nameEn: 'Cucumber', quantity: 25, unit: 'kg', minQuantity: 5 },
      { name: '大米', nameEn: 'Rice', quantity: 200, unit: 'kg', minQuantity: 50 },
    ];

    for (const item of sampleInventory) {
      await kvClient.create('inventory', item);
    }
    createdItems.inventory = sampleInventory.length;

    // 3. 初始化 KTV 房间
    const sampleKtvRooms = [
      { name: 'VIP-1', capacity: 15, hourlyRate: 200, status: 'Available' },
      { name: 'VIP-2', capacity: 15, hourlyRate: 200, status: 'Available' },
      { name: '豪华-1', capacity: 10, hourlyRate: 150, status: 'Available' },
      { name: '豪华-2', capacity: 10, hourlyRate: 150, status: 'Available' },
      { name: '标准-1', capacity: 8, hourlyRate: 100, status: 'Available' },
      { name: '标准-2', capacity: 8, hourlyRate: 100, status: 'Available' },
    ];

    for (const room of sampleKtvRooms) {
      await kvClient.create('ktv_rooms', room);
    }
    createdItems.ktv_rooms = sampleKtvRooms.length;

    // 4. 初始化酒店房间
    const sampleHotelRooms = [
      { number: '101', type: 'Standard', status: 'Available', pricePerNight: 300, floor: 1 },
      { number: '102', type: 'Standard', status: 'Available', pricePerNight: 300, floor: 1 },
      { number: '201', type: 'Deluxe', status: 'Available', pricePerNight: 500, floor: 2 },
      { number: '202', type: 'Deluxe', status: 'Available', pricePerNight: 500, floor: 2 },
      { number: '301', type: 'Suite', status: 'Available', pricePerNight: 800, floor: 3 },
    ];

    for (const room of sampleHotelRooms) {
      await kvClient.create('hotel_rooms', room);
    }
    createdItems.hotel_rooms = sampleHotelRooms.length;

    // 5. 初始化支付方式
    const samplePaymentMethods = [
      { name: '现金', nameEn: 'Cash', enabled: true },
      { name: 'GCash', nameEn: 'GCash', enabled: true },
      { name: 'PayMaya', nameEn: 'PayMaya', enabled: true },
      { name: '银行卡', nameEn: 'Bank Card', enabled: true },
    ];

    for (const method of samplePaymentMethods) {
      await kvClient.create('payment_methods', method);
    }
    createdItems.payment_methods = samplePaymentMethods.length;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sample data initialized successfully',
        created: createdItems,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Seed Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
