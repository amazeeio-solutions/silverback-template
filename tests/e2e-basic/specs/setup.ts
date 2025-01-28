import { expect, test } from '@playwright/test';

const attemptDelay = 1000 * 5;
const netlifyBootTimeout = 1000 * 60 * 2;
const websiteBuildTimeout = 1000 * 60 * 2;

test.setTimeout(websiteBuildTimeout + netlifyBootTimeout + 10_000);

test('setup', async ({ page }) => {
  // Wait for Publisher to build the website.
  await page.goto('http://127.0.0.1:8000/___status');
  await expect(page.getByText('Status: Ready')).toBeVisible({
    timeout: websiteBuildTimeout,
  });

  // Wait for Netlify to boot.
  // When "netlify dev" starts, the port check reports it's working, yet the
  // first page load takes a long time - Netlify downloads Deno and packages
  // (sometimes at a very slow speed). Nothing really works until this is done.
  // This might fail tests. So we try to load the website frontpage first.
  let success = false;
  const timeoutId = setTimeout(() => {
    throw new Error(
      `"netlify dev" failed to start in ${netlifyBootTimeout}ms. Check /tmp/website.log for details.`,
    );
  }, netlifyBootTimeout);
  while (!success) {
    try {
      await page.goto('http://127.0.0.1:8000', { timeout: attemptDelay });
      clearTimeout(timeoutId);
      success = true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-empty
    } catch (e) {}
  }
});
