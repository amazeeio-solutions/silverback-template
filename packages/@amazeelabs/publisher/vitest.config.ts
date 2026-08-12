import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Killing a process escalates SIGINT -> SIGTERM -> SIGKILL, granting each
    // signal a 5s grace period, so process tests cannot fit in the 5s default.
    testTimeout: 30_000,
    // config.test.ts uses process.chdir(), which is unavailable in workers.
    pool: 'forks',
  },
});
