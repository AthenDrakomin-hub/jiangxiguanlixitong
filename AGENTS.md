# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Development Commands

### Build Commands
- `npm run dev` - Run the development server (Vite)
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

### Database Commands
- `npm run db:migrate` - Run database migration using Neon database
- `npm run test:neon` - Test Neon database connection
- `npm run init:system` - Initialize system with default data (users, rooms, etc.)

### Testing Commands
- `tsx tests/test-neon-connection.ts` - Test Neon database connection
- `tsx test-db.ts` - Test database functionality
- `curl http://localhost:5173/api/test-connection` - Test database connection via API

### Additional Scripts
- `tsx scripts/initialize-menu.ts` - Initialize menu data
- `tsx scripts/test-neon-connection.ts` - Additional Neon connection test

### Environment Setup
- The project uses Vite for TypeScript/JSX transpilation with importmap-based dependency loading from CDN
- All dependencies are loaded via importmap from CDN (no local node_modules needed for deployment)
- Edge Runtime API endpoints in `/api/` directory handle backend functionality

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS (loaded via CDN)
- **Build Tool**: Vite (transpilation only, no dependency bundling)
- **Backend**: Vercel Edge Functions (API routes in `/api/`)
- **Database**: Database abstraction layer supporting multiple backends (memory, neon)
- **Styling**: Tailwind CSS (CDN loaded)
- **Icons**: Lucide React
- **Charts**: Recharts

### Data Storage Architecture
- Database abstraction layer with support for multiple backends (`/lib/database.ts`)
- Supported databases: Memory (default for development), Neon PostgreSQL (production), Virtual (fallback)
- Data is organized in collections: dishes, orders, expenses, inventory, hotel_rooms, sign_bill_accounts, payment_methods, system_settings, partner_accounts, categories, system_dictionary, users, roles, permissions
- Each collection stores items with auto-generated IDs
- Automatic serialization/deserialization with data validation
- Built-in validation for each entity type (orders, dishes, expenses, etc.)
- Data validation includes: required fields, type checking, business logic validation (e.g., positive prices, valid statuses)
- Entity-specific validation rules prevent invalid data entry

### API Structure
- Edge Runtime API gateway in `/api/index.ts` handles CRUD operations for all collections
- Authentication API: `/api/auth/login` for user authentication
- Database configuration API: `/api/db-config.ts`
- User management API: `/api/users.ts`
- Data seeding API: `/api/seed.ts`
- Database snapshot API: `/api/snapshot.ts`
- Database migration API: `/api/migrate.ts`
- Generic CRUD handler supports GET (all/single), POST (create), PUT (update), DELETE operations
- CORS support with proper headers for cross-origin requests
- Request routing based on entity type with path matching
- Separate API files for complex operations (users, roles, permissions, etc.)

### Frontend Architecture
- Single-page application with routing via URL parameters
- `useAppData` hook provides cached data access (5-minute cache) from `hooks/useAppData.ts`
- Components in `/components/` directory handle different system modules
- Data fetching via `apiClient` service with automatic caching in `services/apiClient.ts`
- Lazy loading of components for performance optimization
- Responsive design with mobile menu support
- Importmap-based dependency loading for minimal bundle size
- Multi-language support (Chinese/Filipino)
- Local storage caching mechanism in `utils/cache.ts`

### Key System Modules
- **Hotel Room Management**: Room booking and status tracking
- **Menu Management**: Dish CRUD operations with categories and pricing
- **Order Management**: Complete order lifecycle with multiple statuses (PENDING, COOKING, READY, DELIVERED, COMPLETED, CANCELLED)
- **Financial System**: Expense tracking and reporting
- **Inventory Management**: Stock tracking with low-stock alerts
- **Sign Bill System**: Corporate account and credit management
- **Partner Account Management**: Business partner credit accounts
- **User Management**: Role-based access control with permissions
- **H5 Customer Ordering**: QR code-based room-specific ordering
- **Printing System**: Cloud printing and browser printing
- **Notification System**: Desktop and audio notifications for new orders

### API Endpoints
- **Generic CRUD**: `/api/{entity}` - Generic CRUD for dishes, orders, expenses, etc.
- **Authentication**: `/api/auth/login` - User authentication
- **Database Configuration**: `/api/db-config` - Configure and test database connections
- **Database Status**: `/api/db-status` - Check database connection status
- **Connection Test**: `/api/test-connection` - Test database read/write operations
- **Data Seeding**: `/api/seed` - Initialize system with default data
- **User Management**: `/api/users` - CRUD operations for user accounts
- **Print Service**: `/api/print` - Cloud printing functionality
- **System Dictionary**: `/api/system-dictionary` - Multi-language support

### Database Layer Architecture
- Database abstraction layer with factory pattern implementation (`/lib/database.ts`)
- Support for multiple database types through `Database` interface
- Memory database for development/testing, Neon for production, Virtual as fallback
- Built-in data validation for each entity type in `validateData` method
- Automatic timestamp management (createdAt, updatedAt)
- Generic CRUD operations through database manager
- Entity-specific validation rules for orders, dishes, expenses, inventory, hotel_rooms, sign_bill_accounts, partner_accounts
- DatabaseManager singleton provides global database access

### Environment Variables
- `DB_TYPE` - Database type (memory, neon) - defaults to memory
- `VITE_ADMIN_USER` - Admin username
- `VITE_ADMIN_PASS` - Admin password
- `VITE_APP_URL` - App URL for QR code generation (optional)
- `NEON_CONNECTION_STRING` - Connection string for Neon database (when DB_TYPE=neon)
- `VERCEL_URL` - Vercel deployment URL (set automatically in production)
- `NODE_ENV` - Environment mode (development/production)

### Deployment
- Deployed to Vercel with Edge Runtime
- No build-time dependencies needed (all loaded via CDN)
- Automatic environment variable injection from Vercel
- Custom security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Importmap-based dependency loading for minimal bundle size

### Key Data Types
- Defined in `/types.ts` with interfaces for all major entities (Dish, Order, Expense, Ingredient, SignBillAccount, HotelRoom, PartnerAccount, SystemDictionary, User, Role, Permission, etc.)
- Order status enum with multiple states for order lifecycle management
- Comprehensive type definitions for API responses and database operations
- Multi-language support through system dictionary entries

### Version Management and Security
- Data validation and sanitization for all inputs
- Role-based access control with permissions
- API authentication for sensitive operations
- Audit logging for sensitive operations in `/api/audit-log.ts`
- Production logging with sensitive data masking
- Frontend cache management with automatic clearing after data operations
- Input validation includes business logic checks (e.g., positive amounts, required fields)
- Caching mechanism with 5-minute default TTL in `utils/cache.ts`
- Error handling with environment-aware logging (less verbose in production)
- Security enhancements:
  - Removed development environment auto-authentication
  - Enforced formal authentication for all environments
  - Restricted CORS to formal domain: https://www.jiangxijiudian.store/
  - Environment variable protection through Vercel configuration

### Testing and Quality Assurance
- Database connection testing via `/api/test-connection.ts`
- Data seeding functionality via `/api/seed.ts` for initialization
- Snapshot functionality via `/api/snapshot.ts` for data backup
- API validation through comprehensive request/response handling
- Frontend data validation through type checking and business rules

### Monitoring and Logging
- Error monitoring service via `/services/monitoring.ts` with production environment error tracking
- Performance monitoring for API response times and database operations
- Production logging with sensitive data redaction and sanitization
- API request logging with performance metrics tracking
- Database operation performance monitoring with alerting for slow operations (>1s for DB, >2s for API)
- Centralized monitoring service with singleton pattern implementation