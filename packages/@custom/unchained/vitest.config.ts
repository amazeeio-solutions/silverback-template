import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
    // Exclude integration tests from regular test runs
    exclude: [
      '**/server.integration.test.ts',
      '**/authentication.integration.test.ts',
      '**/node_modules/**',
    ],
  },
});
