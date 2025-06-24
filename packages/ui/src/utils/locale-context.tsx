import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';

import type { Locale, Url } from '@custom/schema';

export type LocaleContextValue = {
  currentLocale: Locale;
  availableLocales: Locale[];
  translations: Record<Locale, Url>;
  defaultLocale: Locale;
};

export const LocaleContext = createContext<LocaleContextValue>({
  currentLocale: 'en',
  availableLocales: ['en'],
  translations: {} as Record<Locale, Url>,
  defaultLocale: 'en',
});

export type LocaleProviderProps = PropsWithChildren<{
  currentLocale?: Locale;
  availableLocales?: Locale[];
  translations?: Record<Locale, Url>;
  defaultLocale?: Locale;
}>;

export function LocaleProvider({
  children,
  currentLocale = 'en',
  availableLocales = ['en'],
  translations = {} as Record<Locale, Url>,
  defaultLocale = 'en',
}: LocaleProviderProps) {
  const value: LocaleContextValue = {
    currentLocale,
    availableLocales,
    translations,
    defaultLocale,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  return useContext(LocaleContext);
}

export function useCurrentLocale() {
  const { currentLocale } = useContext(LocaleContext);
  return currentLocale;
}

export function useAvailableLocales() {
  const { availableLocales } = useContext(LocaleContext);
  return availableLocales;
}

export function useTranslations() {
  const { translations } = useContext(LocaleContext);
  return translations;
}
