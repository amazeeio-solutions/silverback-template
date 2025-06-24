'use client';
import { Locale } from '@custom/schema';
import { PropsWithChildren, useEffect, useState } from 'react';

import { useLocaleContext } from './frame-contexts';
import { defaultLocale, isLocale } from './locale';

/**
 * Display contents only if the current locale matches the provided one.
 */
export function LanguageNegotiator({
  locale,
  children,
}: PropsWithChildren<{ locale: Locale }>) {
  const { currentLocale: contextLocale } = useLocaleContext();
  const [currentLocale, setCurrentLocale] = useState<Locale>(
    contextLocale || defaultLocale,
  );

  useEffect(() => {
    // Use context locale if available
    if (contextLocale) {
      setCurrentLocale(contextLocale);
      return;
    }

    // Fallback to path-based detection for backward compatibility
    if (typeof window !== 'undefined') {
      const prefix = window.location.pathname.split('/')[1];
      if (isLocale(prefix)) {
        setCurrentLocale(prefix);
      }
    }
  }, [contextLocale, setCurrentLocale]);

  return locale === currentLocale ? children : null;
}
