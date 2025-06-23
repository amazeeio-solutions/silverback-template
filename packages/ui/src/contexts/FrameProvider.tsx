'use client';
import React, { ReactNode } from 'react';
import { Locale } from '@custom/schema';

import { NavigationProvider, NavigationState } from './NavigationContext';
import { LocaleProvider, LocaleState } from './LocaleContext';

export interface FrameProviderProps {
  children: ReactNode;
  navigationState?: NavigationState;
  localeState: LocaleState;
}

export function FrameProvider({ 
  children, 
  navigationState = {}, 
  localeState 
}: FrameProviderProps) {
  return (
    <NavigationProvider initialState={navigationState}>
      <LocaleProvider initialState={localeState}>
        {children}
      </LocaleProvider>
    </NavigationProvider>
  );
}

// Export types and hooks for easier access
export type { NavigationState, LocaleState };
export { useNavigation } from './NavigationContext';
export { useLocaleContext } from './LocaleContext';