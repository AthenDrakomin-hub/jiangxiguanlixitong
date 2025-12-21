# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

This is a hotel management system built with React, TypeScript, and Vite. It manages hotel services including room service ordering via QR codes, menu management, order processing, financial management, and inventory tracking. The system is designed to work on multiple devices (mobile, tablet, desktop).

## Key Technologies

- React 18 with Hooks
- TypeScript with strict mode
- Vite as build tool
- Tailwind CSS for styling
- Upstash Redis for data storage (via Vercel KV)
- Recharts for data visualization
- Lucide React for icons
- ESLint and Prettier for code quality

## Project Structure

```
jiangxijiudian/
├── api/                 # Backend API endpoints
├── components/          # React frontend components (CustomerOrder, Dashboard, MenuManagement, etc.)
├── hooks/               # Custom React hooks
├── lib/                 # Core library files
├── utils/               # Utility functions
├── public/              # Static assets
├── scripts/             # Data initialization and migration scripts
├── __tests__/          # Test files
└── config/              # Configuration files
```

## Common Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint to check for code issues
npm run lint

# Run ESLint and automatically fix issues
npm run lint:fix

# Format code with Prettier
npm run format

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Add sample data to the database
npm run add-sample-data
```

## Architecture Overview

### Frontend Architecture

The frontend is organized around React components, with each major feature having its own component file:

- CustomerOrder.tsx: Handles customer room service ordering via QR codes
- Dashboard.tsx: Main dashboard with analytics and overview
- MenuManagement.tsx: Menu creation and management
- OrderManagement.tsx: Processing and tracking orders
- FinanceSystem.tsx: Financial records and reporting
- InventoryManagement.tsx: Stock tracking and management
- Settings.tsx: System configuration
- Login.tsx: Authentication system

State management is handled through React Context API, with custom hooks in the hooks/ directory for reusable logic.

### Backend Architecture

Backend API endpoints are defined in the api/ directory:

- index.ts: Main API route handlers
- db.ts: Database connection and operations
- kv-index.ts: Key-value storage operations (Redis/Upstash)

The backend uses Vercel Serverless Functions with RESTful API patterns.

### Data Layer

Data is stored in Upstash Redis (accessed via Vercel KV) with the following key patterns:
- Menu items, orders, inventory, and financial data are stored with appropriate key structures
- Data is accessed through the API layer in the api/ directory

### Build and Deployment

- Vite is used for building and bundling
- Manual chunking strategy splits large components into separate bundles for better performance
- Deployed on Vercel with environment variables for database connections
- Husky and lint-staged enforce code quality on git commits