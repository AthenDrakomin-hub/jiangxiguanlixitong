import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  // Allow these prefixes to be exposed to client-side code via import.meta.env
  // This enables reading the default environment variables
  envPrefix: ['VITE_'],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'recharts': ['recharts'],
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'lucide': ['lucide-react'],
          // Split large components into separate chunks
          'dashboard': ['./components/Dashboard.tsx'],
          'menu-management': ['./components/MenuManagement.tsx'],
          'customer-order': ['./components/CustomerOrder.tsx'],
          'order-management': ['./components/OrderManagement.tsx'],
          'finance-system': ['./components/FinanceSystem.tsx'],
          'inventory-management': ['./components/InventoryManagement.tsx'],
          'settings': ['./components/Settings.tsx'],
          // Split utility functions into separate chunks
          'utils': ['./utils/cache.ts', './utils/cookie.ts', './utils/i18n.ts'],
          'services': ['./services/apiClient.ts', './services/auditLogger.ts'],
          'hooks': ['./hooks/useAppData.ts', './hooks/useCachedData.ts']
        }
      }
    }
  },
  // 配置开发服务器和代理
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // 确保正确的模块解析和构建设置
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  esbuild: {
    // TypeScript特定设置
    tsconfigRaw: '{}'
  }
})