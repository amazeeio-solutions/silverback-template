import { expect, test } from '@playwright/test';

import { QuickActions, SiteLanguage } from '../../helpers/quick-actions';
import { websiteUrl } from '../../helpers/url';

test.describe('content hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });
  test('lists pages in alphabetic order', async ({ page }) => {
    await page.goto(websiteUrl('/en/content-hub'));
    const content = page.getByRole('main');
    const heading = page.getByRole('heading', {
      name: 'Architecture',
      level: 5,
    });
    await expect(heading).toBeVisible();
    await expect(content.getByText('PHP')).not.toBeVisible();
  });

  test('allows to switch pages', async ({ page }) => {
    await page.goto(websiteUrl('/en/content-hub'));
    const content = page.getByRole('main');

    await expect(
      content.getByRole('heading', {
        name: 'Architecture',
        level: 5,
      }),
    ).toBeVisible();
    await expect(content.getByText('Gatsby')).not.toBeVisible();
    await content.getByText('Next').click();
    await expect(
      content.getByRole('heading', {
        name: 'Architecture',
        level: 5,
      }),
    ).not.toBeVisible();
    await expect(
      content.getByRole('heading', {
        name: 'Block: Heading',
        level: 5,
      }),
    ).toBeVisible();
  });

  test('allows to search for items', async ({ page }) => {
    await page.goto(websiteUrl('/en/content-hub'));
    const content = page.getByRole('main');
    await content.getByPlaceholder('Keyword').fill('technologies');
    await content.getByRole('button', { name: 'Search' }).click();
    await expect(
      content.getByRole('heading', {
        name: 'Architecture',
        level: 5,
      }),
    ).not.toBeVisible();
    await expect(
      content.getByRole('heading', {
        name: 'Technologies',
        level: 5,
      }),
    ).toBeVisible();
  });

  test('allows to filter by term', async ({ page }) => {
    await page.goto(websiteUrl('/en/content-hub'));
    const content = page.getByRole('main');

    await content
      .getByRole('combobox', { name: 'Filter by terms' })
      .selectOption('Block');

    await content.getByRole('button', { name: 'Search' }).click();

    await expect(
      content.getByRole('heading', { name: 'Block: Accordion', level: 5 }),
    ).toBeVisible();
    await expect(
      content.getByRole('heading', {
        name: 'Block: Conditional content',
        level: 5,
      }),
    ).toBeVisible();
  });

  test('returns language specific results', async ({ page }) => {
    const quickActions = new QuickActions(page);
    await page.goto(websiteUrl('/en/content-hub'));
    // Change language to German.
    await quickActions.changeLanguageTo(SiteLanguage.Deutsch);
    const content = page.getByRole('main');
    await expect(
      content.getByRole('heading', {
        name: 'Architektur',
        level: 5,
      }),
    ).toBeVisible();
    await expect(
      content.getByRole('heading', {
        name: 'Architecture',
        level: 5,
      }),
    ).not.toBeVisible();
    await expect(
      content.getByRole('heading', {
        name: 'Gatsby',
        level: 5,
      }),
    ).not.toBeVisible();
  });
});

test('no filters are being displayed', async ({ page }) => {
  await page.goto(websiteUrl('/en/content-hub-no-filters'));
  const content = page.getByRole('main');

  await expect(
    content.getByRole('combobox', { name: 'Filter by terms' }),
  ).not.toBeVisible();
  await expect(content.getByPlaceholder('Keyword')).not.toBeVisible();
  await expect(
    content.getByRole('button', { name: 'Search' }),
  ).not.toBeVisible();
});

test('results have been limited', async ({ page }) => {
  await page.goto(websiteUrl('/en/content-hub-limited'));
  const content = page.getByRole('main');

  await content.locator('article').first().waitFor();
  const articleCount = await content.locator('article').count();
  expect(articleCount).toBe(3);
});

test('default term filter has been applied', async ({ page }) => {
  await page.goto(websiteUrl('/en/content-hub-term-set'));
  const content = page.getByRole('main');

  // Get the filter dropdown element
  const termFilter = content.getByRole('combobox', { name: 'Filter by terms' });

  // Check that the dropdown is set to "List" by default
  const selectedOptionLabel = await termFilter.evaluate((select) => {
    const selectElement = select as HTMLSelectElement;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    return selectedOption.text;
  });
  expect(selectedOptionLabel).toBe('List');

  // Check that the dropdown is disabled
  const isDisabled = await termFilter.isDisabled();
  expect(isDisabled).toBe(true);

  await content.locator('article').first().waitFor();

  const articles = content.locator('article');
  const count = await articles.count();

  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const article = articles.nth(i);
    await expect(
      article.locator('span.rounded').filter({ hasText: 'List' }),
    ).toBeVisible();
  }
});
