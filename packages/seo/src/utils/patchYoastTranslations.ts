import { App } from 'yoastseo';

/**
 * Initializes Yoast's translation system using the App constructor
 * we need this in order to access the bundle i18n instance
 */
export function initializeYoastTranslations(locale: string, translations: unknown) {
  try {
    // Create a dummy app instance to register wordpress-seo translations
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const app = new App({
      callbacks: {
        getData: () => ({ text: 'dummy content' }),
      },
      targets: {
        snippet: 'yoast-seo-dummy-target',
      },
      translations: {
        domain: 'wordpress-seo',
         
        locale_data: {
          'wordpress-seo': translations,
        },
      },
    });
    return true;
  } catch (error) {
    console.error('[DEBUG] Failed to initialize Yoast translations:', error);
    return false;
  }
}
