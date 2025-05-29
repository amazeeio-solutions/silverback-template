import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // CI is slow.
    hookTimeout: process.env.CI ? 30000 : undefined,
    testTimeout: process.env.CI ? 30000 : undefined,
  },
});
