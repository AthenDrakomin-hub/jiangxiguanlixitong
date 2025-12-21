// scripts/verify-kv-storage.js
/**
 * Verification script for KV storage
 *
 * This script verifies that the KV storage is working correctly
 * and contains the expected data after migration.
 */

import dotenv from 'dotenv';
import path from 'path';
import { kvClient } from '../lib/kv-client.js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Define collections to verify
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

async function verifyCollection(collectionName) {
  console.log(`\n🔍 Verifying collection: ${collectionName}`);
  console.log('----------------------------------------');

  try {
    // Get all items
    const items = await kvClient.getAll(collectionName);
    console.log(`✅ Retrieved ${items.length} items`);

    // Check index
    const index = await kvClient.getIndex(collectionName);
    console.log(`✅ Index contains ${index.length} entries`);

    // Verify consistency between items and index
    if (items.length !== index.length) {
      console.log(
        `⚠️  Inconsistency: ${items.length} items vs ${index.length} index entries`
      );
      return false;
    }

    // Sample a few items for detailed verification
    const sampleSize = Math.min(3, items.length);
    console.log(`📋 Sampling ${sampleSize} items for detailed verification:`);

    for (let i = 0; i < sampleSize; i++) {
      const item = items[i];
      if (!item.id) {
        console.log(`  ❌ Item missing ID:`, item);
        return false;
      }

      const kvItem = await kvClient.get(`${collectionName}:${item.id}`);
      if (!kvItem) {
        console.log(`  ❌ Item ${item.id} not found in KV storage`);
        return false;
      }

      // Basic deep equality check
      if (JSON.stringify(item) !== JSON.stringify(kvItem)) {
        console.log(`  ❌ Item ${item.id} data mismatch`);
        console.log(`    Original:`, item);
        console.log(`    KV:`, kvItem);
        return false;
      }

      console.log(`  ✅ Item ${item.id} verified`);
    }

    console.log(`✅ Collection ${collectionName} verified successfully`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error verifying collection ${collectionName}:`,
      error.message
    );
    return false;
  }
}

async function runComprehensiveTests() {
  console.log('🧪 Running Comprehensive KV Storage Tests');
  console.log('==========================================');

  try {
    // Test 1: Basic connectivity
    console.log('\n🔌 Test 1: Basic connectivity...');
    const testKey = `connectivity_test_${Date.now()}`;
    const testData = { timestamp: new Date().toISOString(), test: true };

    await kvClient.set(testKey, testData);
    const retrieved = await kvClient.get(testKey);
    await kvClient.del(testKey);

    if (JSON.stringify(retrieved) !== JSON.stringify(testData)) {
      throw new Error('Connectivity test failed: data mismatch');
    }
    console.log('✅ Connectivity test passed');

    // Test 2: Index operations
    console.log('\n🔢 Test 2: Index operations...');
    const testCollection = 'test_collection';
    const testIds = ['id1', 'id2', 'id3'];

    // Add to index
    for (const id of testIds) {
      await kvClient.addToIndex(testCollection, id);
    }

    // Retrieve index
    const index = await kvClient.getIndex(testCollection);

    // Verify
    if (
      index.length !== testIds.length ||
      !testIds.every((id) => index.includes(id))
    ) {
      throw new Error('Index operations test failed: index mismatch');
    }

    // Clean up
    for (const id of testIds) {
      await kvClient.removeFromIndex(testCollection, id);
    }

    const cleanedIndex = await kvClient.getIndex(testCollection);
    if (cleanedIndex.length !== 0) {
      throw new Error('Index operations test failed: cleanup failed');
    }

    console.log('✅ Index operations test passed');

    // Test 3: CRUD operations
    console.log('\n🔄 Test 3: CRUD operations...');
    const testEntity = 'test_entities';
    const testEntityData = { name: 'Test Entity', value: 42 };

    // Create
    const created = await kvClient.create(testEntity, testEntityData);
    if (
      !created.id ||
      created.name !== testEntityData.name ||
      created.value !== testEntityData.value
    ) {
      throw new Error('CRUD test failed: create operation');
    }

    // Read
    const retrievedEntity = await kvClient.get(`${testEntity}:${created.id}`);
    if (!retrievedEntity || retrievedEntity.id !== created.id) {
      throw new Error('CRUD test failed: read operation');
    }

    // Update
    const updatedEntity = await kvClient.update(testEntity, created.id, {
      value: 84,
    });
    if (!updatedEntity || updatedEntity.value !== 84) {
      throw new Error('CRUD test failed: update operation');
    }

    // Delete
    const deleted = await kvClient.delete(testEntity, created.id);
    if (!deleted) {
      throw new Error('CRUD test failed: delete operation');
    }

    // Verify deletion
    const afterDelete = await kvClient.get(`${testEntity}:${created.id}`);
    if (afterDelete !== null) {
      throw new Error('CRUD test failed: delete verification');
    }

    console.log('✅ CRUD operations test passed');

    return true;
  } catch (error) {
    console.error('❌ Comprehensive tests failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Starting KV Storage Verification');
  console.log('==================================');

  try {
    // Run comprehensive tests first
    const comprehensiveTestsPassed = await runComprehensiveTests();

    if (!comprehensiveTestsPassed) {
      console.log('\n❌ Comprehensive tests failed. Aborting verification.');
      process.exit(1);
    }

    console.log('\n✅ Comprehensive tests passed');

    // Verify each collection
    console.log('\n📂 Verifying collections...');
    let passedCollections = 0;

    for (const collection of COLLECTIONS) {
      const passed = await verifyCollection(collection);
      if (passed) {
        passedCollections++;
      }
    }

    console.log('\n📊 Verification Summary');
    console.log('======================');
    console.log(
      `Collections verified: ${passedCollections}/${COLLECTIONS.length}`
    );

    if (passedCollections === COLLECTIONS.length) {
      console.log(
        '\n🎉 All verifications passed! KV storage is ready for production use.'
      );
      process.exit(0);
    } else {
      console.log(
        '\n⚠️  Some verifications failed. Please check the logs above.'
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run the verification
main();
