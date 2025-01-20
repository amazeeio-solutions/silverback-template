import { expect, test } from '@playwright/test';

import { cmsUrl } from '../../helpers/url';

test.describe('instant preview', () => {
  test.use({ storageState: '.auth/admin.json' });
  test('display an unpublished page in an iframe', async ({ page }) => {
    await page.goto(cmsUrl('/admin/content'));
    await page.getByRole('link', { name: 'Add content' }).click();
    await page.locator("[name='title[0][value]']").fill('Instant preview test');
    await page.locator('#edit-submit').click();
    await page
      .locator('#editor-edit-body-0-value h1 span')
      .first()
      .fill('This is visible instantly.');
    await page.locator('#edit-submit').click();
    await expect(
      page.getByRole('heading', { name: 'Instant preview test', exact: true }),
    ).toBeVisible();
    await expect(
      page
        .frameLocator('iframe.external-preview-entity__iframe')
        .getByRole('heading', { name: 'This is visible instantly.' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(
      page.getByText('The Basic page Instant preview test has been deleted.', {
        exact: true,
      }),
    ).toBeVisible();
  });
});
