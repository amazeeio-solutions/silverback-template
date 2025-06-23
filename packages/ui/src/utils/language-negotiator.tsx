'use client';
import { Locale } from '@custom/schema';
import { PropsWithChildren } from 'react';

import { useLocaleContext } from '../contexts/FrameProvider';
import { defaultLocale } from './locale';

/**
 * Display contents only if the current locale matches the provided one.
 */
export function LanguageNegotiator({
  locale,
  children,
}: PropsWithChildren<{ locale: Locale }>) {
  // Get current locale from context, fallback to default
  let currentLocale: Locale = defaultLocale;
  
  try {
    const { localeState } = useLocaleContext();
    currentLocale = localeState.currentLocale;
  } catch {
    // Context not available - fallback to default locale
    currentLocale = defaultLocale;
  }
  
  return locale === currentLocale ? children : null;
}
