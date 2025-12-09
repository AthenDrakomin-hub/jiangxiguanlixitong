const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// TiDB connection configuration
const tidbConfig = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'qraob1XdQoegM6F.root',
  password: 'rZrxRtFz7wGOtZ0D',
  database: 'fortune500',
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, 'isrgrootx1.pem')).toString()
  }
};

// Create a connection pool
const pool = mysql.createPool({
  host: tidbConfig.host,
  port: tidbConfig.port,
  user: tidbConfig.user,
  password: tidbConfig.password,
  database: tidbConfig.database,
  ssl: tidbConfig.ssl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Successfully connected to TiDB Cloud');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to TiDB Cloud:', error);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    await pool.execute(`
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
    
    await pool.execute(`
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
    
    await pool.execute(`
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
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50),
        threshold DECIMAL(10, 2) DEFAULT 0,
        updatedAt DATETIME NOT NULL
      )
    `);
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(36) PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        category ENUM('食材采购', '员工工资', '店铺租金', '水电煤气', '维修保养', '其他支出') NOT NULL,
        description TEXT,
        date DATE NOT NULL
      )
    `);
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ktv_rooms (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('Small', 'Medium', 'Large', 'VIP') NOT NULL,
        status ENUM('Available', 'InUse', 'Cleaning', 'Maintenance') NOT NULL,
        hourlyRate DECIMAL(10, 2) NOT NULL
      )
    `);
    
    await pool.execute(`
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
    
    await pool.execute(`
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

async function testTiDBConnection() {
  console.log('🧪 Testing TiDB Cloud connection...');
  
  try {
    // 测试基本连接
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to TiDB Cloud');
    }
    console.log('✅ Connected to TiDB Cloud successfully!');
    
    // 测试表初始化
    await initializeDatabase();
    console.log('✅ Database tables initialized successfully!');
    
    console.log('🎉 All TiDB Cloud tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing TiDB Cloud connection:', error);
    process.exit(1);
  }
}

testTiDBConnection();