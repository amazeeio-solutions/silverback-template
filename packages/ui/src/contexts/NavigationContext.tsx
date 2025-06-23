'use client';
import React, { createContext, useContext, ReactNode } from 'react';

interface NavigationState {
  currentPageId?: string;
  currentPath?: string;
  currentLocale?: string;
}

interface NavigationContextType {
  navigation: NavigationState;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

interface NavigationProviderProps {
  children: ReactNode;
  currentPageId?: string;
  currentPath?: string;
  currentLocale?: string;
}

export function NavigationProvider({
  children,
  currentPageId,
  currentPath,
  currentLocale,
}: NavigationProviderProps) {
  const value = {
    navigation: {
      currentPageId,
      currentPath,
      currentLocale,
    },
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    // Graceful fallback for backward compatibility
    return {
      navigation: {
        currentPageId: undefined,
        currentPath: undefined,
        currentLocale: undefined,
      },
    };
  }
  return context;
}