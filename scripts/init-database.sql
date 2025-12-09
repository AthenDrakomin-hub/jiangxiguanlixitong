-- 江西酒店管理系统数据库初始化脚本
-- 适用于TiDB Cloud

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS fortune500 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE fortune500;

-- 创建菜品表
CREATE TABLE IF NOT EXISTS dishes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    imageUrl VARCHAR(512),
    available BOOLEAN DEFAULT TRUE,
    spiciness INT DEFAULT 0
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    tableNumber VARCHAR(50),
    source ENUM('LOBBY', 'ROOM_SERVICE', 'KTV', 'TAKEOUT') NOT NULL,
    status ENUM('待处理', '烹饪中', '已上菜', '已支付', '已完成', '已取消') NOT NULL,
    totalAmount DECIMAL(10, 2) NOT NULL,
    createdAt DATETIME NOT NULL,
    notes TEXT,
    paymentMethod VARCHAR(50)
);

-- 创建费用表
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(36) PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    category ENUM('食材采购', '员工工资', '店铺租金', '水电煤气', '维修保养', '其他支出') NOT NULL,
    description TEXT,
    date DATE NOT NULL
);

-- 创建库存表
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50),
    threshold DECIMAL(10, 2) DEFAULT 0,
    updatedAt DATETIME NOT NULL
);

-- 创建KTV包厢表
CREATE TABLE IF NOT EXISTS ktv_rooms (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('Small', 'Medium', 'Large', 'VIP') NOT NULL,
    status ENUM('Available', 'InUse', 'Cleaning', 'Maintenance') NOT NULL,
    hourlyRate DECIMAL(10, 2) NOT NULL
);

-- 创建签单挂账账户表
CREATE TABLE IF NOT EXISTS sign_bill_accounts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cooperationMethod VARCHAR(255),
    settlementMethod VARCHAR(255),
    approver VARCHAR(255),
    phoneNumber VARCHAR(50),
    creditLimit DECIMAL(10, 2),
    currentDebt DECIMAL(10, 2) DEFAULT 0,
    status ENUM('Active', 'Inactive') NOT NULL,
    lastTransactionDate DATETIME
);

-- 创建酒店客房表
CREATE TABLE IF NOT EXISTS hotel_rooms (
    id VARCHAR(36) PRIMARY KEY,
    number VARCHAR(20) NOT NULL,
    floor INT NOT NULL,
    status ENUM('Vacant', 'Occupied') NOT NULL,
    guestName VARCHAR(255),
    lastOrderTime DATETIME
);

-- 创建支付方式配置表
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    englishName VARCHAR(100),
    isEnabled BOOLEAN DEFAULT FALSE,
    qrCodeUrl TEXT,
    accountInfo TEXT,
    paymentType ENUM('CASH', 'MOBILE_WALLET', 'CRYPTO', 'BANK_TRANSFER', 'CREDIT_CARD') NOT NULL,
    currency VARCHAR(10) DEFAULT 'PHP',
    exchangeRate DECIMAL(10, 4) DEFAULT 1.0000,
    sortOrder INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 添加索引以提高查询性能（忽略已存在的索引）
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_ktv_rooms_status ON ktv_rooms(status);
CREATE INDEX IF NOT EXISTS idx_ktv_rooms_name ON ktv_rooms(name);
CREATE INDEX IF NOT EXISTS idx_sign_bill_accounts_status ON sign_bill_accounts(status);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_status ON hotel_rooms(status);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_number ON hotel_rooms(number);
CREATE INDEX IF NOT EXISTS idx_payment_methods_enabled ON payment_methods(isEnabled);
CREATE INDEX IF NOT EXISTS idx_payment_methods_sort ON payment_methods(sortOrder);

-- 插入示例菜品数据（忽略重复插入）
INSERT IGNORE INTO dishes (id, name, description, price, category, available, spiciness) VALUES
('1', '宫保鸡丁', '经典川菜，辣味适中', 38.00, '热菜', TRUE, 2),
('2', '麻婆豆腐', '嫩滑豆腐配麻辣肉末', 28.00, '热菜', TRUE, 3),
('3', '红烧肉', '传统红烧肉，肥而不腻', 48.00, '热菜', TRUE, 1),
('4', '清蒸鲈鱼', '新鲜鲈鱼清蒸，鲜美嫩滑', 68.00, '热菜', TRUE, 0),
('5', '凉拌黄瓜', '清爽开胃小菜', 12.00, '凉菜', TRUE, 0),
('6', '西红柿鸡蛋汤', '家常汤品，营养丰富', 18.00, '汤羹', TRUE, 0),
('7', '扬州炒饭', '经典炒饭，配料丰富', 25.00, '主食', TRUE, 0),
('8', '牛肉拉面', '手工拉面配炖牛肉', 32.00, '主食', TRUE, 1);

-- 插入示例KTV包厢数据（忽略重复插入）
INSERT IGNORE INTO ktv_rooms (id, name, type, status, hourlyRate) VALUES
('KT-001', 'A01', 'Small', 'Available', 88.00),
('KT-002', 'A02', 'Small', 'Available', 88.00),
('KT-003', 'B01', 'Medium', 'Available', 128.00),
('KT-004', 'B02', 'Medium', 'Available', 128.00),
('KT-005', 'VIP-01', 'VIP', 'Available', 288.00);

-- 插入示例酒店客房数据（忽略重复插入）
INSERT IGNORE INTO hotel_rooms (id, number, floor, status) VALUES
('RM-101', '101', 1, 'Vacant'),
('RM-102', '102', 1, 'Vacant'),
('RM-201', '201', 2, 'Vacant'),
('RM-202', '202', 2, 'Vacant'),
('RM-301', '301', 3, 'Vacant');

-- 插入示例支付方式数据（忽略重复插入）
INSERT IGNORE INTO payment_methods (id, name, englishName, isEnabled, paymentType, currency, sortOrder) VALUES
('PM-001', '现金', 'Cash', TRUE, 'CASH', 'PHP', 1),
('PM-002', 'GCash', 'GCash', TRUE, 'MOBILE_WALLET', 'PHP', 2),
('PM-003', 'Maya', 'Maya', TRUE, 'MOBILE_WALLET', 'PHP', 3),
('PM-004', '支付宝', 'Alipay', FALSE, 'MOBILE_WALLET', 'CNY', 4),
('PM-005', '微信支付', 'WeChat Pay', FALSE, 'MOBILE_WALLET', 'CNY', 5),
('PM-006', 'USDT', 'USDT', FALSE, 'CRYPTO', 'USDT', 6);

-- 显示创建成功的表
SHOW TABLES;