#!/usr/bin/env node

/**
 * Database Connection Checker
 *
 * This script checks the database connection status and provides diagnostic information.
 */

import { kvClient } from './lib/kv-client.js';

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...\n');

  // Check if client is connected
  const isConnected = kvClient.isConnected();

  if (!isConnected) {
    console.log('❌ Database connection: FAILED');
    console.log('📝 Reason: Missing environment variables');
    console.log(
      '\n🔧 To fix this issue, you need to set the following environment variables:'
    );
    console.log('   - KV_REST_API_URL=your_upstash_redis_url');
    console.log('   - KV_REST_API_TOKEN=your_upstash_redis_token');
    console.log(
      '\n📝 You can create a .env.local file in the project root with these variables.'
    );
    console.log(
      '\n📝 For local development, you can also use the Vercel CLI to set environment variables:'
    );
    console.log('   vercel env add KV_REST_API_URL');
    console.log('   vercel env add KV_REST_API_TOKEN');
    return;
  }

  console.log('✅ Database connection: SUCCESS');

  // Try to perform a simple operation
  try {
    console.log('\n🔍 Testing basic operations...');

    // Test set operation
    const testKey = 'test_connection';
    const testValue = { timestamp: new Date().toISOString(), test: true };

    await kvClient.set(testKey, testValue);
    console.log('✅ SET operation: SUCCESS');

    // Test get operation
    const retrievedValue = await kvClient.get(testKey);
    if (retrievedValue && retrievedValue.timestamp === testValue.timestamp) {
      console.log('✅ GET operation: SUCCESS');
    } else {
      console.log('❌ GET operation: FAILED');
      console.log('   Retrieved value:', retrievedValue);
    }

    // Clean up
    await kvClient.del(testKey);
    console.log('✅ Cleanup: SUCCESS');

    console.log('\n🎉 All database operations are working correctly!');
  } catch (error) {
    console.log('❌ Database operation test: FAILED');
    console.log(
      '📝 Error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Run the check
checkDatabaseConnection().catch(console.error);
