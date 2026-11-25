import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: resolve(__dirname, 'node_modules/@custom/ui/static/public'),
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});
