import { expect, test as setup } from '@playwright/test';

import { cmsUrl } from '../helpers/url';
import {
  netlifyBootTimeout,
  waitForNetlifyBoot,
} from '../helpers/wait-for-netlify-boot';

setup.setTimeout(netlifyBootTimeout + 30_000);

setup('setup', async ({ page }) => {
  await waitForNetlifyBoot(page);

  await page.goto(cmsUrl('/user/login'));
  await page.getByRole('textbox', { name: 'Username' }).fill('admin');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(
    page.getByRole('heading', { name: 'admin', exact: true }),
  ).toHaveCount(1);
  await page.context().storageState({ path: '.auth/admin.json' });
});
