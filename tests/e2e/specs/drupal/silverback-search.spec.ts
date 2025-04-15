import { expect } from '@playwright/test';
import { execSync } from 'child_process';

import { test } from '../../fixtures';
import { drush } from '../../helpers/drupal';
import { cmsUrl } from '../../helpers/url';

test('remote rendered items are indexed', async ({ pageAdmin: page }) => {
  // Make sure all content is indexed.
  drush('sapi-c');
  drush('sapi-i');

  // Check that the content is indexed.
  await page.goto(cmsUrl('/admin/content'));
  await page.getByRole('link', { name: 'Go to' }).click();
  await page.getByRole('textbox', { name: 'Query' }).fill('Trytofindme');
  await expect(
    page.getByText('Remote rendered items test (Content)'),
  ).toBeVisible();
});

test('remote rendered items are kept dirty until FE build', async ({
  pageAdmin: page,
}) => {
  // We will rebuild the frontend in the test.
  test.setTimeout(1000 * 60 * 3);

  // Update the CTA link text.
  await page.goto(cmsUrl('/admin/content'));
  await page
    .getByRole('textbox', { name: 'Title' })
    .fill('Remote rendered items test');
  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('link', { name: 'Edit Remote rendered items' }).click();
  await page.getByLabel('Link text').fill('Updatedtext');
  await page.getByText('Save', { exact: true }).click();

  // Re-index content.
  drush('sapi-i');

  // Check that the updated content is NOT indexed yet. We should be able to
  // find it by old link text.
  await page.goto(cmsUrl('/admin/content'));
  await page.getByRole('link', { name: 'Go to' }).click();
  await page.getByRole('textbox', { name: 'Query' }).fill('Trytofindme');
  await expect(
    page.getByText('Remote rendered items test (Content)'),
  ).toBeVisible();

  // Re-build frontend and re-index content.
  execSync(`pnpm run --filter "@custom/website" build`);
  drush('sapi-i');

  // Check that the updated content is indexed.
  await page.goto(cmsUrl('/admin/content'));
  await page.getByRole('link', { name: 'Go to' }).click();
  await page.getByRole('textbox', { name: 'Query' }).fill('Updatedtext');
  await expect(
    page.getByText('Remote rendered items test (Content)'),
  ).toBeVisible();

  // After the test completes, restore the original content
  await page.goto(cmsUrl('/admin/content'));
  await page
    .getByRole('textbox', { name: 'Title' })
    .fill('Remote rendered items test');
  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('link', { name: 'Edit Remote rendered items' }).click();
  await page.getByLabel('Link text').fill('Trytofindme');
  await page.getByText('Save', { exact: true }).click();

  // Re-build frontend and re-index content
  execSync(`pnpm run --filter "@custom/website" build`);
  drush('sapi-i');
});
