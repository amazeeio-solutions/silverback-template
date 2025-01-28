import { expect, test } from '@playwright/test';

import { websiteUrl } from '../../helpers/url';

test('Webforms work', async ({ page }) => {
  await page.goto(websiteUrl('/en/block-form'));

  // Webform can be submitted.
  await page
    .frameLocator('.silverback-iframe iframe')
    .first()
    .getByRole('button', { name: 'Send message' })
    .click();

  // Webform redirects to confirmation page.
  await expect(page).toHaveURL(websiteUrl('/en/webform/success'));

  // Confirmation message is shown.
  await expect(
    page.locator(':text("Confirmation message for Contact webform")'),
  ).toHaveCount(1);

  // Confirmation message is gone after the page reload.
  await page.reload();
  await expect(
    page.locator(':text("Confirmation message for Contact webform")'),
  ).toHaveCount(0);

  // Webform from the German page redirects to the German confirmation page.
  await page.goto(websiteUrl('/de/block-form'));
  await page
    .frameLocator('.silverback-iframe iframe')
    .first()
    .getByRole('button', { name: 'Send message' })
    .click();
  await expect(page).toHaveURL(websiteUrl('/de/webform/success'));

  // TODO: Move all silverback-mono tests here?
  //  https://github.com/AmazeeLabs/silverback-mono/tree/development/packages/tests/silverback-iframe/playwright-tests
});
