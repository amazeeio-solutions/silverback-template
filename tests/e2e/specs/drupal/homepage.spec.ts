import { expect, test } from '@playwright/test';

import { QuickActions, SiteLanguage } from '../../helpers/quick-actions';
import { websiteUrl } from '../../helpers/url';

test.describe('the homepage', () => {
  test('exists in english', async ({ page }) => {
    await page.goto(websiteUrl('/en'));
    const content = page.getByRole('main');
    await expect(
      content.getByRole('heading', { name: 'Architecture' }),
    ).toBeVisible();
  });

  test('exists in german', async ({ page }) => {
    const quickActions = new QuickActions(page);
    await page.goto(websiteUrl('/en'));
    const content = page.getByRole('main');
    await quickActions.changeLanguageTo(SiteLanguage.Deutsch);
    await expect(
      content.getByRole('heading', { name: 'Architektur' }),
    ).toBeVisible();
  });

  test('redirects to root path on direct access', async ({ page }) => {
    await page.goto(websiteUrl('/en/architecture'));
    expect(page.url()).toBe(websiteUrl('/en'));
  });

  test('it redirects to english by default', async ({ page }) => {
    await page.goto(websiteUrl('/'));
    const content = page.getByRole('main');
    await expect(
      content.getByRole('heading', { name: 'Architecture' }),
    ).toBeVisible();
  });

  test('redirects to german if german is the preferred language', async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: 'de-DE' });
    const page = await context.newPage();
    await page.goto(websiteUrl('/'));
    const content = page.getByRole('main');
    await expect(
      content.getByText('Architektur', { exact: true }),
    ).toBeVisible();
    await context.close();
  });

  test('it displays an image', async ({ page }) => {
    await page.goto(websiteUrl('/en'));
    const image = page.getByAltText('Decoupled architecture sketch');
    await expect(image).toBeVisible();
  });
});
