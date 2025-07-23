import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/server/server.integration.test.ts',
      'src/server/authentication.integration.test.ts',
    ],
    // Don't use the regular test-setup.ts file which includes MSW handlers
    // setupFiles: ['./src/test-setup.ts'],
  },
});
