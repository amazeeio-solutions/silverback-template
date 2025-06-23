'use client';
import { Locale } from '@custom/schema';
import React, { createContext, useContext, ReactNode } from 'react';

interface LocaleState {
  currentLocale: Locale;
  availableLocales: Locale[];
  translations: Record<string, string>;
}

interface LocaleContextType {
  locale: LocaleState;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
  currentLocale: Locale;
  availableLocales?: Locale[];
  translations?: Record<string, string>;
}

export function LocaleProvider({
  children,
  currentLocale,
  availableLocales = [],
  translations = {},
}: LocaleProviderProps) {
  const value = {
    locale: {
      currentLocale,
      availableLocales,
      translations,
    },
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    // Graceful fallback for backward compatibility
    return {
      locale: {
        currentLocale: 'en' as Locale,
        availableLocales: [],
        translations: {},
      },
    };
  }
  return context;
}