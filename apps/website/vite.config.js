import path from 'path';

export default {
  resolve: {
    alias: {
      '@amazeelabs/bridge': path.resolve(__dirname, 'src/bridge.tsx'),
      fs: 'node:fs',
    },
  },
  ssr: {
    external: ['sharp', 'image-dimensions'],
  },
  optimizeDeps: {
    exclude: ['sharp', 'image-dimensions'],
  },
};
