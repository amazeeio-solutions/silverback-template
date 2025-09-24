import { expect, test } from '@playwright/test';
import { platform } from 'os';

import { drush, silverback } from '../../helpers/drupal';
import { cmsUrl } from '../../helpers/url';

test.beforeAll(async () => {
  silverback('-y snapshot-restore tests-initial');
});
test.afterAll(async () => {
  silverback('-y snapshot-restore tests-initial');
});

test.use({ storageState: '.auth/admin.json' });

test('test LinkProcessor', async ({ page }) => {
  test.setTimeout(60_000);

  const selectFirstAutocompleteResult = async () =>
    page.click('.block-editor-link-control__search-results-wrapper button');

  const getNodeId = async () => {
    const editLink = await page.waitForSelector(
      '.tabs--primary :text-is("Edit")',
    );
    const href = await editLink.getAttribute('href');
    return href!.match(/\/node\/([0-9]+)/)![1];
  };

  const assertLinkHref = async (selector: string, expectedHref: string) => {
    const link = await page.waitForSelector(selector);
    const href = await link.getAttribute('href');
    expect(href).toEqual(expectedHref);
  };

  // Create a target page.

  await page.goto(cmsUrl('/en/node/add/page'));
  await page.getByRole('textbox', { name: 'Title *' }).fill('Target page');
  await page.getByLabel('Save as').selectOption('published');
  await page.click(':text-is("URL alias")');
  await page
    .getByRole('checkbox', { name: 'Generate automatic URL alias' })
    .uncheck();
  await page.fill('label:text-is("URL alias")', '/target-page');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Save', { exact: true }).click();

  const targetNodeId = await getNodeId();
  const targetNodeUuid = drush(
    `eval 'echo \\Drupal\\node\\Entity\\Node::load(${targetNodeId})->uuid();'`,
  );

  await page.click('.tabs--primary :text-is("Translate")');
  await page.click(':text-is("Add"):right-of(:text-is("German"))');
  await page.fill('input[name="path[0][alias]"]', '/target-page-de');
  await page.click('input[id="edit-submit"]');

  // Create a page.

  await page.goto(cmsUrl('/en/node/add/page'));
  await page
    .getByRole('textbox', { name: 'Title *' })
    .fill('Test link processing');
  await page.getByLabel('Save as').selectOption('published');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.type('[data-type="core/paragraph"]', 'link');
  await page.press(
    '[data-type="core/paragraph"]',
    platform() === 'darwin' ? 'Meta+a' : 'Control+a',
  );
  await page.click('[aria-label="Link"]');
  await page.fill('[placeholder="Search or type url"]', 'target page');
  await selectFirstAutocompleteResult();
  await page.press('[data-type="core/paragraph"]', 'Enter');

  await page.click('button[aria-label="Toggle block inserter"]');
  await page.locator('button').filter({ hasText: 'CTA' }).click();
  await page.getByLabel('Link text').click();
  await page.getByLabel('Link text').fill('CTA title');
  await page.getByLabel('Settings', { exact: true }).click();
  await page.getByPlaceholder('Search or type url').fill('target page');
  await selectFirstAutocompleteResult();

  await page.click('button[aria-label="Toggle block inserter"]');
  await page.click('.block-editor-inserter__menu :text-is("Media")');
  await page.click('button:text-is("Media Library") >> nth=-1');
  await page
    .locator('input[name^="media_library_select_form"]')
    .first()
    .check();
  await page.click('button:text-is("Insert")');
  await page.fill('[aria-label="Write caption…"]', 'link');
  await page.keyboard.press(
    platform() === 'darwin'
      ? 'Meta+a'
      : // On Ubuntu, "Control+a" selects all Gutenberg blocks 🤯
        'Shift+Control+ArrowLeft',
  );
  await page.click('[aria-label="Link"]');
  await page.fill('[placeholder="Search or type url"]', 'target page');
  await selectFirstAutocompleteResult();

  await page.getByText('Save', { exact: true }).click();

  const nodeId = await getNodeId();

  // Ensure that internal URLs are stored in Drupal database.

  const result = drush(
    `eval 'echo json_encode((new \\Drupal\\gutenberg\\Parser\\BlockParser())->parse(\\Drupal\\node\\Entity\\Node::load(${nodeId})->body->value));'`,
  );
  const contentBlock = JSON.parse(result).find(
    (block: { blockName: string }) => block.blockName === 'custom/content',
  );
  console.log(contentBlock);

  expect(contentBlock).toHaveProperty('innerBlocks.0');
  const paragraphBlock = contentBlock.innerBlocks[0];
  expect(paragraphBlock.blockName).toEqual('core/paragraph');
  expect(paragraphBlock.innerHTML).toContain(`href="/node/${targetNodeUuid}"`);
  expect(paragraphBlock.innerContent[0]).toContain(
    `href="/node/${targetNodeUuid}"`,
  );

  expect(contentBlock).toHaveProperty('innerBlocks.1');
  const ctaBlock = contentBlock.innerBlocks[1];
  expect(ctaBlock.blockName).toEqual('custom/cta');
  expect(ctaBlock.attrs.url).toEqual(`/node/${targetNodeUuid}`);

  expect(contentBlock).toHaveProperty('innerBlocks.2');
  const mediaBlock = contentBlock.innerBlocks[2];
  expect(mediaBlock.blockName).toEqual('drupalmedia/drupal-media-entity');
  expect(mediaBlock.attrs.caption).toContain(`href="/node/${targetNodeUuid}"`);

  // Ensure that URL aliases are used in the editor.

  await page.goto(cmsUrl(`/en/node/${nodeId}/edit`));
  await assertLinkHref('[data-type="core/paragraph"] a', '/en/target-page');
  await page.getByLabel('Link text').click(); // CTA
  await assertLinkHref(
    '.block-editor-link-control__search-item-header a',
    '/en/target-page',
  );
  await assertLinkHref(
    '[data-type="drupalmedia/drupal-media-entity"] a',
    '/en/target-page',
  );

  // Ensure that URL aliases are used on the frontend.

  await page.goto(cmsUrl(`/en/node/${nodeId}`));
  const previewFrame = await (
    await page.$('iframe.external-preview-entity__iframe')
  )?.contentFrame();
  if (!previewFrame) {
    throw new Error('Cannot get iframe content frame.');
  }
  await previewFrame.waitForSelector('#main-content a');
  const links = await previewFrame.$$('#main-content a');
  expect(links).toHaveLength(3);
  for (const link of links) {
    expect(await link.getAttribute('href')).toEqual('/en/target-page');
  }

  // Ensure that URLs are correct when translating to German.

  await page.goto(cmsUrl(`/en/node/${nodeId}/translations`));
  await page.click(':text-is("Add"):right-of(:text-is("German"))');
  await assertLinkHref('[data-type="core/paragraph"] a', `/de/target-page-de`);
  await page.getByLabel('Link text').click(); // CTA
  await assertLinkHref(
    '.block-editor-link-control__search-item-header a',
    '/de/target-page-de',
  );
  await assertLinkHref(
    '[data-type="drupalmedia/drupal-media-entity"] a',
    '/de/target-page-de',
  );
});
