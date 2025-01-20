import { expect, test } from '@playwright/test';

import { cmsUrl } from '../../helpers/url';

test.describe('content-editing', () => {
  test.use({ storageState: '.auth/admin.json' });

  test('moderation controls are placed in the sidebar', async ({ page }) => {
    await page.goto(cmsUrl('/drupal'));
    await page.locator('li.tabs__tab a:text("Edit")').click();
    await expect(
      page.locator('[aria-label="Editor settings"]').getByText('Change to'),
    ).toBeVisible();
  });

  test('"More settings" fieldset is removed', async ({ page }) => {
    await page.goto(cmsUrl('/drupal'));
    await page.locator('li.tabs__tab a:text("Edit")').click();
    // Why we expect it to be removed:
    // - It's too long to scroll to the bottom of long pages
    // - If we have any valuable controls in the "More settings" fieldset,
    //   we should move them to the sidebar, where they are much easier to
    //   access
    await expect(page.locator(':text-is("More settings")')).toHaveCount(0);
  });

  test('preview a draft translation', async ({ page }) => {
    await page.goto(cmsUrl('/en/entity/create/node/page'));
    await page
      .getByLabel('Title', { exact: true })
      .fill('Will have a draft translation');
    await page.getByRole('button', { name: /Save|Create/ }).click();
    await page.getByLabel('Change to').selectOption('published');
    await page.getByLabel('Headline').fill('Will have a draft translation');
    await page.getByText('Save', { exact: true }).click();
    await page.getByRole('link', { name: 'Translate' }).click();
    const translateUrl = page.url();
    await page.getByRole('link', { name: 'Add', exact: true }).click();
    await page.getByLabel('Titel', { exact: true }).fill('A draft translation');
    await page.getByLabel('Ändern in').selectOption('draft');
    await page.getByLabel('Headline').fill('A draft translation');
    await page.getByText('Speichern (diese Übersetzung)').click();

    await page.goto(translateUrl);
    await page
      .getByRole('link', { name: 'A draft translation', exact: true })
      .click();
    await expect(
      page
        .frameLocator('iframe')
        .first()
        .getByRole('heading', { name: 'A draft translation', exact: true }),
    ).toBeVisible();
  });
});
