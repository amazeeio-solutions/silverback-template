import React, { type PropsWithChildren } from 'react';

import { LocaleProvider, type LocaleProviderProps } from './locale-context';
import {
  NavigationProvider,
  type NavigationProviderProps,
} from './navigation-context';

export type FrameProviderProps = PropsWithChildren<
  NavigationProviderProps & LocaleProviderProps
>;

export function FrameProvider({
  children,
  // Navigation props
  mainNavigation,
  footerNavigation,
  currentPath,
  currentPageId,
  // Locale props
  currentLocale,
  availableLocales,
  translations,
  defaultLocale,
}: FrameProviderProps) {
  return (
    <NavigationProvider
      mainNavigation={mainNavigation}
      footerNavigation={footerNavigation}
      currentPath={currentPath}
      currentPageId={currentPageId}
    >
      <LocaleProvider
        currentLocale={currentLocale}
        availableLocales={availableLocales}
        translations={translations}
        defaultLocale={defaultLocale}
      >
        {children}
      </LocaleProvider>
    </NavigationProvider>
  );
}
