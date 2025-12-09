import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
  // 确保正确的模块解析和构建设置
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  esbuild: {
    // TypeScript特定设置
    tsconfigRaw: '{}'
  }
})