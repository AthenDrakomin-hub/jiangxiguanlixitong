const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

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

async function importMenuData() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), 'menu_data.csv');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse CSV data
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    if (lines.length <= 1) {
      console.log('CSV file is empty or invalid');
      return;
    }
    
    // Validate header
    const header = lines[0].split(',').map(field => field.trim().replace(/^"|"$/g, ''));
    const requiredHeaders = ['id', 'name', 'description', 'price', 'category', 'imageUrl', 'available', 'spiciness'];
    const missingHeaders = requiredHeaders.filter(h => !header.includes(h));
    if (missingHeaders.length > 0) {
      console.log(`CSV file missing required columns: ${missingHeaders.join(', ')}`);
      return;
    }
    
    // Process data lines
    const dataLines = lines.slice(1);
    let importedCount = 0;
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const [id, name, description, price, category, imageUrl, available, spiciness] = line.split(',').map(field => field.trim().replace(/^"|"$/g, ''));
      
      // Validate data
      if (!name) {
        console.log(`Skipping row ${i+2}: Missing dish name`);
        continue;
      }
      
      if (isNaN(parseFloat(price))) {
        console.log(`Skipping row ${i+2}: Invalid price`);
        continue;
      }
      
      if (isNaN(parseInt(spiciness))) {
        console.log(`Skipping row ${i+2}: Invalid spiciness level`);
        continue;
      }
      
      // Generate ID if not provided
      const dishId = id || `dish-${Date.now()}-${i}`;
      
      // Insert into database
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          `INSERT INTO dishes (id, name, description, price, category, imageUrl, available, spiciness) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            dishId,
            name,
            description || '',
            parseFloat(price),
            category || '热菜',
            imageUrl || '',
            available === 'true',
            parseInt(spiciness)
          ]
        );
        importedCount++;
        console.log(`Imported: ${name}`);
      } catch (error) {
        console.error(`Failed to import ${name}:`, error);
      } finally {
        connection.release();
      }
    }
    
    console.log(`Successfully imported ${importedCount} dishes`);
  } catch (error) {
    console.error('Failed to import menu data:', error);
  }
}

// Run the import function
importMenuData().then(() => {
  console.log('Menu data import completed');
  process.exit(0);
}).catch(error => {
  console.error('Menu data import failed:', error);
  process.exit(1);
});