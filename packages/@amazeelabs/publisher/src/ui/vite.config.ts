import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const uiRoot = __dirname;

// https://vitejs.dev/config/
export default defineConfig({
  root: uiRoot,
  // Explicit, because commands run from the package root, which holds no
  // PostCSS config.
  css: {
    postcss: uiRoot,
  },
  build: {
    outDir: path.resolve(uiRoot, '../../dist/ui'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        info: path.resolve(uiRoot, 'index.html'),
        status: path.resolve(uiRoot, 'status.html'),
      },
    },
  },
  plugins: [react()],
});
