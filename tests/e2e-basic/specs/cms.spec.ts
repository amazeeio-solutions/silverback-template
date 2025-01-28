import { expect, test } from '@playwright/test';

test('cms', async ({ page }) => {
  await page.goto('http://127.0.0.1:8888');
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});
