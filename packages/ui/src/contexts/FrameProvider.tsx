'use client';
import { Locale } from '@custom/schema';
import React, { ReactNode } from 'react';

import { NavigationProvider } from './NavigationContext';
import { LocaleProvider } from './LocaleContext';

interface FrameProviderProps {
  children: ReactNode;
  currentPageId?: string;
  currentPath?: string;
  currentLocale: Locale;
  availableLocales?: Locale[];
  translations?: Record<string, string>;
}

export function FrameProvider({
  children,
  currentPageId,
  currentPath,
  currentLocale,
  availableLocales,
  translations,
}: FrameProviderProps) {
  return (
    <NavigationProvider
      currentPageId={currentPageId}
      currentPath={currentPath}
      currentLocale={currentLocale}
    >
      <LocaleProvider
        currentLocale={currentLocale}
        availableLocales={availableLocales}
        translations={translations}
      >
        {children}
      </LocaleProvider>
    </NavigationProvider>
  );
}