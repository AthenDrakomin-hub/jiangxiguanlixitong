// README-KV-MIGRATION.md

# Vercel KV (Upstash) Migration Guide

This guide explains how to migrate the Jiangxi Hotel Management System from Vercel Blob Storage to Vercel KV (Upstash Redis).

## Overview

The system currently uses Vercel Blob Storage for data persistence. This migration will move all data to Vercel KV (powered by Upstash Redis) for improved performance and additional features.

## Prerequisites

1. Upstash Redis database (already created: `upstash-kv-amber-window`)
2. Environment variables configured in `.env.local`:
   ```bash
   UPSTASH_REDIS_URL=your_upstash_redis_url
   UPSTASH_REDIS_TOKEN=your_upstash_redis_token
   ```

## Migration Steps

### 1. Prepare the Environment

Ensure all required dependencies are installed:

```bash
npm install @upstash/redis
```

### 2. Test KV Storage Functionality

Run the test script to verify KV storage works correctly:

```bash
node scripts/test-kv-storage.js
```

### 3. Perform the Migration

Run the migration script to transfer all data from Blob to KV:

```bash
node scripts/migrate-blob-to-kv.js
```

### 4. Verify the Migration

Run the verification script to ensure data integrity:

```bash
node scripts/verify-kv-storage.js
```

### 5. Switch to KV Storage

Update your `.env.local` file to use KV storage:

```bash
USE_KV_STORAGE=true
```

### 6. Test the Application

Verify that all application functionality works correctly with the new storage backend.

## Rollback Plan

If issues are encountered, you can rollback to Blob storage:

1. Update `.env.local`:

   ```bash
   USE_KV_STORAGE=false
   ```

2. Restart the application

## Monitoring

After migration, monitor:

1. Application performance
2. Error rates
3. Upstash Redis usage statistics
4. Data consistency between frontend and backend

## Cleanup (Optional)

After confirming successful migration and stable operation:

1. Archive old Blob data
2. Remove unused Blob-related code (optional, for cleanup)

## Architecture Changes

### New Components

1. `lib/kv-client.ts` - KV storage client wrapper
2. `lib/storage-manager.ts` - Unified storage interface
3. `api/kv-index.ts` - KV-specific API handler
4. `api/unified-index.ts` - Unified API handler for both backends

### Modified Components

1. `api/index.ts` - Updated to use storage manager
2. Various scripts updated to support both storage backends

## Performance Benefits

1. Faster data access (Redis vs. HTTP requests to Blob storage)
2. Better querying capabilities
3. Atomic operations for data consistency
4. Built-in indexing and set operations

## Limitations

1. KV storage has a 512MB limit per value
2. All data must be serializable to JSON
3. Key names must follow KV naming conventions

## Support

For issues with the migration, contact the development team.
