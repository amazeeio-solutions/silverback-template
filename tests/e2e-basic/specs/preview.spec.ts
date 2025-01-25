import { expect, test } from '@playwright/test';

test('preview', async ({ page }) => {
  // Login.
  await page.goto('http://127.0.0.1:8888');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Log in' }).click();
  // Check the Imprint page preview.
  await page.goto('http://127.0.0.1:8888/imprint');
  await expect(
    page
      .frameLocator('iframe')
      .first()
      .getByRole('heading', { name: 'Imprint', exact: true }),
  ).toBeVisible();
});
