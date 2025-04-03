import { defineConfig, devices } from '@playwright/test';

const port = 9888;

export default defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'null',
  use: {
    trace: process.env.CI ? 'retain-on-failure' : 'on',
    actionTimeout: 10_000,
  },
  testDir: './specs',
  webServer: [
    {
      command: `php -S 0.0.0.0:${port} .ht.router.php >> /tmp/cms.log 2>&1`,
      cwd: '../../apps/cms/web',
      env: {
        ...process.env,
        SB_ENVIRONMENT: '1',
        SIMPLETEST_DB: 'sqlite://localhost/sites/default/files/.sqlite',
        DRUSH_OPTIONS_URI: `http://127.0.0.1:${port}`,
      },
      port,
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    {
      name: 'chromium',
      testMatch: /\.*.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
