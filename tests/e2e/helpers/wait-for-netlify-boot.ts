import { type Page } from '@playwright/test';

import { websiteUrl } from './url';

const attemptDelay = 1000 * 5;
export const netlifyBootTimeout = 1000 * 60 * 2;

/**
 * Ensures "netlify dev" is running.
 */
export async function waitForNetlifyBoot(page: Page) {
  // Sometimes "netlify dev" fail to start fast. The port check reports it's
  // working, yet the first page load takes a long time - Netlify downloads
  // something at a very slow speed. Nothing really works until this is done.
  // This might fail tests. So we try to load the website frontpage first.
  let success = false;
  const timeoutId = setTimeout(() => {
    throw new Error(`"netlify dev" failed to start in ${netlifyBootTimeout}ms`);
  }, netlifyBootTimeout);
  while (!success) {
    try {
      await page.goto(websiteUrl('/'), { timeout: attemptDelay });
      clearTimeout(timeoutId);
      success = true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-empty
    } catch (e) {}
  }
}
