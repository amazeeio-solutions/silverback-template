import { Locale, useLocation } from '@custom/schema';

import { useLocaleContext } from '../contexts';

const locales = Object.values(Locale);
export const defaultLocale: Locale = 'en';

export function isLocale(input: unknown): input is Locale {
  return locales.includes(input as Locale);
}

/**
 * Extract the current locale from context or path prefix as fallback.
 */
export function useLocale() {
  const { locale } = useLocaleContext();
  
  // Use context locale if available
  if (locale.currentLocale) {
    return locale.currentLocale;
  }
  
  // Fallback to path-based detection for backward compatibility
  try {
    const [{ pathname, searchParams }] = useLocation();
    const prefix = pathname.split('/')[1];
    // For the preview route, we should get the language code from the "lang"
    // parameter.
    const langcode = prefix === '__preview' ? searchParams.get('lang') : prefix;
    return isLocale(langcode) ? langcode : defaultLocale;
  } catch {
    // If useLocation fails (SSR, etc.), return default locale
    return defaultLocale;
  }
}

type Localized = { locale: Locale };

/**
 * Select the most appropriate of localization from a list of options.
 */
export function useLocalized<T extends Localized>(
  options?: Array<T | undefined>,
): T | undefined {
  const locale = useLocale();
  return (
    options?.filter((option) => option?.locale === locale).pop() ||
    options?.filter((option) => option?.locale === defaultLocale).pop()
  );
}
