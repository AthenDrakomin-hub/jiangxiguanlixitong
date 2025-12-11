// Vercel Blob Storage configuration for Vercel Serverless API
// This file should only be used in the backend API routes

import { put, list, del, head } from '@vercel/blob';

// Blob Storage configuration
const blobConfig = {
  token: process.env.BLOB_READ_WRITE_TOKEN
};

// Validate required environment variables
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ Missing required Blob storage environment variables!');
  console.error('Please set: BLOB_READ_WRITE_TOKEN');
  throw new Error('Blob storage configuration error');
}

// Export Blob client
export { put, list, del, head, blobConfig };