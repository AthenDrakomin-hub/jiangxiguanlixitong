import { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 获取查询参数（如果有的话）
  const { limit = '5' } = req.query;
  
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`SELECT * FROM dishes LIMIT ${parseInt(limit as string)}`);
    connection.release();
    
    res.status(200).json({ 
      success: true,
      data: rows,
      message: 'Successfully fetched dishes'
    });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}