# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Development Commands

### Build Commands
- `npm run build` - Build the application for production
- `npm run dev` - Run the development server (requires Vercel CLI: `vercel dev`)
- `npm run preview` - Preview the production build locally

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
- Supported databases: MySQL, PostgreSQL, SQLite, Memory
- Data is organized in collections: dishes, orders, expenses, inventory, ktv_rooms, sign_bill_accounts, hotel_rooms, payment_methods, system_settings
- Each collection stores items with auto-generated IDs
- Automatic serialization/deserialization with BigInt handling

### API Structure
- Edge Runtime API endpoints in `/api/` directory
- Main API: `/api/index.ts` handles CRUD operations for all collections
- Print API: `/api/print.ts` for cloud printing integration
- Print order API: `/api/print-order.ts` for automatic order printing

### Frontend Architecture
- Single-page application with routing via URL parameters
- `useAppData` hook provides cached data access (5-minute cache)
- Components in `/components/` directory handle different system modules
- Data fetching via `apiClient` service with automatic caching

### Key System Modules
- **Hotel Room Management**: 64 rooms (8201-8232, 8301-8332) + 1 KTV room
- **Menu Management**: Dish CRUD operations with categories and pricing
- **Order Management**: Complete order lifecycle with multiple statuses
- **KTV System**: Room booking and session management
- **Financial System**: Expense tracking and reporting
- **Inventory Management**: Stock tracking with low-stock alerts
- **Sign Bill System**: Corporate account and credit management
- **H5 Customer Ordering**: QR code-based room-specific ordering
- **Printing System**: Cloud printing (Feieyun) and browser printing

### Environment Variables
- `DB_TYPE` - Database type (memory, neon) - defaults to memory
- `VITE_ADMIN_USER` - Admin username
- `VITE_ADMIN_PASS` - Admin password
- `VITE_APP_URL` - App URL for QR code generation (optional)

### Deployment
- Deployed to Vercel with Edge Runtime
- No build-time dependencies needed (all loaded via CDN)
- Automatic environment variable injection from Vercel KV
- Custom headers for security (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)