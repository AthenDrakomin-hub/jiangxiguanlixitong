#!/usr/bin/env node

/**
 * Environment Variable Checker
 * 
 * This script checks if the required environment variables are set.
 */

console.log('🔍 Checking environment variables...\n');

// Check for required environment variables
const requiredVars = [
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'VITE_ADMIN_USER',
  'VITE_ADMIN_PASS'
];

const missingVars = [];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  for (const varName of missingVars) {
    console.log(`   - ${varName}`);
  }
  
  console.log('\n🔧 To fix this issue, create a .env.local file with these variables:');
  console.log('   KV_REST_API_URL=your_upstash_redis_url');
  console.log('   KV_REST_API_TOKEN=your_upstash_redis_token');
  console.log('   VITE_ADMIN_USER=your_admin_username');
  console.log('   VITE_ADMIN_PASS=your_admin_password');
} else {
  console.log('✅ All required environment variables are set:');
  for (const varName of requiredVars) {
    console.log(`   - ${varName}: ${process.env[varName] ? 'SET' : 'NOT SET'}`);
  }
}

console.log('\n📝 Current environment variables:');
console.log('   KV_REST_API_URL:', process.env.KV_REST_API_URL || 'NOT SET');
console.log('   KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? 'SET (hidden)' : 'NOT SET');
console.log('   VITE_ADMIN_USER:', process.env.VITE_ADMIN_USER || 'NOT SET');
console.log('   VITE_ADMIN_PASS:', process.env.VITE_ADMIN_PASS ? 'SET (hidden)' : 'NOT SET');