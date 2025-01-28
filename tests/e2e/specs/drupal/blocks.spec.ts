import { expect, Page, test } from '@playwright/test';

import { websiteUrl } from '../../helpers/url';

const validateTileAndSubtitle = async (page: Page, title: string) => {
  const content = page.getByRole('main');
  await expect(
    content.getByRole('heading', {
      name: title,
      level: 1,
    }),
  ).toBeVisible();
  await expect(content.getByText(title).last()).toBeVisible();
};

test.describe('Testing All Blocks', () => {
  test('Accordion', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-accordion'));
    await validateTileAndSubtitle(page, 'Block: Accordion');

    const accordionItems = [
      {
        title: 'Accordion Title One',
        content: 'I am the content for title one.',
        hasIcon: true,
      },
      {
        title: 'Accordion Title Two',
        content: 'I am the content for title two.',
        hasIcon: true,
      },
      {
        title: 'Accordion Title Three',
        content: 'I am the content for title three.',
        hasIcon: true,
      },
      {
        title: 'Accordion Title Four',
        content: 'I am the content for title four.',
        hasIcon: false,
      },
    ];

    const content = page.getByRole('main');
    for (const item of accordionItems) {
      await expect(content.getByText(item.title)).toBeVisible();
      await content.getByText(item.title).click();
      await expect(content.getByText(item.content)).toBeVisible();
    }
  });

  test('Conditional content', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-conditional-content'));
    await validateTileAndSubtitle(page, 'Block: Conditional content');

    await expect(
      page.getByText('This content will only be shown for one year.'),
    ).toBeVisible();
  });

  test('CTA', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-cta'));
    await validateTileAndSubtitle(page, 'Block: CTA');

    // CTA blocks
    await expect(page.locator('a:text("Block CTA")')).toHaveCount(1);
    await expect(page.locator('a:text("CTA with Icon")')).toHaveCount(1);
  });

  test('Form', async ({ page }) => {
    // EN
    await page.goto(websiteUrl('/en/block-form'));
    await validateTileAndSubtitle(page, 'Block: Form');
    await expect(
      page.locator('.silverback-iframe iframe').first(),
    ).toHaveAttribute('src', /en\/form\/contact\?iframe=true/);

    // DE
    await page.goto(websiteUrl('/de/block-form'));
    await validateTileAndSubtitle(page, 'Block: Formular');
    await expect(
      page.locator('.silverback-iframe iframe').first(),
    ).toHaveAttribute('src', /de\/form\/contact\?iframe=true/);
  });

  test('Heading', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-heading'));
    await validateTileAndSubtitle(page, 'Block: Heading');

    const headingItems = [
      {
        title: 'Heading two',
        level: 2,
        id: 'heading-two',
      },
      {
        title: 'Heading three',
        level: 3,
        id: 'heading-three',
      },
      {
        title: 'Heading four',
        level: 4,
        id: 'heading-four',
      },
      {
        title: 'Heading two - Bold',
        level: 2,
        id: 'heading-two---bold',
      },
      {
        title: 'Heading three - Bold',
        level: 3,
        id: 'heading-three---bold',
      },
      {
        title: 'Heading four - Bold',
        level: 4,
        id: 'heading-four---bold',
      },
    ];

    const content = page.getByRole('main');
    for (const item of headingItems) {
      const header = content.getByRole('heading', {
        name: item.title,
        level: item.level,
        exact: true,
      });

      await expect(header).toBeVisible();
      await expect(header).toHaveAttribute('id', item.id);
    }
  });

  test('Hero', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-hero'));
    await validateTileAndSubtitle(page, 'Block: Hero');

    await expect(
      page.locator(
        'img[data-test-id=hero-image][alt="A beautiful landscape."]',
      ),
    ).toHaveCount(2);
  });

  test('Hero with Form', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-hero-form'));
    await validateTileAndSubtitle(page, 'Block: Hero with Form');

    await expect(
      page.locator('img[data-test-id=hero-image][alt="The silverback"]'),
    ).toHaveCount(2);

    await expect(
      page.locator('.silverback-iframe iframe').first(),
    ).toHaveAttribute('src', /en\/form\/contact\?iframe=true/);
  });

  test('Horizontal separator', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-horizontal-separator'));
    await validateTileAndSubtitle(page, 'Block: Horizontal separator');

    await expect(page.locator('hr')).toHaveCount(2);
  });

  test('Image Teasers', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-image-teasers'));
    await validateTileAndSubtitle(page, 'Block: Image Teasers');

    await expect(
      page.locator(
        'img:not([data-test-id=hero-image])[alt="A beautiful landscape."]',
      ),
    ).toHaveCount(1);
    await expect(page.locator('h2:text("Image One Teaser Title")')).toHaveCount(
      1,
    );
    await expect(page.locator('a:text("Image One Teaser CTA")')).toHaveCount(1);
    await expect(
      page.locator('img:not([data-test-id=hero-image])[alt="The silverback"]'),
    ).toHaveCount(1);
    await expect(page.locator('h2:text("Image Two Teaser Title")')).toHaveCount(
      1,
    );
    await expect(page.locator('a:text("Image Two Teaser CTA")')).toHaveCount(1);
  });

  test('Image with Text', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-image-text'));
    await validateTileAndSubtitle(page, 'Block: Image with Text');

    await expect(
      page.locator(
        'img:not([data-test-id=hero-image])[alt="A beautiful landscape."]',
      ),
    ).toHaveCount(1);
    await expect(
      page.locator('img:not([data-test-id=hero-image])[alt="The silverback"]'),
    ).toHaveCount(1);

    await expect(
      page.locator('p:text("Image with text on the left")'),
    ).toHaveCount(1);
    await expect(
      page.locator('p:text("Image with text on the right")'),
    ).toHaveCount(1);
  });

  test('Info Grid', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-info-grid'));
    await validateTileAndSubtitle(page, 'Block: Info Grid');

    await expect(page.locator('p:text("Some information here")')).toHaveCount(
      3,
    );
    const content = page.getByRole('main');
    await expect(content.locator('svg')).toHaveCount(3);
  });

  test('List', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-list'));
    await validateTileAndSubtitle(page, 'Block: List');

    const content = page.getByRole('main');
    await expect(content.locator('ul > li')).toHaveCount(12);
    await expect(content.locator('ul.list-style--arrows > li')).toHaveCount(3);
    await expect(content.locator('ul.list-style--checkmarks > li')).toHaveCount(
      3,
    );
    await expect(
      page.locator('ul.list-style--question-marks > li'),
    ).toHaveCount(3);
  });

  test('Media', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-media'));
    await validateTileAndSubtitle(page, 'Block: Media');

    await expect(
      page.locator('img:not([data-test-id=hero-image])[alt="The silverback"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('figcaption:text("Media Image Caption")'),
    ).toHaveCount(1);
  });

  test('Paragraph', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-paragraph'));
    await validateTileAndSubtitle(page, 'Block: Paragraph');

    const content = page.getByRole('main');
    await expect(content.locator('.container-text .prose p')).toHaveCount(2);
  });

  test('Quote', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-quote'));
    await validateTileAndSubtitle(page, 'Block: Quote');

    await expect(
      page.locator(
        'p:text("My mother always used to say: The older you get, the better you get, unless you’re a banana.")',
      ),
    ).toHaveCount(1);
    await expect(page.locator('p:text("Rose (Betty White)")')).toHaveCount(1);
    await expect(page.locator('span:text("TheGoldenGirls")')).toHaveCount(1);
  });

  test('Table', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-table'));
    await validateTileAndSubtitle(page, 'Block: Table');

    const content = page.getByRole('main');
    await expect(content.locator('table')).toHaveCount(4);
    await expect(content.locator('td')).toHaveCount(84);

    await expect(
      page.locator('figcaption:text("Table Caption - Fixed width")'),
    ).toHaveCount(1);
    await expect(
      page.locator('figcaption:text("Table Caption - Header Section")'),
    ).toHaveCount(1);
    await expect(
      page.locator('figcaption:text("Table Caption - Footer Section")'),
    ).toHaveCount(1);
  });

  test('Teaser list', async ({ page }) => {
    await page.goto(websiteUrl('/en/block-teaser-list'));
    await validateTileAndSubtitle(page, 'Block: Teaser list');

    const content = page.getByRole('main');
    await expect(content.locator('ul > li')).toHaveCount(8);
  });
});
