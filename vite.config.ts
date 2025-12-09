import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '江西酒店管理系统',
        short_name: '江西酒店',
        description: '专为海外华人酒店设计的SaaS管理系统',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        lang: 'zh-CN',
        scope: '/',
        icons: [
          {
            src: '/logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: false,
        type: 'module',
        navigateFallback: 'index.html'
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
          'aws-sdk': ['@aws-sdk/client-s3'],
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'lucide': ['lucide-react']
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