import React, { PropsWithChildren } from 'react';

import { TranslationsProvider } from '../../utils/translations';
import { PageTransitionWrapper } from '../Molecules/PageTransition';
import { Footer } from '../Organisms/Footer';
import { Header } from '../Organisms/Header';

export function Frame({ children }: PropsWithChildren) {
  return (
    <TranslationsProvider>
      <link rel="icon" href="/images/favicon.ico" type="image/x-icon" />
      <Header />
      <PageTransitionWrapper>{children}</PageTransitionWrapper>
      <Footer />
    </TranslationsProvider>
  );
}
