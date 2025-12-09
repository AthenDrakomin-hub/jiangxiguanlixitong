// Database connection pool for Vercel Serverless API
// This file should only be used in the backend API routes

import mysql from 'mysql2/promise';

// TiDB connection configuration
const tidbConfig = {
  host: process.env.TIDB_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER || 'qraob1XdQoegM6F.root',
  password: process.env.TIDB_PASSWORD || 'rZrxRtFz7wGOtZ0D',
  database: process.env.TIDB_DATABASE || 'fortune500',
  ssl: process.env.TIDB_SSL === 'true' ? {
    rejectUnauthorized: true
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

export default pool;