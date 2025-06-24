import type { Locale, Url } from '@custom/schema';
import React, {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';

export type LocaleContextValue = {
  currentLocale: Locale;
  availableLocales: Locale[];
  translations: Record<Locale, Url>;
  defaultLocale: Locale;
  updateLocale: (
    locale: Partial<Omit<LocaleContextValue, 'updateLocale'>>,
  ) => void;
};

export const LocaleContext = createContext<LocaleContextValue>({
  currentLocale: 'en',
  availableLocales: ['en'],
  translations: {} as Record<Locale, Url>,
  defaultLocale: 'en',
  updateLocale: () => {},
});

export function LocaleProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<Omit<LocaleContextValue, 'updateLocale'>>({
    currentLocale: 'en',
    availableLocales: ['en'],
    translations: {} as Record<Locale, Url>,
    defaultLocale: 'en',
  });

  const updateLocale = (
    updates: Partial<Omit<LocaleContextValue, 'updateLocale'>>,
  ) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const value: LocaleContextValue = {
    ...state,
    updateLocale,
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
