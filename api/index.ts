import { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query, body } = req;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (method) {
      case 'GET':
        if (query.table) {
          // Get all records from a table
          const connection = await pool.getConnection();
          const [rows] = await connection.execute(`SELECT * FROM ${query.table}`);
          connection.release();
          res.status(200).json({ 
            success: true,
            data: rows,
            message: `Successfully fetched data from ${query.table}`
          });
        } else {
          res.status(200).json({ 
            message: '江西酒店管理系统API服务',
            status: 'running',
            timestamp: new Date().toISOString()
          });
        }
        break;
        
      case 'POST':
        // Create new record
        if (query.table && body) {
          const connection = await pool.getConnection();
          
          // Generate a unique ID for the new record
          const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
          
          // Build INSERT query dynamically based on body data
          const keys = Object.keys(body);
          const values = Object.values(body);
          keys.unshift('id'); // Add id as first column
          values.unshift(id); // Add generated id as first value
          
          const placeholders = keys.map(() => '?').join(', ');
          const sql = `INSERT INTO ${query.table} (${keys.join(', ')}) VALUES (${placeholders})`;
          
          await connection.execute(sql, values);
          connection.release();
          
          res.status(201).json({ 
            success: true,
            data: { id, ...body },
            message: `Successfully created record in ${query.table}`
          });
        } else {
          res.status(400).json({ 
            success: false,
            message: 'Table name and data body are required for POST requests'
          });
        }
        break;
        
      case 'PUT':
        // Update existing record
        if (query.table && query.id && body) {
          const connection = await pool.getConnection();
          
          // Build UPDATE query dynamically based on body data
          const keys = Object.keys(body);
          const values = Object.values(body);
          const setters = keys.map(key => `${key} = ?`).join(', ');
          values.push(query.id as string); // Add id for WHERE clause
          
          const sql = `UPDATE ${query.table} SET ${setters} WHERE id = ?`;
          
          await connection.execute(sql, values);
          connection.release();
          
          res.status(200).json({ 
            success: true,
            data: { id: query.id, ...body },
            message: `Successfully updated record in ${query.table}`
          });
        } else {
          res.status(400).json({ 
            success: false,
            message: 'Table name, record ID, and data body are required for PUT requests'
          });
        }
        break;
        
      case 'DELETE':
        // Delete record
        if (query.table && query.id) {
          const connection = await pool.getConnection();
          await connection.execute(`DELETE FROM ${query.table} WHERE id = ?`, [query.id]);
          connection.release();
          
          res.status(200).json({ 
            success: true,
            message: `Successfully deleted record from ${query.table}`
          });
        } else {
          res.status(400).json({ 
            success: false,
            message: 'Table name and record ID are required for DELETE requests'
          });
        }
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}