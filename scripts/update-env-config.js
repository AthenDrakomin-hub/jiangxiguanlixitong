// update-env-config.js
/**
 * Script to update environment configuration for KV migration
 * 
 * This script helps update the .env.local file to switch between
 * Blob storage and KV storage.
 */

import fs from 'fs';
import path from 'path';

const envFilePath = path.resolve(process.cwd(), '.env.local');

function updateEnvConfig(useKvStorage = true) {
  try {
    // Read the current .env.local file
    let envContent = '';
    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf8');
    }
    
    // Update or add the USE_KV_STORAGE variable
    if (envContent.includes('USE_KV_STORAGE=')) {
      // Replace existing value
      envContent = envContent.replace(
        /USE_KV_STORAGE=(true|false)/g,
        `USE_KV_STORAGE=${useKvStorage}`
      );
    } else {
      // Add new line
      envContent += `\nUSE_KV_STORAGE=${useKvStorage}\n`;
    }
    
    // Write back to file
    fs.writeFileSync(envFilePath, envContent);
    
    console.log(`✅ Environment configuration updated: USE_KV_STORAGE=${useKvStorage}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update environment configuration:', error.message);
    return false;
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'enable-kv':
    updateEnvConfig(true);
    console.log('💡 KV storage is now enabled. Restart your application to apply changes.');
    break;
    
  case 'disable-kv':
    updateEnvConfig(false);
    console.log('💡 KV storage is now disabled. Restart your application to apply changes.');
    break;
    
  case 'status':
    try {
      if (fs.existsSync(envFilePath)) {
        const envContent = fs.readFileSync(envFilePath, 'utf8');
        if (envContent.includes('USE_KV_STORAGE=true')) {
          console.log('📊 Current status: KV storage is ENABLED');
        } else if (envContent.includes('USE_KV_STORAGE=false')) {
          console.log('📊 Current status: KV storage is DISABLED');
        } else {
          console.log('📊 Current status: Using default storage (Blob)');
        }
      } else {
        console.log('📊 Current status: No .env.local file found (using default storage)');
      }
    } catch (error) {
      console.error('❌ Failed to read environment configuration:', error.message);
    }
    break;
    
  default:
    console.log('🔧 Environment Configuration Updater');
    console.log('====================================');
    console.log('Usage:');
    console.log('  node update-env-config.js enable-kv    Enable KV storage');
    console.log('  node update-env-config.js disable-kv   Disable KV storage (use Blob)');
    console.log('  node update-env-config.js status       Check current status');
    break;
}

export { updateEnvConfig };