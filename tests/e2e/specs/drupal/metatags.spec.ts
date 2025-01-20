import { expect, test } from '@playwright/test';

import { websiteUrl } from '../../helpers/url';

test('Metatags on Basic page', async ({ page }) => {
  // This is a page with all the SEO fields empty. In this case:
  // - the title should fallback to the node title.
  // - the description and image_src should be empty.
  // - same rule like the two above for the og related tags.
  const allEmptyUrlEn = websiteUrl('/en/seo-test-all-empty');
  await page.goto(allEmptyUrlEn);
  await expect(page.locator('head meta[name="title"]')).toHaveAttribute(
    'content',
    'SEO test - all empty | Silverback Drupal Template',
  );
  await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute(
    'content',
    'SEO test - all empty | Silverback Drupal Template',
  );
  await expect(page.locator('head meta[name="description"]')).toHaveCount(0);
  await expect(
    page.locator('head meta[property="og:description"]'),
  ).toHaveCount(0);
  await expect(page.locator('head meta[rel="image_src"]')).toHaveCount(0);
  await expect(page.locator('head meta[property="og:image"]')).toHaveCount(0);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    'href',
    allEmptyUrlEn,
  );
  await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute(
    'content',
    allEmptyUrlEn,
  );

  // Check also its German translation.
  const allEmptyUrlDe = websiteUrl('/de/seo-test-all-empty-de');
  await page.goto(allEmptyUrlDe);
  await expect(page.locator('head meta[name="title"]')).toHaveAttribute(
    'content',
    'SEO test - all empty DE | Silverback Drupal Template',
  );
  await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute(
    'content',
    'SEO test - all empty DE | Silverback Drupal Template',
  );
  await expect(page.locator('head meta[name="description"]')).toHaveCount(0);
  await expect(
    page.locator('head meta[property="og:description"]'),
  ).toHaveCount(0);
  await expect(page.locator('head link[rel="image_src"]')).toHaveCount(0);
  await expect(page.locator('head meta[property="og:image"]')).toHaveCount(0);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    'href',
    allEmptyUrlDe,
  );
  await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute(
    'content',
    allEmptyUrlDe,
  );

  // The next page is one where all the SEO fields (the title, description and
  // image) are filled in.
  const allFilledUrlEn = websiteUrl('/en/seo-test-all-filled');
  await page.goto(allFilledUrlEn);
  await expect(page.locator('head meta[name="title"]')).toHaveAttribute(
    'content',
    'Overwritten SEO title | Silverback Drupal Template',
  );
  await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Overwritten SEO title | Silverback Drupal Template',
  );
  await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
    'content',
    'SEO description',
  );
  await expect(
    page.locator('head meta[property="og:description"]'),
  ).toHaveAttribute('content', 'SEO description');
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    'href',
    allFilledUrlEn,
  );
  await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute(
    'content',
    allFilledUrlEn,
  );
  await expect(page.locator('head link[rel="image_src"]')).toHaveAttribute(
    'href',
    '/sites/default/files/2024-04/the_silverback.jpeg',
  );
  await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute(
    'content',
    websiteUrl('/sites/default/files/2024-04/the_silverback.jpeg'),
  );

  const allFilledUrlDe = websiteUrl('/de/seo-test-all-filled-de');
  await page.goto(allFilledUrlDe);
  await expect(page.locator('head meta[name="title"]')).toHaveAttribute(
    'content',
    'Overwritten SEO title DE | Silverback Drupal Template',
  );
  await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Overwritten SEO title DE | Silverback Drupal Template',
  );
  await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
    'content',
    'SEO description DE',
  );
  await expect(
    page.locator('head meta[property="og:description"]'),
  ).toHaveAttribute('content', 'SEO description DE');
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
    'href',
    allFilledUrlDe,
  );
  await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute(
    'content',
    allFilledUrlDe,
  );
  await expect(page.locator('head link[rel="image_src"]')).toHaveAttribute(
    'href',
    '/sites/default/files/2024-04/the_silverback.jpeg',
  );
  await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute(
    'content',
    websiteUrl('/sites/default/files/2024-04/the_silverback.jpeg'),
  );
});

test('HTML lang attribute', async ({ page }) => {
  await page.goto(websiteUrl('/en'));
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto(websiteUrl('/de'));
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');

  await page.goto(websiteUrl('/en/imprint'));
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto(websiteUrl('/de/impressum'));
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});
