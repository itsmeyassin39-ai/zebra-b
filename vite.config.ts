import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type UserConfig} from 'vite';

export default defineConfig((): UserConfig => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      target: 'es2018',
      minify: 'esbuild',
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            motion: ['motion'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // The API (products, categories, posts, login) is served by server/index.ts
      // (start it with `npm run server` — it connects to Turso or a local file).
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
