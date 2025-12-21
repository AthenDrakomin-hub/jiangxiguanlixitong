// scripts/migrate-blob-to-kv.js
/**
 * Migration script from Vercel Blob Storage to Vercel KV (Upstash Redis)
 * 
 * This script migrates all data from the existing Vercel Blob Storage
 * to the new Vercel KV storage system.
 */

import dotenv from 'dotenv';
import path from 'path';
import { list } from '@vercel/blob';
import { kvClient } from '../lib/kv-client.js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Validate required environment variables
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ Missing BLOB_READ_WRITE_TOKEN environment variable!');
  console.error('Please ensure BLOB_READ_WRITE_TOKEN is set in .env.local');
  process.exit(1);
}

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.error('❌ Missing Upstash Redis environment variables!');
  console.error('Please ensure KV_REST_API_URL and KV_REST_API_TOKEN are set in .env.local');
  process.exit(1);
}

// Define collections to migrate
const COLLECTIONS = [
  'dishes',
  'orders',
  'expenses',
  'inventory',
  'ktv_rooms',
  'sign_bill_accounts',
  'hotel_rooms',
  'payment_methods',
];

async function migrateCollection(collectionName) {
  console.log(`\n🚚 Migrating collection: ${collectionName}`);
  console.log('----------------------------------------');
  
  try {
    // Get all blobs for this collection
    const blobList = await list({ prefix: `${collectionName}/` });
    console.log(`📋 Found ${blobList.blobs.length} items to migrate`);
    
    let successCount = 0;
    const migratedIds = [];
    
    // Process each blob
    for (const blob of blobList.blobs) {
      try {
        // Extract ID from blob pathname (e.g., dishes/item123.json -> item123)
        const id = blob.pathname.split('/').pop().replace('.json', '');
        
        // Fetch blob content
        const response = await fetch(blob.url);
        const itemData = await response.json();
        
        // Store in KV with proper key format
        const kvKey = `${collectionName}:${id}`;
        await kvClient.set(kvKey, itemData);
        
        // Add to index
        await kvClient.addToIndex(collectionName, id);
        
        successCount++;
        migratedIds.push(id);
        
        // Show progress
        if (successCount % 10 === 0 || successCount === blobList.blobs.length) {
          console.log(`  🔄 Progress: ${successCount}/${blobList.blobs.length} items migrated`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to migrate item ${blob.pathname}:`, error.message);
      }
    }
    
    console.log(`✅ Completed ${collectionName}: ${successCount}/${blobList.blobs.length} items migrated`);
    console.log(`   Migrated IDs: ${migratedIds.join(', ')}`);
    
    return successCount;
  } catch (error) {
    console.error(`❌ Error migrating collection ${collectionName}:`, error.message);
    return 0;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  console.log('-------------------------');
  
  let totalItems = 0;
  let verifiedCollections = 0;
  
  for (const collection of COLLECTIONS) {
    try {
      const kvItems = await kvClient.getAll(collection);
      const blobList = await list({ prefix: `${collection}/` });
      
      console.log(`  ${collection}: KV=${kvItems.length}, Blob=${blobList.blobs.length}`);
      
      if (kvItems.length === blobList.blobs.length) {
        console.log(`    ✅ Count matches`);
        verifiedCollections++;
      } else {
        console.log(`    ⚠️  Count mismatch!`);
      }
      
      totalItems += kvItems.length;
    } catch (error) {
      console.error(`  ❌ Error verifying ${collection}:`, error.message);
    }
  }
  
  console.log(`\n📊 Verification complete: ${verifiedCollections}/${COLLECTIONS.length} collections verified`);
  console.log(`   Total items in KV: ${totalItems}`);
  
  return verifiedCollections === COLLECTIONS.length;
}

async function main() {
  console.log('🚀 Starting Blob to KV Migration');
  console.log('================================');
  
  try {
    // Test KV connection first
    console.log('🔗 Testing KV connection...');
    const testId = `test_${Date.now()}`;
    await kvClient.set(`test:${testId}`, { test: true });
    const testResult = await kvClient.get(`test:${testId}`);
    await kvClient.del(`test:${testId}`);
    
    if (!testResult) {
      throw new Error('KV connection test failed');
    }
    console.log('✅ KV connection successful');
    
    // Migrate each collection
    let totalMigrated = 0;
    for (const collection of COLLECTIONS) {
      const count = await migrateCollection(collection);
      totalMigrated += count;
    }
    
    console.log('\n🏁 Migration Summary');
    console.log('====================');
    console.log(`Total items migrated: ${totalMigrated}`);
    
    // Verify migration
    const verificationPassed = await verifyMigration();
    
    if (verificationPassed) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('1. Update your .env.local to set USE_KV_STORAGE=true');
      console.log('2. Test your application with the new storage backend');
      console.log('3. Monitor for any issues');
      console.log('4. Optionally, archive the old Blob data');
    } else {
      console.log('\n⚠️  Migration completed but verification failed!');
      console.log('Please check the logs above for details.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();