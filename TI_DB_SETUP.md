# TiDB Cloud Setup Guide

This document explains how to set up and use TiDB Cloud with the Jiangxi Hotel Management System.

## Prerequisites

1. TiDB Cloud account (free tier available)
2. Connection credentials from TiDB Cloud dashboard
3. SSL certificate (isrgrootx1.pem) downloaded

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# TiDB Cloud Configuration
TIDB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=qraob1XdQoegM6F.root
TIDB_PASSWORD=rZrxRtFz7wGOtZ0D
TIDB_DATABASE=fortune500
TIDB_SSL=true

# Admin Credentials
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=jx88888888

# Storage Settings (optional)
VITE_STORAGE_TYPE=tidb
```

Replace the values with your actual TiDB Cloud connection details.

### SSL Certificate

The `isrgrootx1.pem` file should be placed in the project root directory. This certificate is required for secure connections to TiDB Cloud.

## Testing the Connection

To test the database connection, run:

```bash
npm run test:tidb
```

This will:
1. Connect to your TiDB Cloud instance
2. Initialize all required database tables
3. Verify the connection is working properly

## Database Schema

The application automatically creates the following tables on first run:

- `dishes` - Menu items
- `orders` - Customer orders
- `order_items` - Individual items within orders
- `inventory` - Ingredient inventory tracking
- `expenses` - Financial expense tracking
- `ktv_rooms` - KTV room management
- `sign_bill_accounts` - Sign bill account management
- `hotel_rooms` - Hotel room management

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Verify all environment variables are set correctly
2. Ensure the SSL certificate file is in the correct location
3. Check that your TiDB Cloud instance is running and accessible
4. Verify firewall settings allow outbound connections on port 4000

### SSL Errors

If you see SSL-related errors:

1. Make sure `isrgrootx1.pem` is in the project root
2. Verify the file contents haven't been corrupted
3. Check that your Node.js version supports the certificate

## Migration from Supabase

This project has been migrated from Supabase to TiDB Cloud. All data operations now use MySQL-compatible SQL queries through the `mysql2` package.