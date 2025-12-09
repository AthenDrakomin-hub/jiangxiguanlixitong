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

// Simple CSV parser for this specific file
const parseCSV = (csvText) => {
  // Split into lines
  const lines = csvText.trim().split('\n');
  
  // Extract headers (first line)
  const headers = lines[0].slice(1, -1).split('","'); // Remove surrounding quotes and split
  
  // Process data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    
    // Remove surrounding quotes and split by ","
    const values = line.slice(1, -1).split('","');
    
    // Create object with headers as keys
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
};

// Read and parse the cleaned menu CSV file
const readMenuData = () => {
  try {
    const csvContent = fs.readFileSync('./cleaned_menu_by_your_categories.csv', 'utf8');
    const records = parseCSV(csvContent);
    
    // Transform CSV data to match database schema
    const dishes = records.map(record => ({
      id: record.id,
      name: record.name_zh,
      description: record.description || '',
      price: parseFloat(record.price),
      category: getCategoryName(record.category_id),
      imageUrl: record.image_url || '',
      available: record.available === 'true',
      spiciness: getSpicinessLevel(record.is_spicy)
    }));
    
    return dishes;
  } catch (error) {
    console.error('❌ Error reading menu data:', error.message);
    return [];
  }
};

// Map category IDs to category names
const getCategoryName = (categoryId) => {
  const categoryMap = {
    '9be666c7-3bdc-47d1-b33f-cb286c514956': '主菜',
    'd091fc14-aea7-4e99-9c68-b703cc560476': '汤羹',
    '3ff05277-db24-43fb-853f-f80f041432c3': '凉菜'
  };
  
  return categoryMap[categoryId] || '其他';
};

// Convert spiciness boolean to level (0-3)
const getSpicinessLevel = (isSpicy) => {
  return isSpicy === 'true' ? 2 : 0;
};

// Import menu data to database
const importMenuData = async () => {
  try {
    const dishes = readMenuData();
    
    if (dishes.length === 0) {
      console.log('⚠️ No menu data to import.');
      return;
    }
    
    console.log(`📥 Importing ${dishes.length} dishes to database...`);
    
    const connection = await pool.getConnection();
    
    // Clear existing data
    await connection.execute('DELETE FROM dishes');
    console.log('🗑️ Cleared existing dishes data.');
    
    // Insert new dishes
    let insertedCount = 0;
    for (const dish of dishes) {
      try {
        await connection.execute(
          `INSERT INTO dishes (id, name, description, price, category, imageUrl, available, spiciness) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            dish.id,
            dish.name,
            dish.description,
            dish.price,
            dish.category,
            dish.imageUrl,
            dish.available,
            dish.spiciness
          ]
        );
        insertedCount++;
      } catch (insertError) {
        console.error(`❌ Error inserting dish "${dish.name}":`, insertError.message);
      }
    }
    
    connection.release();
    
    console.log(`✅ Successfully imported ${insertedCount} of ${dishes.length} dishes.`);
    
    // Show summary by category
    console.log('\n📊 Import Summary by Category:');
    const categoryCounts = {};
    dishes.forEach(dish => {
      categoryCounts[dish.category] = (categoryCounts[dish.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  • ${category}: ${count} dishes`);
    });
    
    return insertedCount;
  } catch (error) {
    console.error('❌ Error importing menu data:', error.message);
    return 0;
  }
};

console.log('🚀 Starting menu data import to TiDB...');
importMenuData().then(insertedCount => {
  console.log(`\n🎉 Menu data import complete. ${insertedCount} dishes imported.`);
  process.exit(0);
});