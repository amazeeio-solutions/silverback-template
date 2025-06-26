import { expect, test } from '@playwright/test';

import { websiteUrl } from '../../helpers/url';

test.describe('Webform functionality', () => {
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

  test.describe('Submission Limit', () => {
    test('when unlocked', async ({ page }) => {
      // The unlocked form can be submitted and is visible.
      await page.goto(websiteUrl('/en/submission/unlocked'));
      const unlockedIframe = page
        .frameLocator('.silverback-iframe iframe')
        .first();
      await unlockedIframe
        .locator('form')
        .waitFor({ state: 'visible', timeout: 5000 });
      await expect(
        unlockedIframe.getByRole('button', { name: 'Submit' }),
      ).toHaveCount(1);
      await expect(
        unlockedIframe.getByRole('checkbox', { name: 'Tick this box...' }),
      ).toHaveCount(1);
    });

    test('when locked', async ({ page }) => {
      const LIMIT_REACHED_TEXT = 'LIMIT REACHED!';

      // The form is locked and a message is shown.
      await page.goto(websiteUrl('/en/submission/locked'));
      const lockedIframe = page
        .frameLocator('.silverback-iframe iframe')
        .first();

      await lockedIframe
        .locator('form')
        .waitFor({ state: 'visible', timeout: 5000 });

      // Check if form is already locked
      const limitReachedCount = await lockedIframe
        .locator(`:text("${LIMIT_REACHED_TEXT}")`)
        .count();

      // If the form is not yet locked, lock it by submitting
      if (limitReachedCount === 0) {
        await lockedIframe
          .getByRole('checkbox', { name: 'Tick this box...' })
          .check();

        // Submit the form
        await lockedIframe.getByRole('button', { name: 'Submit' }).click();

        // Wait for submission to complete
        await page.waitForTimeout(500);

        // Reload the page to see locked state
        await page.reload();
      }

      // Now verify the form is locked
      await expect(
        lockedIframe.locator(`:text("${LIMIT_REACHED_TEXT}")`),
      ).toHaveCount(1);
    });
  });
});
