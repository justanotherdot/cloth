import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/assets',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  define: {
    global: 'globalThis',
  },
});
