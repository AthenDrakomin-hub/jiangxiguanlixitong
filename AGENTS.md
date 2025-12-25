# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Development Commands

### Build Commands
- `npm run build` - Build the application for production
- `npm run dev` - Run the development server (requires Vercel CLI: `vercel dev`)
- `npm run preview` - Preview the production build locally

### Database Commands
- `npm run db:migrate` - Run database migration using Neon database
- `npm run test:neon` - Test Neon database connection
- `npm run init:system` - Initialize system with default data (users, rooms, etc.)
- `npm run dev` - Start development server to test API endpoints locally

### Environment Setup
- The project uses Vercel Edge Runtime with database abstraction layer supporting multiple backends
- All dependencies are loaded via importmap from CDN (no local node_modules needed for deployment)
- Vite is used only for TypeScript/JSX transpilation, not for bundling dependencies

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS (loaded via CDN)
- **Backend**: Vercel Edge Functions (API routes in `/api/`)
- **Database**: Database abstraction layer with support for multiple backends
- **Styling**: Tailwind CSS (CDN loaded)
- **Icons**: Lucide React
- **Charts**: Recharts

### Data Storage Architecture
- Uses database abstraction layer with support for multiple backends (`/lib/database.ts`)
- Supported databases: MySQL, PostgreSQL, SQLite, Memory, Neon
- Data is organized in collections: dishes, orders, expenses, inventory, ktv_rooms, sign_bill_accounts, hotel_rooms, payment_methods, system_settings
- Each collection stores items with auto-generated IDs
- Automatic serialization/deserialization with BigInt handling
- Data validation is performed for each entity type in the database layer

### API Structure
- Edge Runtime API endpoints in `/api/` directory
- Main API gateway: `/api/index.ts` handles CRUD operations for all collections via generic business handler
- Authentication API: `/api/auth/login` for user authentication
- Print API: `/api/print.ts` for cloud printing integration
- Print order API: `/api/print-order.ts` for automatic order printing
- Database configuration API: `/api/db-config.ts`
- User management API: `/api/users.ts`
- Data seeding API: `/api/seed.ts`
- Database snapshot API: `/api/snapshot.ts`
- Database migration API: `/api/migrate.ts`

### Frontend Architecture
- Single-page application with routing via URL parameters
- `useAppData` hook provides cached data access (5-minute cache)
- Components in `/components/` directory handle different system modules
- Data fetching via `apiClient` service with automatic caching
- Lazy loading of components for performance optimization
- Responsive design with mobile menu support

### Key System Modules
- **Hotel Room Management**: 64 rooms (8201-8232, 8301-8332) + 1 KTV room
- **Menu Management**: Dish CRUD operations with categories and pricing
- **Order Management**: Complete order lifecycle with multiple statuses (PENDING, COOKING, READY, DELIVERED, COMPLETED, CANCELLED)
- **KTV System**: Room booking and session management
- **Financial System**: Expense tracking and reporting
- **Inventory Management**: Stock tracking with low-stock alerts
- **Sign Bill System**: Corporate account and credit management
- **H5 Customer Ordering**: QR code-based room-specific ordering
- **Printing System**: Cloud printing (Feieyun) and browser printing
- **User Management**: Role-based access control with permissions
- **Notification System**: Desktop and audio notifications for new orders

### API Endpoints
- **Database Configuration**: `/api/db-config` - Configure and test database connections
- **Database Status**: `/api/db-status` - Check database connection status
- **Connection Test**: `/api/test-connection` - Test database read/write operations
- **Data Seeding**: `/api/seed` - Initialize system with default data
- **User Management**: `/api/users` - CRUD operations for user accounts
- **Business Entities**: `/api/{entity}` - Generic CRUD for dishes, orders, expenses, etc.

### Cloud Deployment and API Usage
After deploying to Vercel, use these commands to interact with your deployed application:

```bash
# Verify database configuration
curl -X GET https://your-vercel-project.vercel.app/api/db-config

# Test database connection (includes auto-initialization if needed)
curl -X GET https://your-vercel-project.vercel.app/api/test-connection

# Initialize system data
curl -X POST https://your-vercel-project.vercel.app/api/seed

# Verify data initialization
curl -X GET https://your-vercel-project.vercel.app/api/hotel_rooms
curl -X GET https://your-vercel-project.vercel.app/api/dishes
curl -X GET https://your-vercel-project.vercel.app/api/users
```

Replace `your-vercel-project.vercel.app` with your actual Vercel deployment URL.

### Database Layer Architecture
- Database abstraction layer with factory pattern implementation
- Support for multiple database types through `Database` interface
- Memory database for development/testing, Neon for production
- Built-in data validation for each entity type
- Automatic timestamp management (createdAt, updatedAt)
- Generic CRUD operations through database manager

### Environment Variables
- `DB_TYPE` - Database type (memory, neon) - defaults to memory
- `VITE_ADMIN_USER` - Admin username
- `VITE_ADMIN_PASS` - Admin password
- `VITE_APP_URL` - App URL for QR code generation (optional)
- `NEON_CONNECTION_STRING` - Connection string for Neon database (when DB_TYPE=neon)

### Deployment
- Deployed to Vercel with Edge Runtime
- No build-time dependencies needed (all loaded via CDN)
- Automatic environment variable injection from Vercel KV
- Custom headers for security (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Importmap-based dependency loading for minimal bundle size

### Key Data Types
- Defined in `/types.ts` with interfaces for all major entities (Dish, Order, Expense, Ingredient, KTVRoom, SignBillAccount, HotelRoom, etc.)
- Order status enum with multiple states for order lifecycle management
- Comprehensive type definitions for API responses and database operations

### Version Management Strategy
- Data State Versioning: Automatic snapshot creation with Git Commit Hash association
- Audit Logging: All sensitive operations (sync, restore, backup) are logged with user, timestamp, and details
- API Security: Basic authentication required for sensitive operations (seed, restore)
- Frontend Cache Management: Automatic cache clearing after data operations
- Production Logging: Sensitive data (Base64 images) masked in production logs

### Deployment Commands
- `git tag -a v2.1.0 -m "江西酒店管理系统 - 运维增强版"` - Create release tag with versioned features
- Deploy to Vercel with automatic environment variable injection and security headers
- Post-deployment: Access system panel and run "状态检查" to verify cloud connectivity
- First sync: Click "数据同步" to populate production database with initial data

### Database Migration to Production
- Local development: Use `DB_TYPE=memory` for rapid development and testing
- Production deployment: Switch to `DB_TYPE=neon` with Neon PostgreSQL for data persistence
- Initialize production data: Run `/api/seed` endpoint (requires authentication) to populate all tables
- Data validation: All entities (dishes, orders, expenses, inventory, hotel_rooms, ktv_rooms, sign_bill_accounts, payment_methods) are now fully supported with validation rules
- Migration path: Use `/api/migrate` to transfer data from memory to Neon database when needed