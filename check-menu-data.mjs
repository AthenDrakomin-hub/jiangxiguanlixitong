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

// Check menu data
const checkMenuData = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Check if dishes table exists and get count
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM dishes');
    console.log(`📊 Current dishes in database: ${rows[0].count}`);
    
    // Show first 5 dishes if any exist
    if (rows[0].count > 0) {
      const [dishes] = await connection.execute('SELECT id, name, price, category FROM dishes LIMIT 5');
      console.log('\n📋 First 5 dishes:');
      dishes.forEach((dish, index) => {
        console.log(`  ${index + 1}. ${dish.name} - ¥${dish.price} (${dish.category})`);
      });
    } else {
      console.log('\n📝 No dishes found in database.');
    }
    
    connection.release();
    return rows[0].count;
  } catch (error) {
    console.error('❌ Error checking menu data:', error.message);
    return 0;
  }
};

console.log('🔍 Checking current menu data in TiDB...');
checkMenuData().then(count => {
  console.log(`\n✅ Menu data check complete. Found ${count} dishes.`);
  process.exit(0);
});