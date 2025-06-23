import { Locale } from '@custom/schema';

const locales = Object.values(Locale);
export const defaultLocale: Locale = 'en';

export function isLocale(input: unknown): input is Locale {
  return locales.includes(input as Locale);
}

/**
 * Extract the current locale. 
 * This hook should be replaced with useLocaleContext for modern implementations.
 * This version provides backward compatibility and should receive locale as prop.
 */
export function useLocale(locale?: Locale): Locale {
  // If locale is provided as prop, use it
  if (locale && isLocale(locale)) {
    return locale;
  }
  
  // Try to use context if available
  try {
    // Dynamic import to avoid circular dependency issues
    const { useLocaleContext } = require('../contexts/FrameProvider');
    const { localeState } = useLocaleContext();
    return localeState.currentLocale;
  } catch {
    // Fallback to default locale when context is not available
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
