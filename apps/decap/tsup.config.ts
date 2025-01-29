import raw from 'esbuild-plugin-raw';
import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  treeshake: true,
  outDir: 'build',
  clean: true,
  esbuildPlugins: [raw()],
});
