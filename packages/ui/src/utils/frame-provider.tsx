import React, { type PropsWithChildren } from 'react';

import { LocaleProvider } from './locale-context';
import { NavigationProvider } from './navigation-context';

export function FrameProvider({ children }: PropsWithChildren) {
  return (
    <NavigationProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </NavigationProvider>
  );
}
