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

-- 插入菜品数据（忽略重复插入）
-- 港式快餐类
INSERT IGNORE INTO dishes (id, name, description, price, category, available, spiciness) VALUES
('D001', '星椒猪扒饭', '猪扒、星辣椒油、米饭', 58.00, '港式快餐', TRUE, 2),
('D002', '星椒牛肉饭', '牛肉、星辣椒油、米饭', 68.00, '港式快餐', TRUE, 2),
('D003', '星椒鸡扒饭', '鸡扒、星辣椒油、米饭', 55.00, '港式快餐', TRUE, 2),
('D004', '星椒牛坑腩面', '牛坑腩、星辣椒油、面条', 78.00, '港式快餐', TRUE, 2),
('D005', '星椒猪扒面', '猪扒、星辣椒油、面条', 58.00, '港式快餐', TRUE, 2),
('D006', '星椒鸡扒面', '鸡扒、星辣椒油、面条', 55.00, '港式快餐', TRUE, 2),
('D007', '咖喱鸡扒饭', '鸡扒、咖喱、米饭', 55.00, '港式快餐', TRUE, 1),
('D008', '咖喱猪扒饭', '猪扒、咖喱、米饭', 58.00, '港式快餐', TRUE, 1),
('D009', '咖喱牛肉饭', '牛肉、咖喱、米饭', 68.00, '港式快餐', TRUE, 1),
('D010', '咖喱猪扒面', '猪扒、咖喱、面条', 58.00, '港式快餐', TRUE, 1),
('D011', '咖喱鸡扒面', '鸡扒、咖喱、面条', 55.00, '港式快餐', TRUE, 1),
('D012', '咖喱牛肉意面', '牛肉、咖喱、意面', 78.00, '港式快餐', TRUE, 1),
('D013', '鸡扒意面', '鸡扒、意面', 68.00, '港式快餐', TRUE, 0),
('D014', '猪扒意面', '猪扒、意面', 72.00, '港式快餐', TRUE, 0),
('D015', '牛肉意面', '牛肉、意面', 88.00, '港式快餐', TRUE, 0),
-- 小炒和川菜类
('D016', '野山椒爆牛肉', '牛肉、野山椒', 78.00, '川湘小炒', TRUE, 3),
('D017', '柠檬酸溜鱼', '鱼、柠檬、醋', 68.00, '川湘小炒', TRUE, 1),
('D018', '歌乐山辣子鸡', '鸡肉、辣椒', 72.00, '川湘小炒', TRUE, 3),
('D019', '新派酸辣鸡', '鸡肉、辣椒、醋', 65.00, '川湘小炒', TRUE, 2),
('D020', '湖南小炒肉', '猪肉、青椒、红椒', 58.00, '川湘小炒', TRUE, 2),
('D021', '剁椒鱼头', '鱼头、剁椒', 88.00, '川湘小炒', TRUE, 3),
('D022', '川菜大炒饭', '米饭、火腿、鸡蛋、蔬菜', 45.00, '川湘小炒', TRUE, 1),
('D023', '干锅辣椒鸭', '鸭肉、干辣椒', 78.00, '川湘小炒', TRUE, 3),
('D024', '小炒黄牛肉', '黄牛肉、辣椒', 88.00, '川湘小炒', TRUE, 2),
('D025', '土豆红烧肉', '五花肉、土豆', 68.00, '川湘小炒', TRUE, 1),
('D026', '红烧茄子', '茄子、五花肉', 48.00, '川湘小炒', TRUE, 0),
('D027', '西蓝花土豆丝', '西蓝花、土豆', 42.00, '川湘小炒', TRUE, 0),
-- 其他菜品
('D028', '三鲜炒面', '面条、海鲜、鸡蛋、蔬菜', 45.00, '主食面点', TRUE, 0),
('D029', '酸辣炒米', '米饭、辣椒、醋', 42.00, '主食面点', TRUE, 1),
('D030', '干炒牛河', '河粉、牛肉', 52.00, '主食面点', TRUE, 0),
('D031', '水煮鱼', '鱼肉、辣椒', 98.00, '川湘小炒', TRUE, 3),
('D032', '水煮肉片', '猪肉、辣椒', 78.00, '川湘小炒', TRUE, 3),
('D033', '香辣鱼块', '鱼肉、辣椒', 68.00, '川湘小炒', TRUE, 2),
('D034', '蒜蓉豆角', '豆角、蒜蓉', 42.00, '家常素菜', TRUE, 0),
('D035', '红烧腐竹', '腐竹', 46.00, '家常素菜', TRUE, 0),
('D036', '辣椒炒蛋', '鸡蛋、辣椒', 38.00, '家常素菜', TRUE, 1),
('D037', '辣椒牛肉', '牛肉、辣椒', 88.00, '川湘小炒', TRUE, 2),
('D038', '榨菜炒肉', '猪肉、榨菜', 58.00, '川湘小炒', TRUE, 1),
('D039', '荷兰豆炒鸡杂', '荷兰豆、鸡杂', 56.00, '川湘小炒', TRUE, 1),
('D040', '酸菜炒肉片', '猪肉、酸菜', 58.00, '川湘小炒', TRUE, 1),
('D041', '生炒草头鸡', '鸡肉、草头', 68.00, '川湘小炒', TRUE, 1);

-- 插入KTV包厢数据（忽略重复插入）
INSERT IGNORE INTO ktv_rooms (id, name, type, status, hourlyRate) VALUES
('KT-VIP888', 'VIP888', 'VIP', 'Available', 388.00);

-- 插入酒店客房数据（忽略重复插入）
-- 82xx系列房间 (8201-8232)
INSERT IGNORE INTO hotel_rooms (id, number, floor, status) VALUES
('RM-8201', '8201', 82, 'Vacant'),
('RM-8202', '8202', 82, 'Vacant'),
('RM-8203', '8203', 82, 'Vacant'),
('RM-8204', '8204', 82, 'Vacant'),
('RM-8205', '8205', 82, 'Vacant'),
('RM-8206', '8206', 82, 'Vacant'),
('RM-8207', '8207', 82, 'Vacant'),
('RM-8208', '8208', 82, 'Vacant'),
('RM-8209', '8209', 82, 'Vacant'),
('RM-8210', '8210', 82, 'Vacant'),
('RM-8211', '8211', 82, 'Vacant'),
('RM-8212', '8212', 82, 'Vacant'),
('RM-8213', '8213', 82, 'Vacant'),
('RM-8214', '8214', 82, 'Vacant'),
('RM-8215', '8215', 82, 'Vacant'),
('RM-8216', '8216', 82, 'Vacant'),
('RM-8217', '8217', 82, 'Vacant'),
('RM-8218', '8218', 82, 'Vacant'),
('RM-8219', '8219', 82, 'Vacant'),
('RM-8220', '8220', 82, 'Vacant'),
('RM-8221', '8221', 82, 'Vacant'),
('RM-8222', '8222', 82, 'Vacant'),
('RM-8223', '8223', 82, 'Vacant'),
('RM-8224', '8224', 82, 'Vacant'),
('RM-8225', '8225', 82, 'Vacant'),
('RM-8226', '8226', 82, 'Vacant'),
('RM-8227', '8227', 82, 'Vacant'),
('RM-8228', '8228', 82, 'Vacant'),
('RM-8229', '8229', 82, 'Vacant'),
('RM-8230', '8230', 82, 'Vacant'),
('RM-8231', '8231', 82, 'Vacant'),
('RM-8232', '8232', 82, 'Vacant');

-- 插入83xx系列房间 (8301-8332)
INSERT IGNORE INTO hotel_rooms (id, number, floor, status) VALUES
('RM-8301', '8301', 83, 'Vacant'),
('RM-8302', '8302', 83, 'Vacant'),
('RM-8303', '8303', 83, 'Vacant'),
('RM-8304', '8304', 83, 'Vacant'),
('RM-8305', '8305', 83, 'Vacant'),
('RM-8306', '8306', 83, 'Vacant'),
('RM-8307', '8307', 83, 'Vacant'),
('RM-8308', '8308', 83, 'Vacant'),
('RM-8309', '8309', 83, 'Vacant'),
('RM-8310', '8310', 83, 'Vacant'),
('RM-8311', '8311', 83, 'Vacant'),
('RM-8312', '8312', 83, 'Vacant'),
('RM-8313', '8313', 83, 'Vacant'),
('RM-8314', '8314', 83, 'Vacant'),
('RM-8315', '8315', 83, 'Vacant'),
('RM-8316', '8316', 83, 'Vacant'),
('RM-8317', '8317', 83, 'Vacant'),
('RM-8318', '8318', 83, 'Vacant'),
('RM-8319', '8319', 83, 'Vacant'),
('RM-8320', '8320', 83, 'Vacant'),
('RM-8321', '8321', 83, 'Vacant'),
('RM-8322', '8322', 83, 'Vacant'),
('RM-8323', '8323', 83, 'Vacant'),
('RM-8324', '8324', 83, 'Vacant'),
('RM-8325', '8325', 83, 'Vacant'),
('RM-8326', '8326', 83, 'Vacant'),
('RM-8327', '8327', 83, 'Vacant'),
('RM-8328', '8328', 83, 'Vacant'),
('RM-8329', '8329', 83, 'Vacant'),
('RM-8330', '8330', 83, 'Vacant'),
('RM-8331', '8331', 83, 'Vacant'),
('RM-8332', '8332', 83, 'Vacant');

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