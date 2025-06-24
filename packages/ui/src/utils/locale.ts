import { Locale, useLocation } from '@custom/schema';

import { useLocaleContext } from './frame-contexts';

const locales = Object.values(Locale);
export const defaultLocale: Locale = 'en';

export function isLocale(input: unknown): input is Locale {
  return locales.includes(input as Locale);
}

/**
 * Extract the current locale from the path prefix or context.
 * Prioritizes LocaleContext if available, falls back to path-based detection.
 */
export function useLocale() {
  // Always call hooks unconditionally
  const { currentLocale } = useLocaleContext();
  const [{ pathname, searchParams }] = useLocation();

  // Try to get locale from context first
  if (currentLocale && isLocale(currentLocale)) {
    return currentLocale;
  }

  // Fallback to original path-based locale detection
  const prefix = pathname.split('/')[1];
  // For the preview route, we should get the language code from the "lang"
  // parameter.
  const langcode = prefix === '__preview' ? searchParams.get('lang') : prefix;
  return isLocale(langcode) ? langcode : defaultLocale;
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
