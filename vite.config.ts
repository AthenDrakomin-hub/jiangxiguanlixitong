import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite 构建配置
 * - 依赖通过 importmap 从 esm.sh CDN 加载
 * - 构建仅转译 TSX，不打包依赖
 */
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_'],
  build: {
    outDir: 'dist',
    rollupOptions: {
      // 构建时排除所有 npm 依赖，由 importmap 加载
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'recharts',
        'lucide-react',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities',
        'axios',
      ],
    },
  },
  server: {
    port: 5173,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
});
