import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// TiDB connection configuration
const tidbConfig = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'qraob1XdQoegM6F.root',
  password: 'rZrxRtFz7wGOtZ0D',
  database: 'fortune500',
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join('.', 'isrgrootx1.pem')).toString()
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
    console.error('❌ Failed to connect to TiDB Cloud:', error.message);
    return false;
  }
};

// Test the connection
console.log('🧪 Testing TiDB Cloud connection...');
testConnection().then(success => {
  if (success) {
    console.log('🎉 TiDB Cloud connection test passed!');
  } else {
    console.log('💥 TiDB Cloud connection test failed!');
  }
  process.exit(success ? 0 : 1);
});