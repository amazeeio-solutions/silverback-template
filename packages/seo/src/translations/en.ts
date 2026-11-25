import type { YoastTranslations } from '../types/translations';

const translations: YoastTranslations = {
  '': {
    domain: 'wordpress-seo',
    lang: 'en_US',
    plural_forms: 'nplurals=2; plural=(n != 1);',
  },
  // We just use the default translations for EN
} as const;

export default translations;
