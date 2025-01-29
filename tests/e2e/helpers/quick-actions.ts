import { type Page } from '@playwright/test';

export enum SiteLanguage {
  English = 'English',
  Deutsch = 'Deutsch',
}

export class QuickActions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async changeLanguageTo(language: SiteLanguage): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // Open the language switcher.
    await this.page
      .locator("(//button[contains(@aria-haspopup, 'menu')])[1]")
      .click();
    // look for the language and click on it.
    await this.page.locator("//a[contains(text(),'" + language + "')]").click();
  }
}
