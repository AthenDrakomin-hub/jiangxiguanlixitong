// scripts/check-env-config.js
/**
 * Script to check environment configuration
 * 
 * This script checks if the required environment variables are set
 * and displays the current storage backend configuration.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function checkEnvConfig() {
  console.log('🔧 Environment Configuration Checker');
  console.log('===================================');
  
  // Check KV storage configuration
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_TOKEN;
  
  console.log('\n🔑 KV Storage Configuration:');
  console.log(`  KV_REST_API_URL: ${kvUrl ? '✅ SET' : '❌ MISSING'}`);
  console.log(`  KV_REST_API_TOKEN: ${kvToken ? '✅ SET' : '❌ MISSING'}`);
  
  if (kvUrl && kvToken) {
    console.log('  📊 Status: KV storage configuration is complete');
  } else {
    console.log('  📊 Status: KV storage configuration is incomplete');
  }
  
  // Check storage backend selection
  const useKvStorage = process.env.USE_KV_STORAGE === 'true';
  
  console.log('\n⚙️  Storage Backend Selection:');
  console.log(`  USE_KV_STORAGE: ${useKvStorage ? 'true (KV Storage)' : 'false (Blob Storage)'}`);
  
  if (useKvStorage) {
    console.log('  📊 Current backend: Vercel KV (Upstash Redis)');
  } else {
    console.log('  📊 Current backend: Vercel Blob Storage');
  }
  
  // Check Blob storage configuration (if needed)
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  
  console.log('\n📦 Blob Storage Configuration:');
  console.log(`  BLOB_READ_WRITE_TOKEN: ${blobToken && blobToken !== 'BLOB_TOKEN_PLACEHOLDER' ? '✅ SET' : '❌ MISSING'}`);
  
  console.log('\n📋 Summary:');
  if (useKvStorage) {
    if (kvUrl && kvToken) {
      console.log('  ✅ Ready to use KV storage');
    } else {
      console.log('  ❌ KV storage selected but not properly configured');
    }
  } else {
    if (blobToken && blobToken !== 'BLOB_TOKEN_PLACEHOLDER') {
      console.log('  ✅ Ready to use Blob storage');
    } else {
      console.log('  ❌ Blob storage selected but not properly configured');
    }
  }
}

// Run the check
checkEnvConfig();