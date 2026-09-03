import { expect, type Frame, type PlaywrightTestArgs } from '@playwright/test';

import { test } from '../../fixtures';
import { drush, resetDrupal } from '../../helpers/drupal';
import { cmsUrl, websiteUrl } from '../../helpers/url';

test.beforeEach(() => {
  resetDrupal();
});
test.afterAll(() => {
  resetDrupal();
});

test('the unsupported confirmation type is replaced with the default value', async ({
  pageAdmin: page,
}) => {
  const result = drush(
    `cget webform.webform.for_testing_confirmation_options settings.confirmation_type --include-overridden --format=json`,
  );
  const confirmationType = Object.values(JSON.parse(result))[0];
  expect(confirmationType).toEqual('page');

  await page.goto(
    cmsUrl(
      `/en/admin/structure/webform/manage/for_testing_confirmation_options/settings/confirmation`,
    ),
  );
  await expect(
    page.locator('input[name="confirmation_type"][value="inline"]'),
  ).toBeChecked();
});

test('only allowed confirmation types are listed in the webform config', async ({
  pageAdmin: page,
}) => {
  const getOptions = async () => {
    await page.goto(
      cmsUrl(
        `/en/admin/structure/webform/manage/for_testing_confirmation_options/settings/confirmation`,
      ),
    );
    return Promise.all(
      (await page.$$('input[name="confirmation_type"]')).map((option) =>
        option.getAttribute('value'),
      ),
    );
  };

  // Case: limit_webform_confirmation_options is FALSE.
  // Can't use "drush cset" due to https://github.com/drush-ops/drush/issues/3793
  // TODO: asd
  drush(
    `eval '\\Drupal::configFactory()->getEditable("silverback_iframe.settings")->set("limit_webform_confirmation_options", FALSE)->save();'`,
  );
  expect(await getOptions()).not.toEqual(confirmationOptions);

  // Case: limit_webform_confirmation_options is TRUE.
  drush(
    `-y cset silverback_iframe.settings limit_webform_confirmation_options true --input-format=yaml`,
  );
  expect(await getOptions()).toEqual(confirmationOptions);

  // Case: limit_webform_confirmation_options is missing.
  drush(`-y cdel silverback_iframe.settings`);
  expect(await getOptions()).toEqual(confirmationOptions);
});

test('confirmation type: inline', async ({ page, pageAdmin }) => {
  await setConfirmationOption(pageAdmin, 'inline', { addMessage: true });
  await submitWebform(page);

  await expect(page.getByText('Test message with some text.')).toBeVisible();
  expect(await page.$('iframe')).toBeNull();
});

test('confirmation type: message', async ({ page, pageAdmin }) => {
  await setConfirmationOption(pageAdmin, 'message', { addMessage: true });
  await submitWebform(page);

  await expect(page.getByText('Test message with some text.')).toBeVisible();
  expect(await page.$('iframe')).not.toBeNull();
});

test('confirmation type: url', async ({ page, pageAdmin }) => {
  await setConfirmationOption(pageAdmin, 'url', {
    setRedirectUrl: '/en/article/with-everything',
  });
  await submitWebform(page);
  await page.waitForURL(/\/en\/article\/with-everything/);

  // It's important to ensure that we are redirected to Gatsby, not to Drupal.
  expect(page.url()).toContain(websiteUrl(''));
});

test('confirmation type: url_message', async ({ page, pageAdmin }) => {
  await setConfirmationOption(pageAdmin, 'url_message', {
    addMessage: true,
    setRedirectUrl: '/en/article/other',
  });
  await submitWebform(page);
  await page.waitForURL(/\/en\/article\/other/);

  await expect(page.getByText('Test message with some text.')).toBeVisible();
  // It's important to ensure that we are redirected to Gatsby, not to Drupal.
  expect(page.url()).toContain(websiteUrl(''));
});

test('confirmation type: none', async ({ page, pageAdmin }) => {
  await setConfirmationOption(pageAdmin, 'none');
  await submitWebform(page);

  await expect(page.locator('iframe')).toHaveCount(1);
  expect(
    (await page.locator('.silverback-iframe-messages').textContent())?.trim(),
  ).toBeFalsy();
});

test('confirmation type: message with fallback', async ({
  page,
  pageAdmin,
}) => {
  await setConfirmationOption(pageAdmin, 'message', {
    addMessage:
      '<span class="hidden js-iframe-parent-message">The contact form has been submitted</span><div>You will be redirected back to the <a class="js-iframe-parent-redirect" href="/webform/success">form</a>.</div>',
  });
  await submitWebform(page);

  await expect(
    page.getByText('The contact form has been submitted'),
  ).toBeVisible();
  expect(page.url()).toBe(
    // It's important to ensure that we are redirected to Gatsby, not to
    // Drupal.
    websiteUrl('/en/webform/success'),
  );
});

test('links open in parent frame, using parent frame base url, without iframe=true param in the url', async ({
  page,
}) => {
  await page.goto(websiteUrl('/en/test-webform-confirmation-options'));
  const iframe = await getIframe(page);
  await iframe.waitForSelector('body.silverback-iframe-links-processed');
  await iframe.click(
    '.form-item-optional-text-field .webform-element-description a',
  );
  expect(page.url()).toBe(websiteUrl('/en/article/with-everything'));
});

test('conditionally shown links open in parent frame', async ({ page }) => {
  await page.goto(websiteUrl('/en/test-webform-confirmation-options'));
  const iframe = await getIframe(page);
  await iframe.waitForSelector('body.silverback-iframe-links-processed');
  await iframe.selectOption('select[name="trigger_select"]', 'show_link');
  await iframe.waitForSelector('.form-item-conditional-markup a', {
    state: 'visible',
  });
  await iframe.click('.form-item-conditional-markup a');
  expect(page.url()).toBe(websiteUrl('/en/article/with-everything'));
});

const confirmationOptions = [
  'inline',
  'message',
  'url',
  'url_message',
  'none',
] as const;
type ConfirmationOption = (typeof confirmationOptions)[number];

const setConfirmationOption = async (
  page: PlaywrightTestArgs['page'],
  confirmationOption: ConfirmationOption,
  options?: {
    addMessage?: boolean | string;
    setRedirectUrl?: string;
  },
) => {
  await page.goto(
    cmsUrl(
      `/en/admin/structure/webform/manage/for_testing_confirmation_options/settings/confirmation`,
    ),
  );

  await page.click(
    `input[name="confirmation_type"][value="${confirmationOption}"]`,
  );

  if (options?.addMessage === true) {
    await page
      .getByRole('textbox', { name: 'Confirmation message' })
      .fill('Test message with some text.');
  }
  if (typeof options?.addMessage === 'string') {
    await page
      .getByRole('textbox', { name: 'Confirmation message' })
      .fill(options.addMessage);
  }

  if (options?.setRedirectUrl) {
    await page.fill('input[name=confirmation_url]', options.setRedirectUrl);
  }

  await page.getByRole('button', { name: 'Save', exact: true }).click();
};

const submitWebform = async (page: PlaywrightTestArgs['page']) => {
  await page.goto(websiteUrl('/en/test-webform-confirmation-options'));
  const iframe = await getIframe(page);
  await iframe.getByRole('button', { name: 'Submit' }).click();
};

export const getIframe = async (
  page: PlaywrightTestArgs['page'],
): Promise<Frame> => {
  await page.waitForSelector('iframe');
  const iframe = await page.$('iframe');
  if (!iframe) {
    throw new Error('Cannot get iframe.');
  }
  const frame = await iframe.contentFrame();
  if (!frame) {
    throw new Error("Cannot get iframe's content frame.");
  }
  return frame;
};
