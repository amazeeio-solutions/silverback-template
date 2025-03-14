import { expect } from '@playwright/test';

import { test } from '../../fixtures';
import { cmsUrl } from '../../helpers/url';

test.describe('authentication', () => {
  test('login form', async ({ pageAdmin: page }) => {
    await page.goto(cmsUrl('/user'));
    await expect(
      page.getByRole('heading', { name: 'admin', exact: true }),
    ).toBeVisible();
  });
});
