import type { NavigationItemFragment } from '@custom/schema';
import React, {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';

export type NavigationContextValue = {
  mainNavigation: NavigationItemFragment[] | undefined;
  footerNavigation: NavigationItemFragment[] | undefined;
  currentPath: string;
  currentPageId?: string;
  updateNavigation: (
    navigation: Partial<Omit<NavigationContextValue, 'updateNavigation'>>,
  ) => void;
};

export const NavigationContext = createContext<NavigationContextValue>({
  mainNavigation: undefined,
  footerNavigation: undefined,
  currentPath: '',
  currentPageId: undefined,
  updateNavigation: () => {},
});

export function NavigationProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<
    Omit<NavigationContextValue, 'updateNavigation'>
  >({
    mainNavigation: undefined,
    footerNavigation: undefined,
    currentPath: '',
    currentPageId: undefined,
  });

  const updateNavigation = (
    updates: Partial<Omit<NavigationContextValue, 'updateNavigation'>>,
  ) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const value: NavigationContextValue = {
    ...state,
    updateNavigation,
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
