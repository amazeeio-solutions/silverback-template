import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';

import type { NavigationItemFragment } from '@custom/schema';

export type NavigationContextValue = {
  mainNavigation: NavigationItemFragment[] | undefined;
  footerNavigation: NavigationItemFragment[] | undefined;
  currentPath: string;
  currentPageId?: string;
};

export const NavigationContext = createContext<NavigationContextValue>({
  mainNavigation: undefined,
  footerNavigation: undefined,
  currentPath: '',
  currentPageId: undefined,
});

export type NavigationProviderProps = PropsWithChildren<{
  mainNavigation?: NavigationItemFragment[];
  footerNavigation?: NavigationItemFragment[];
  currentPath?: string;
  currentPageId?: string;
}>;

export function NavigationProvider({
  children,
  mainNavigation,
  footerNavigation,
  currentPath = '',
  currentPageId,
}: NavigationProviderProps) {
  const value: NavigationContextValue = {
    mainNavigation,
    footerNavigation,
    currentPath,
    currentPageId,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}

export function useCurrentPath() {
  const { currentPath } = useContext(NavigationContext);
  return currentPath;
}

export function useCurrentPageId() {
  const { currentPageId } = useContext(NavigationContext);
  return currentPageId;
}
