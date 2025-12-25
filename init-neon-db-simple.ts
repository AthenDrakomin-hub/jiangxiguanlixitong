/**
 * Neon数据库初始化脚本 - 简化版
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

    // 插入酒店房间数据 - 分批插入
    console.log('插入酒店房间数据...');
    
    // 8201-8216
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('hotel_rooms:1', '{"id":"1","roomNumber":"8201","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:2', '{"id":"2","roomNumber":"8202","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:3', '{"id":"3","roomNumber":"8203","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:4', '{"id":"4","roomNumber":"8204","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:5', '{"id":"5","roomNumber":"8205","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:6', '{"id":"6","roomNumber":"8206","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:7', '{"id":"7","roomNumber":"8207","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:8', '{"id":"8","roomNumber":"8208","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:9', '{"id":"9","roomNumber":"8209","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:10', '{"id":"10","roomNumber":"8210","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:11', '{"id":"11","roomNumber":"8211","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:12', '{"id":"12","roomNumber":"8212","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:13', '{"id":"13","roomNumber":"8213","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:14', '{"id":"14","roomNumber":"8214","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:15', '{"id":"15","roomNumber":"8215","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:16', '{"id":"16","roomNumber":"8216","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 8217-8232
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('hotel_rooms:17', '{"id":"17","roomNumber":"8217","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:18', '{"id":"18","roomNumber":"8218","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:19', '{"id":"19","roomNumber":"8219","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:20', '{"id":"20","roomNumber":"8220","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:21', '{"id":"21","roomNumber":"8221","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:22', '{"id":"22","roomNumber":"8222","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:23', '{"id":"23","roomNumber":"8223","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:24', '{"id":"24","roomNumber":"8224","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:25', '{"id":"25","roomNumber":"8225","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:26', '{"id":"26","roomNumber":"8226","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:27', '{"id":"27","roomNumber":"8227","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:28', '{"id":"28","roomNumber":"8228","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:29', '{"id":"29","roomNumber":"8229","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:30', '{"id":"30","roomNumber":"8230","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:31', '{"id":"31","roomNumber":"8231","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:32', '{"id":"32","roomNumber":"8232","roomType":"标准间","status":"available","rate":280.00,"floor":2,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 8301-8316
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('hotel_rooms:33', '{"id":"33","roomNumber":"8301","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:34', '{"id":"34","roomNumber":"8302","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:35', '{"id":"35","roomNumber":"8303","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:36', '{"id":"36","roomNumber":"8304","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:37', '{"id":"37","roomNumber":"8305","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:38', '{"id":"38","roomNumber":"8306","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:39', '{"id":"39","roomNumber":"8307","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:40', '{"id":"40","roomNumber":"8308","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:41', '{"id":"41","roomNumber":"8309","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:42', '{"id":"42","roomNumber":"8310","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:43', '{"id":"43","roomNumber":"8311","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:44', '{"id":"44","roomNumber":"8312","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:45', '{"id":"45","roomNumber":"8313","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:46', '{"id":"46","roomNumber":"8314","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:47', '{"id":"47","roomNumber":"8315","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:48', '{"id":"48","roomNumber":"8316","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

    // 8317-8332
    await sql`
      INSERT INTO kv_store (key, value) VALUES 
      ('hotel_rooms:49', '{"id":"49","roomNumber":"8317","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:50', '{"id":"50","roomNumber":"8318","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:51', '{"id":"51","roomNumber":"8319","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:52', '{"id":"52","roomNumber":"8320","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:53', '{"id":"53","roomNumber":"8321","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:54', '{"id":"54","roomNumber":"8322","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:55', '{"id":"55","roomNumber":"8323","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:56', '{"id":"56","roomNumber":"8324","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:57', '{"id":"57","roomNumber":"8325","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:58', '{"id":"58","roomNumber":"8326","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:59', '{"id":"59","roomNumber":"8327","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:60', '{"id":"60","roomNumber":"8328","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:61', '{"id":"61","roomNumber":"8329","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:62', '{"id":"62","roomNumber":"8330","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:63', '{"id":"63","roomNumber":"8331","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}'),
      ('hotel_rooms:64', '{"id":"64","roomNumber":"8332","roomType":"标准间","status":"available","rate":280.00,"floor":3,"bedType":"双床","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
      ON CONFLICT (key) DO NOTHING;
    `;

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
      ('sign_bill_accounts:2', '{"id":"2","accountName":"企业账户","creditLimit":20000.00,"currentBalance":0.00,"status":"active","contactPerson":"李经理","contactPhone":"13900139000","notes":"公司客户","createdAt":"2024-12-25T00:00:00.000Z","updatedAt":"2024-12-25T00:00:00.000Z"}')
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