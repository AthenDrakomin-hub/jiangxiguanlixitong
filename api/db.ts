// Database connection pool for Vercel Serverless API
// This file should only be used in the backend API routes

import * as mysql from 'mysql2/promise';

// TiDB connection configuration
const tidbConfig = {
  host: process.env.TIDB_HOST,
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE || 'fortune500',
  ssl: process.env.TIDB_SSL === 'true' ? {
    rejectUnauthorized: true
  } : undefined
};

// Validate required environment variables
if (!process.env.TIDB_HOST || !process.env.TIDB_USER || !process.env.TIDB_PASSWORD) {
  console.error('❌ Missing required database environment variables!');
  console.error('Please set: TIDB_HOST, TIDB_USER, TIDB_PASSWORD');
  throw new Error('Database configuration error');
}

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

export default pool;