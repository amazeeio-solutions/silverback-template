'use client';
import React, { createContext, useContext, ReactNode } from 'react';

export interface NavigationState {
  currentPageId?: string;
  currentPath?: string;
}

interface NavigationContextType {
  navigationState: NavigationState;
  setNavigationState: (state: NavigationState) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ 
  children, 
  initialState = {} 
}: { 
  children: ReactNode; 
  initialState?: NavigationState 
}) {
  const [navigationState, setNavigationState] = React.useState<NavigationState>(initialState);

  return (
    <NavigationContext.Provider value={{ navigationState, setNavigationState }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}