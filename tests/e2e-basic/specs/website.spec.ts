import { expect, test } from '@playwright/test';

test('website', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByText(/error/i)).not.toBeVisible();
});
