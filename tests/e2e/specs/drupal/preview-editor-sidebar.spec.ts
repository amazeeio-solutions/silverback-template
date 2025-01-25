import { expect, test } from '@playwright/test';

import { cmsUrl } from '../../helpers/url';

test.describe('instant preview - toggle editor sidebar', () => {
  test.use({ storageState: '.auth/admin.json' });
  test('toggle the preview editor sidebar', async ({ page }) => {
    await page.goto(cmsUrl('/admin/content'));
    await page.getByRole('link', { name: 'Add content' }).click();
    await page
      .locator("[name='title[0][value]']")
      .fill('Instant preview sidebar test');
    await page.locator('#edit-submit').click();
    await page.locator('#edit-preview-link').click();
    await expect(page.locator('a').getByText('Share preview')).toBeVisible();
    await page.locator('#edit-preview-link').click();
    await expect(
      page.locator('a').getByText('Share preview'),
    ).not.toBeVisible();
  });
});
