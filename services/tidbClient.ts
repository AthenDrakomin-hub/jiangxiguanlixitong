import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// TiDB connection configuration
const tidbConfig = {
  host: process.env.TIDB_HOST || 'localhost',
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER || 'root',
  password: process.env.TIDB_PASSWORD || '',
  database: process.env.TIDB_DATABASE || 'jiangxi_hotel',
  ssl: process.env.TIDB_SSL === 'true' ? {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, '..', 'isrgrootx1.pem')).toString()
  } : undefined
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
export const testConnection = async (): Promise<boolean> => {
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

// Execute a query
export const executeQuery = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('❌ Query execution failed:', error);
    throw error;
  }
};

// Execute a transaction
export const executeTransaction = async <T>(queries: { sql: string; params?: any[] }[]): Promise<T[]> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results: T[] = [];
    for (const query of queries) {
      const [rows] = await connection.execute(query.sql, query.params || []);
      results.push(rows as T);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Transaction failed:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;