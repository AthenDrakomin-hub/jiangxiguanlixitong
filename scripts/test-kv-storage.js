// scripts/test-kv-storage.js
/**
 * Test script for KV storage functionality
 *
 * This script tests the basic functionality of the KV storage implementation
 * to ensure it works correctly before migration.
 */

import dotenv from 'dotenv';
import path from 'path';
import { kvClient } from '../lib/kv-client.js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testKVStorage() {
  console.log('🚀 Starting KV Storage Tests...');
  console.log('==============================');

  try {
    // Test 1: Create items
    console.log('\n📝 Test 1: Creating sample items...');

    const testDish = {
      name: 'Test Dish',
      price: 28.8,
      category: '热菜',
      description: '测试菜品',
      available: true,
    };

    const createdDish = await kvClient.create('dishes', testDish);
    console.log('✅ Created dish:', createdDish);

    const testOrder = {
      tableNumber: 'TEST01',
      items: [{ dishId: createdDish.id, quantity: 2, price: 28.8 }],
      totalAmount: 57.6,
      status: 'pending',
    };

    const createdOrder = await kvClient.create('orders', testOrder);
    console.log('✅ Created order:', createdOrder);

    // Test 2: Retrieve items
    console.log('\n🔍 Test 2: Retrieving items...');

    const retrievedDish = await kvClient.get(`dishes:${createdDish.id}`);
    console.log('✅ Retrieved dish:', retrievedDish);

    // Test 3: Get all items
    console.log('\n📋 Test 3: Getting all items...');

    const allDishes = await kvClient.getAll('dishes');
    console.log(`✅ Found ${allDishes.length} dishes`);

    const allOrders = await kvClient.getAll('orders');
    console.log(`✅ Found ${allOrders.length} orders`);

    // Test 4: Update item
    console.log('\n✏️ Test 4: Updating item...');

    const updatedDish = await kvClient.update('dishes', createdDish.id, {
      price: 32.8,
      description: '更新后的测试菜品',
    });
    console.log('✅ Updated dish:', updatedDish);

    // Test 5: Index management
    console.log('\n🔢 Test 5: Testing index management...');

    const dishIndex = await kvClient.getIndex('dishes');
    console.log('✅ Dish index:', dishIndex);

    // Test 6: Delete item
    console.log('\n🗑️ Test 6: Deleting item...');

    const deleted = await kvClient.delete('dishes', createdDish.id);
    console.log('✅ Deleted dish:', deleted);

    // Verify deletion
    const afterDeleteIndex = await kvClient.getIndex('dishes');
    console.log('✅ Dish index after deletion:', afterDeleteIndex);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Created: 1 dish, 1 order`);
    console.log(`  - Retrieved: 1 dish`);
    console.log(
      `  - Listed: ${allDishes.length} dishes, ${allOrders.length} orders`
    );
    console.log(`  - Updated: 1 dish`);
    console.log(`  - Deleted: 1 dish`);

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the tests
async function main() {
  const success = await testKVStorage();

  if (success) {
    console.log('\n✅ All KV storage tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  }
}

main();
