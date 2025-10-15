import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    trace: process.env.CI ? 'retain-on-failure' : 'on',
    actionTimeout: 10_000,
  },
  webServer: [
    {
      command: 'pnpm run --filter "@custom/cms" dev >> /tmp/cms.log 2>&1',
      port: 8888,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'pnpm run --filter "@custom/publisher" dev >> /tmp/website.log 2>&1',
      port: 8000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'pnpm run --filter "@custom/preview" start >> /tmp/preview.log 2>&1',
      port: 8001,
      reuseExistingServer: !process.env.CI,
    },
  ],
  testDir: './specs',
  projects: [
    {
      name: 'setup',
      testMatch: /setup\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /\.*.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
