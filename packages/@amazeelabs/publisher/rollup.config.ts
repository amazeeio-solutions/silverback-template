import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

// The CLI is bundled by bundle.mjs. This only builds the `defineConfig` entry
// that consumers import in their publisher.config.ts.
export default defineConfig([
  {
    input: 'src/exports.ts',
    output: {
      file: 'dist/exports.cjs',
      format: 'cjs',
    },
    plugins: [esbuild({ target: 'ESNext' })],
  },
  {
    input: './src/exports.ts',
    output: [{ file: 'dist/exports.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]);
