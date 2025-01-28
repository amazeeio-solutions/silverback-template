import { saveWebpage } from '@amazeelabs/save-webpage';
import { expect, Page, test } from '@playwright/test';
import { execSync } from 'child_process';

const baseDir = '../ui/static/stories/webforms';
const iframeResizerSelector =
  'script[src*="silverback_iframe/js/iframeResizer.contentWindow.min.js"]';

test('Export webforms for styling', async ({ page }) => {
  execSync(`rm -rf ${baseDir}`);

  const baseUrl =
    'http://127.0.0.1:8888/en/form/styling?iframe=true&no_css=true';
  await page.setViewportSize({
    // In the frontend the form is wrapped into a div with max-w-3xl class,
    // which translates to 48 rem, which is 768 px. Roughly.
    // We try to match the width because the modal is centered dynamically by
    // Drupal JS, but then, when we save the page, the size and position are
    // fixed in the HTML.
    width: 768,
    // Does not matter.
    height: 768,
  });

  await page.goto(baseUrl);
  await expect(page.locator(iframeResizerSelector)).toHaveCount(1);
  await savePage(page, 'idle');

  // Disable frontend validation.
  await page.evaluate(() => {
    document.querySelectorAll('[required]').forEach((element) => {
      element.removeAttribute('required');
    });
  });

  await page.getByLabel('Email with a confirmation').fill('asd@asd');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(
    page.locator('[data-drupal-messages] [role="alert"]'),
  ).toBeVisible();
  await expect(page.locator(iframeResizerSelector)).toHaveCount(1);
  await savePage(page, 'error');

  await page.goto(baseUrl);
  await page
    .locator('label')
    .filter({ hasText: 'I agree to the terms of service in modal' })
    .getByRole('button')
    .click();
  await page.waitForTimeout(500);
  await savePage(page, 'terms-of-service-modal');

  await page.goto(baseUrl);
  await page
    .locator('label')
    .filter({ hasText: 'I agree to the terms of service in slideout' })
    .getByRole('button')
    .click();
  await page.waitForTimeout(500);
  await savePage(page, 'terms-of-service-slideout');
});

async function savePage(page: Page, name: string) {
  await saveWebpage({
    directory: `${baseDir}/${name}`,
    url: page.url(),
    content: await page.content(),
  });
}
