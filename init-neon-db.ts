/**
 * Neon数据库初始化脚本
 * 用于创建表结构并插入初始数据
 */

import { neon } from '@neondatabase/serverless';

// 从环境变量获取连接字符串
const connectionString = process.env.NEON_CONNECTION_STRING || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('错误: 未设置 NEON_CONNECTION_STRING 或 DATABASE_URL 环境变量');
  process.exit(1);
}

async function initializeDatabase() {
  const sql = neon(connectionString!);

  try {
    console.log('开始数据库初始化...');

    // 创建 kv_store 表用于存储键值对数据
    console.log('创建 kv_store 表...');
    await sql`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // 创建索引以提高查询性能
    console.log('创建索引...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store(key);
    `;

    // 创建更新时间触发器函数
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // 为 kv_store 表创建更新时间触发器
    await sql`
      DROP TRIGGER IF EXISTS update_kv_store_updated_at ON kv_store;
    `;

    await sql`
      CREATE TRIGGER update_kv_store_updated_at 
        BEFORE UPDATE ON kv_store 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `;

    console.log('表结构创建完成！');

    // 插入初始菜品数据
    console.log('插入初始菜品数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('dishes:1', '{"id":"1","name":"宫保鸡丁","category":"主菜","price":35.00,"description":"经典川菜，酸甜可口","available":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('dishes:2', '{"id":"2","name":"麻婆豆腐","category":"主菜","price":28.00,"description":"正宗川味，麻辣鲜香","available":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('dishes:3', '{"id":"3","name":"鱼香肉丝","category":"主菜","price":32.00,"description":"鱼香味型，甜酸微辣","available":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('dishes:4', '{"id":"4","name":"糖醋里脊","category":"主菜","price":38.00,"description":"酸甜口感，外酥内嫩","available":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('dishes:5', '{"id":"5","name":"红烧肉","category":"主菜","price":42.00,"description":"经典家常菜，肥而不腻","available":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('dishes:6', '{"id":"6","name":"白米饭","category":"主食","price":3.00,"description":"香喷喷的白米饭","available":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('dishes:7', '{"id":"7","name":"蛋花汤","category":"汤品","price":12.00,"description":"清淡蛋花汤","available":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('dishes:8', '{"id":"8","name":"可乐","category":"饮料","price":8.00,"description":"冰镇可乐","available":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入初始酒店房间数据 (8201-8232, 8301-8332)
    console.log('插入初始酒店房间数据...');
    for (let floor = 82; floor <= 83; floor++) {
      for (let room = 1; room <= 32; room++) {
        const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
        const roomId = `${(floor - 82) * 32 + room}`;
        const floorNum = floor - 80;
        
        await sql`
          INSERT INTO kv_store (key, value) VALUES 
          ('hotel_rooms:${roomId}', '{"id":"${roomId}","roomNumber":"${roomNumber}","roomType":"标准间","status":"available","rate":280.00,"floor":${floorNum},"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
          ON CONFLICT (key) DO NOTHING;
        `;
      }
    }

    // 插入KTV房间数据 (1个KTV房间)
    console.log('插入KTV房间数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('ktv_rooms:1', '{"id":"1","name":"KTV-001","status":"available","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入支付方式数据
    console.log('插入支付方式数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('payment_methods:1', '{"id":"1","name":"现金","type":"cash","enabled":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('payment_methods:2', '{"id":"2","name":"支付宝","type":"digital","enabled":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('payment_methods:3', '{"id":"3","name":"微信支付","type":"digital","enabled":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('payment_methods:4', '{"id":"4","name":"信用卡","type":"card","enabled":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('payment_methods:5', '{"id":"5","name":"银行转账","type":"bank","enabled":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入系统设置数据
    console.log('插入系统设置数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('system_settings:default', '{"storeInfo":{"name":"江西酒店管理系统","address":"江西省南昌市","phone":"0791-1234567","openingHours":"08:00-22:00","wifiSsid":"Hotel-WiFi","wifiPassword":"hotel123","telegram":"@hotel_manager"},"notifications":{"sound":true,"desktop":true},"payment":{"enabledMethods":["现金","支付宝","微信支付","信用卡","银行转账"]},"exchangeRate":50.0,"serviceChargeRate":0.1,"categories":["主菜","主食","汤品","饮料"],"h5PageSettings":{"enableCustomStyling":true,"customHeaderColor":"#4f46e5","customButtonColor":"#3b82f6","showStoreInfo":true,"showWiFiInfo":true}}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入初始费用数据
    console.log('插入初始费用数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('expenses:1', '{"id":"1","category":"Salary","amount":15000.00,"description":"员工工资","date":"2024-12-01T00:00:00.000Z","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('expenses:2', '{"id":"2","category":"Utilities","amount":3500.00,"description":"水电费","date":"2024-12-05T00:00:00.000Z","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('expenses:3', '{"id":"3","category":"Ingredients","amount":8000.00,"description":"食材采购","date":"2024-12-10T00:00:00.000Z","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入签账账户数据
    console.log('插入签账账户数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('sign_bill_accounts:1', '{"id":"1","accountName":"VIP客户","creditLimit":10000.00,"currentBalance":0.00,"status":"active","contactPerson":"张先生","contactPhone":"13800138000","notes":"重要客户","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('sign_bill_accounts:2', '{"id":"2","accountName":"企业账户","creditLimit":20000.00,"currentBalance":00.00,"status":"active","contactPerson":"李经理","contactPhone":"13900139000","notes":"公司客户","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入初始订单数据
    console.log('插入初始订单数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('orders:1', '{"id":"1","tableId":"8201","items":[{"id":"1","dishId":"1","name":"宫保鸡丁","quantity":2,"price":35.00}],"status":"COMPLETED","total":70.00,"paid":true,"timestamp":"2024-12-25T10:30:00.000Z","createdAt":"2024-12-25T10:30:00.000Z","updatedAt":"2024-12-25T10:30:00.000Z","paymentMethod":"现金","paymentStatus":"completed"}'),
      ('orders:2', '{"id":"2","tableId":"8202","items":[{"id":"1","dishId":"2","name":"麻婆豆腐","quantity":1,"price":28.00},{"id":"2","dishId":"6","name":"白米饭","quantity":2,"price":3.00}],"status":"COMPLETED","total":34.00,"paid":true,"timestamp":"2024-12-25T11:15:00.000Z","createdAt":"2024-12-25T11:15:00.000Z","updatedAt":"2024-12-25T11:15:00.000Z","paymentMethod":"微信支付","paymentStatus":"completed"}'),
      ('orders:3', '{"id":"3","tableId":"8203","items":[{"id":"1","dishId":"3","name":"鱼香肉丝","quantity":1,"price":32.00},{"id":"2","dishId":"7","name":"蛋花汤","quantity":1,"price":12.00},{"id":"3","dishId":"8","name":"可乐","quantity":2,"price":8.00}],"status":"PENDING","total":60.00,"paid":false,"timestamp":"2024-12-25T12:00:00.000Z","createdAt":"2024-12-25T12:00:00.000Z","updatedAt":"2024-12-25T12:00:00.000Z","paymentMethod":"现金","paymentStatus":"pending"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入初始用户数据
    console.log('插入初始用户数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('users:1', '{"id":"1","username":"admin","password":"$2b$10$8K1p/a0d5W7Qq2Zq5hQ7uOJ7V5N9Z8v3Y4K2L7J6Q1R5S9T4U8V7W","role":"admin","isActive":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z","lastLogin":"2024-12-25T00:00:00.000Z"}'),
      ('users:2', '{"id":"2","username":"staff","password":"$2b$10$8K1p/a0d5W7Qq2Zq5hQ7uOJ7V5N9Z8v3Y4K2L7J6Q1R5S9T4U8V7W","role":"staff","isActive":true,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z","lastLogin":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入库存数据
    console.log('插入库存数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('inventory:1', '{"id":"1","name":"大米","category":"主食","quantity":50,"unit":"kg","minStock":10,"pricePerUnit":8.00,"supplier":"粮食供应商","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z","lastRestocked":"2024-12-20T00:00:00.000Z"}'),
      ('inventory:2', '{"id":"2","name":"鸡肉","category":"肉类","quantity":30,"unit":"kg","minStock":5,"pricePerUnit":45.00,"supplier":"肉类供应商","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z","lastRestocked":"2024-12-22T00:00:00.000Z"}'),
      ('inventory:3', '{"id":"3","name":"豆腐","category":"蔬菜","quantity":25,"unit":"块","minStock":8,"pricePerUnit":3.50,"supplier":"豆制品供应商","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z","lastRestocked":"2024-12-23T00:00:00.000Z"}'),
      ('inventory:4', '{"id":"4","name":"辣椒","category":"调料","quantity":15,"unit":"kg","minStock":3,"pricePerUnit":12.00,"supplier":"调料供应商","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z","lastRestocked":"2024-12-21T00:00:00.000Z"}'),
      ('inventory:5', '{"id":"5","name":"鸡蛋","category":"蛋类","quantity":100,"unit":"个","minStock":20,"pricePerUnit":1.20,"supplier":"蛋类供应商","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z","lastRestocked":"2024-12-24T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入角色权限数据
    console.log('插入角色权限数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('roles:1', '{"id":"1","name":"admin","description":"系统管理员","permissions":["all"],"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('roles:2', '{"id":"2","name":"staff","description":"普通员工","permissions":["menu:view","orders:take","finance:view"],"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('roles:3', '{"id":"3","name":"manager","description":"部门经理","permissions":["menu:edit","orders:manage","finance:manage"],"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入权限数据
    console.log('插入权限数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('permissions:1', '{"id":"1","name":"menu:view","description":"查看菜单","category":"menu","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('permissions:2', '{"id":"2","name":"menu:edit","description":"编辑菜单","category":"menu","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('permissions:3', '{"id":"3","name":"orders:take","description":"接单","category":"orders","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('permissions:4', '{"id":"4","name":"orders:manage","description":"管理订单","category":"orders","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('permissions:5', '{"id":"5","name":"finance:view","description":"查看财务","category":"finance","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('permissions:6', '{"id":"6","name":"finance:manage","description":"管理财务","category":"finance","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入系统设置 - 系统配置
    console.log('插入系统配置数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('system_settings:config', '{"id":"config","exchangeRate":50,"serviceChargeRate":0.1,"taxRate":0.05,"autoPrintOrders":true,"autoPrintKtvReceipts":true,"maxReservationDays":30,"minAdvancePayment":500,"defaultRoomRate":280,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入初始KTV预订数据
    console.log('插入初始KTV预订数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('ktv_reservations:1', '{"id":"1","roomId":"1","customerName":"王先生","customerPhone":"13800138001","startTime":"2024-12-25T19:00:00.000Z","endTime":"2024-12-25T22:00:00.000Z","advancePayment":1000.00,"status":"confirmed","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入初始酒店预订数据
    console.log('插入初始酒店预订数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('hotel_reservations:1', '{"id":"1","roomId":"1","roomNumber":"8201","customerName":"刘先生","customerPhone":"13900139001","checkInDate":"2024-12-25T14:00:00.000Z","checkOutDate":"2024-12-27T12:00:00.000Z","advancePayment":840.00,"status":"confirmed","specialRequests":"无烟房","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 插入初始营业数据
    console.log('插入初始营业数据...');
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('daily_reports:1', '{"id":"1","date":"2024-12-25","totalRevenue":164.00,"totalOrders":3,"totalGuests":5,"expenses":0.00,"netIncome":164.00,"createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    console.log('数据库初始化完成！');
    console.log('已创建表结构和插入初始数据');
    console.log('包含：菜品、酒店房间(64间)、KTV房间、支付方式、系统设置、费用、签账账户、订单、用户、库存、角色权限等数据');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    // 在实际应用中，连接池通常由应用生命周期管理
    // 这里为了演示目的，实际部署时可能不需要手动关闭
  }
}

async function main() {
  try {
    await initializeDatabase();
    console.log('数据库初始化脚本执行完成');
  } catch (error) {
    console.error('初始化过程中发生错误:', error);
    process.exit(1);
  }
}

// 检查是否直接运行此模块
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { initializeDatabase };