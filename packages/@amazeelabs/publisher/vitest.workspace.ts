import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'server',
      include: ['src/**/*.test.ts'],
      exclude: ['src/ui/**'],
      // Killing a process escalates SIGINT -> SIGTERM -> SIGKILL, granting each
      // signal a 5s grace period, so process tests cannot fit in the 5s default.
      testTimeout: 30_000,
      // config.test.ts uses process.chdir(), which is unavailable in workers.
      pool: 'forks',
    },
  },
  {
    test: {
      name: 'ui',
      root: 'src/ui',
      include: ['**/*.test.{ts,tsx}'],
      environment: 'jsdom',
    },
  },
  {
    test: {
      name: 'packaged',
      include: ['packaged/**/*.test.ts'],
      testTimeout: 60_000,
      // Packing, installing and booting the tarball is slow.
      hookTimeout: 300_000,
    },
  },
]);
