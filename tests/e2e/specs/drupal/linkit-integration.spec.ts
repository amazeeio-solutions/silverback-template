import { expect, test } from '@playwright/test';
import { platform } from 'os';

import { silverback } from '../../helpers/drupal';
import { cmsUrl } from '../../helpers/url';

test.beforeAll(async () => {
  silverback('-y snapshot-restore tests-initial');
});
test.afterAll(async () => {
  silverback('-y snapshot-restore tests-initial');
});

test.use({ storageState: '.auth/admin.json' });

test('linkit content sorting', async ({ page }) => {
  const target = 'target page';

  for (const title of [
    `something else something else ${target}`,
    `${target} something else something else`,
    `something else ${target} something else`,
  ]) {
    await page.goto(cmsUrl('/en/node/add/page'));
    await page.getByRole('textbox', { name: 'Title *' }).fill(title);
    await page.getByLabel('Save as').selectOption('published');
    await page.getByRole('button', { name: 'Save' }).click();
  }

  await page.goto(cmsUrl('/en/node/add/page'));
  await page.getByRole('textbox', { name: 'Title *' }).fill('Foo');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.click('[data-type="core/paragraph"]');
  await page.type('[data-type="core/paragraph"]', 'Text');
  await page.press(
    '[data-type="core/paragraph"]',
    platform() === 'darwin' ? 'Meta+a' : 'Control+a',
  );
  await page.click('[aria-label="Link"]');
  await page.getByPlaceholder('Search or type url').fill(target);

  await page.waitForSelector('.block-editor-link-control__search-item-title');
  expect(
    await page
      .locator('.block-editor-link-control__search-item-title')
      .allInnerTexts(),
  ).toStrictEqual(
    // The close the search string is to the beginning of the title, the
    // higher the score.
    [
      `${target} something else something else`,
      `something else ${target} something else`,
      `something else something else ${target}`,
    ],
  );
});

test('linkit media sorting', async ({ page }) => {
  const target = 'target media';

  for (const title of [
    `something else something else ${target}`,
    `${target} something else something else`,
    `something else ${target} something else`,
  ]) {
    await page.goto(cmsUrl('/en/media/add/document'));
    await page.getByLabel('Name', { exact: true }).fill(title);
    await page
      .getByRole('textbox', { name: 'Add a new file *' })
      .setInputFiles('assets/document_txt_en.txt');
    await expect(
      page.getByRole('link', { name: /document_txt_en/ }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Save' }).click();
  }

  await page.goto(cmsUrl('/en/node/add/page'));
  await page.getByRole('textbox', { name: 'Title *' }).fill('Foo');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.click('[data-type="core/paragraph"]');
  await page.type('[data-type="core/paragraph"]', 'Text');
  await page.press(
    '[data-type="core/paragraph"]',
    platform() === 'darwin' ? 'Meta+a' : 'Control+a',
  );
  await page.click('[aria-label="Link"]');
  await page.getByPlaceholder('Search or type url').fill(target);

  await page.waitForSelector('.block-editor-link-control__search-item-title');
  expect(
    await page
      .locator('.block-editor-link-control__search-item-title')
      .allInnerTexts(),
  ).toStrictEqual(
    // The close the search string is to the beginning of the title, the
    // higher the score.
    [
      `${target} something else something else`,
      `something else ${target} something else`,
      `something else something else ${target}`,
    ],
  );
});

test('linkit bundles', async ({ page }) => {
  const target = 'FooBar';

  await page.goto(cmsUrl('/en/node/add/page'));
  await page.getByRole('textbox', { name: 'Title *' }).fill(`${target} page`);
  await page.getByLabel('Save as').selectOption('published');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.goto(cmsUrl('/en/media/add/document'));
  await page.getByLabel('Name', { exact: true }).fill(`${target} document`);
  await page
    .getByRole('textbox', { name: 'Add a new file *' })
    .setInputFiles('assets/document_txt_en.txt');
  await expect(
    page.getByRole('link', { name: /document_txt_en/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Save' }).click();

  await page.goto(cmsUrl('/en/node/add/page'));
  await page.getByRole('textbox', { name: 'Title *' }).fill('Foo');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.click('[data-type="core/paragraph"]');
  await page.type('[data-type="core/paragraph"]', 'Text');
  await page.press(
    '[data-type="core/paragraph"]',
    platform() === 'darwin' ? 'Meta+a' : 'Control+a',
  );
  await page.click('[aria-label="Link"]');
  await page.getByPlaceholder('Search or type url').fill(target);

  await expect(
    page.locator('.block-editor-link-control__search-item-type', {
      hasText: 'Content: Basic page',
    }),
  ).toBeVisible();
  await expect(
    page.locator('.block-editor-link-control__search-item-type', {
      hasText: 'Media: Document',
    }),
  ).toBeVisible();
});

test('linkit translations', async ({ page }) => {
  await page.goto(cmsUrl('/en/node/add/page'));
  await page.getByRole('textbox', { name: 'Title *' }).fill(`English page`);
  await page.getByLabel('Save as').selectOption('published');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Save', { exact: true }).click();
  await page.getByRole('link', { name: 'Translate' }).click();
  await page.click(':text-is("Add"):right-of(:text-is("German"))');
  await page.locator('#edit-title-0-value').fill(`German Translation page`);
  await page.getByText('Speichern (diese Übersetzung)').click();

  await page.goto(cmsUrl('/en/node/add/page'));
  await page.getByRole('textbox', { name: 'Title *' }).fill('Foo');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.click('[data-type="core/paragraph"]');
  await page.type('[data-type="core/paragraph"]', 'Text');
  await page.press(
    '[data-type="core/paragraph"]',
    platform() === 'darwin' ? 'Meta+a' : 'Control+a',
  );
  await page.click('[aria-label="Link"]');
  await page.getByPlaceholder('Search or type url').fill('German Translation');

  await expect(
    page.locator('.block-editor-link-control__search-item-title'),
  ).toHaveText('English page (German Translation page)');

  await page.goto(cmsUrl('/de/node/add/page'));
  await page.getByRole('textbox', { name: 'Titel *' }).fill('Foo');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await page.click('[data-type="core/paragraph"]');
  await page.type('[data-type="core/paragraph"]', 'Text');
  await page.press(
    '[data-type="core/paragraph"]',
    platform() === 'darwin' ? 'Meta+a' : 'Control+a',
  );
  await page.click('[aria-label="Link"]');
  await page.getByPlaceholder('Search or type url').fill('German Translation');

  await expect(
    page.locator('.block-editor-link-control__search-item-title'),
  ).toHaveText('German Translation page');
  await expect(
    page.locator('.block-editor-link-control__search-item-title'),
  ).not.toHaveText('English page');
});

test('test url autocomplete keyboard selection', async ({ page }) => {
  await page.goto(cmsUrl('/en/node/add/page'));
  await page.getByRole('textbox', { name: 'Title *' }).fill('Foo');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.click('[data-type="core/paragraph"]');
  await page.type('[data-type="core/paragraph"]', 'Test link');
  await page.press(
    '[data-type="core/paragraph"]',
    platform() === 'darwin' ? 'Meta+a' : 'Control+a',
  );
  await page.click('[aria-label="Link"]');
  await page.getByPlaceholder('Search or type url').fill('page');
  await page.waitForSelector('.block-editor-link-control__search-item');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Test link')).toHaveAttribute('href', /^\//);
});
