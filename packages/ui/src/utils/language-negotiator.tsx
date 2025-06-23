'use client';
import { Locale } from '@custom/schema';
import { PropsWithChildren, useEffect, useState } from 'react';

import { useLocaleContext } from '../contexts';
import { defaultLocale, isLocale } from './locale';

/**
 * Display contents only if the current locale matches the provided one.
 */
export function LanguageNegotiator({
  locale,
  children,
}: PropsWithChildren<{ locale: Locale }>) {
  const { locale: localeContext } = useLocaleContext();
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);
  
  useEffect(() => {
    // Use context locale if available
    if (localeContext.currentLocale) {
      setCurrentLocale(localeContext.currentLocale);
      return;
    }
    
    // Fallback to path-based detection for backward compatibility
    if (typeof window !== 'undefined') {
      const prefix = window.location.pathname.split('/')[1];
      if (isLocale(prefix)) {
        setCurrentLocale(prefix);
      }
    }
  }, [localeContext.currentLocale]);
  
  return locale === currentLocale ? children : null;
}
