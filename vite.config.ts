import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite 构建配置 - 极简架构
 * 
 * 架构特点：
 * - 前端依赖通过 importmap 从 esm.sh CDN 加载
 * - Vite 仅用于 TypeScript/JSX 转译，不打包依赖
 * - 构建产物极小（~35KB gzip ~12KB）
 * 
 * 部署说明：
 * - 无需本地 node_modules，推送代码后 Vercel 自动构建
 * - Edge Runtime API 独立部署，不依赖此配置
 */
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_'],
  build: {
    outDir: 'dist',
    rollupOptions: {
      // 排除所有 npm 依赖，由 index.html 中的 importmap 加载
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
});
