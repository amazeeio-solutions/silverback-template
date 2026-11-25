export const seoConfig = {
  scoring: {
    thresholds: {
      good: 8,
      ok: 6,
    },
  },
  analysis: {
    maxTitleLength: 60,
    maxDescriptionLength: 160,
    minKeywordLength: 2,
  },
  localization: {
    defaultLocale: 'en_US',
    supportedLocales: ['en_US', 'de_DE'],
  },
};
