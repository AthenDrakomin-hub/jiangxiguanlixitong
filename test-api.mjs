#!/usr/bin/env node

/**
 * Simple API Connection Test
 * 
 * This script tests the connection to the Upstash Redis API directly.
 */

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import fetch from 'node-fetch';

async function testApiConnection() {
  console.log('🔍 Testing Upstash Redis API connection...\n');
  
  const apiUrl = process.env.KV_REST_API_URL;
  const apiToken = process.env.KV_REST_API_TOKEN;
  
  if (!apiUrl || !apiToken) {
    console.log('❌ Missing API credentials');
    console.log('   KV_REST_API_URL:', apiUrl || 'NOT SET');
    console.log('   KV_REST_API_TOKEN:', apiToken ? 'SET' : 'NOT SET');
    return;
  }
  
  console.log('✅ API credentials found');
  console.log('   URL:', apiUrl);
  
  try {
    // Test a simple ping command
    console.log('\n🔍 Testing API connectivity...');
    
    const response = await fetch(`${apiUrl}/ping`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connection successful!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ API connection failed');
      const text = await response.text();
      console.log('   Response:', text);
    }
  } catch (error) {
    console.log('❌ API connection test failed');
    console.log('   Error:', error.message);
    if (error.cause) {
      console.log('   Cause:', error.cause);
    }
  }
}

// Run the test
testApiConnection().catch(console.error);