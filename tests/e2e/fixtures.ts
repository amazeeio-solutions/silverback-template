import { type Page, test as base } from '@playwright/test';

type Fixtures = {
  pageAdmin: Page;
};

export const test = base.extend<Fixtures>({
  pageAdmin: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: '.auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
