const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(express.json());

// TiDB连接配置
const dbConfig = {
  host: process.env.TIDB_HOST,
  port: process.env.TIDB_PORT,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// API路由
app.get('/api/dishes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM dishes');
    connection.release();
    
    res.status(200).json({ 
      success: true,
      data: rows,
      message: 'Successfully fetched dishes'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM orders');
    connection.release();
    
    res.status(200).json({ 
      success: true,
      data: rows,
      message: 'Successfully fetched orders'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/expenses', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM expenses');
    connection.release();
    
    res.status(200).json({ 
      success: true,
      data: rows,
      message: 'Successfully fetched expenses'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM inventory');
    connection.release();
    
    res.status(200).json({ 
      success: true,
      data: rows,
      message: 'Successfully fetched inventory'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/ktv_rooms', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM ktv_rooms');
    connection.release();
    
    res.status(200).json({ 
      success: true,
      data: rows,
      message: 'Successfully fetched ktv rooms'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/sign_bill_accounts', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM sign_bill_accounts');
    connection.release();
    
    res.status(200).json({ 
      success: true,
      data: rows,
      message: 'Successfully fetched sign bill accounts'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/hotel_rooms', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM hotel_rooms');
    connection.release();
    
    res.status(200).json({ 
      success: true,
      data: rows,
      message: 'Successfully fetched hotel rooms'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/payment_methods', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM payment_methods');
    connection.release();
    
    res.status(200).json({ 
      success: true,
      data: rows,
      message: 'Successfully fetched payment methods'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 为生产环境提供静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // 处理SPA路由
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});