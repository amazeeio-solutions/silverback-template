import { expect, test } from '@playwright/test';

// TODO: Re-enable with SLB-470
test.fixme('decap', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(
    page.getByRole('heading', { name: 'Collections' }),
  ).toBeVisible();
});
