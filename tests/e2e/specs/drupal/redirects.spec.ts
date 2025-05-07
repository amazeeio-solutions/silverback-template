import { expect, test } from '@playwright/test';

import { websiteUrl } from '../../helpers/url';

test.describe('drupal redirects', () => {
  test('are detected', async ({ page }) => {
    await page.goto(websiteUrl('/node/1'));
    expect(page.url).not.toBe(websiteUrl('/node/1'));
  });
});
