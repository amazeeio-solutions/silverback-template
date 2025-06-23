'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { Locale } from '@custom/schema';

export interface LocaleState {
  currentLocale: Locale;
  availableLocales: Locale[];
  translations: Record<Locale, string>;
}

interface LocaleContextType {
  localeState: LocaleState;
  setLocaleState: (state: LocaleState) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ 
  children, 
  initialState 
}: { 
  children: ReactNode; 
  initialState: LocaleState 
}) {
  const [localeState, setLocaleState] = React.useState<LocaleState>(initialState);

  return (
    <LocaleContext.Provider value={{ localeState, setLocaleState }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocaleContext must be used within a LocaleProvider');
  }
  return context;
}