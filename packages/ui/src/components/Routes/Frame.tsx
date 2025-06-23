import { IntlProvider } from '@amazeelabs/react-intl';
import { FrameQuery, Locale, Operation, useLocation } from '@custom/schema';
import React, { PropsWithChildren } from 'react';

import translationSources from '../../../build/translatables.json';
import { FrameProvider } from '../../contexts';
import { useLocale } from '../../utils/locale';
import { useTranslations } from '../../utils/translations';
import { TranslationsProvider } from '../../utils/translations';
import { PageTransitionWrapper } from '../Molecules/PageTransition';
import { Footer } from '../Organisms/Footer';
import { Header } from '../Organisms/Header';

function filterByLocale(locale: Locale) {
  return (str: Exclude<FrameQuery['stringTranslations'], undefined>[number]) =>
    str.language === locale;
}

function translationsMap(translatables: FrameQuery['stringTranslations']) {
  return Object.fromEntries(
    [
      // Make sure that Drupal translations have higher precedence.
      ...(translatables?.filter(
        (tr) => tr.__typename === 'DecapTranslatableString',
      ) || []),
      ...(translatables?.filter(
        (tr) => tr.__typename === 'DrupalTranslatableString',
      ) || []),
    ]
      .filter((tr) => tr.translation)
      .map((tr) => [tr.source, tr.translation]),
  );
}

interface FrameProps extends PropsWithChildren {
  currentPageId?: string;
  currentPath?: string;
  availableLocales?: Locale[];
  pageTranslations?: Record<string, string>;
}

export function Frame({ 
  children, 
  currentPageId, 
  currentPath, 
  availableLocales,
  pageTranslations 
}: FrameProps) {
  const locale = useLocale();
  const pageTranslationsFromContext = useTranslations();
  
  // Auto-extract navigation state if not provided as props
  let navigationCurrentPath = currentPath;
  try {
    if (!navigationCurrentPath) {
      const [location] = useLocation();
      navigationCurrentPath = location.pathname;
    }
  } catch {
    // useLocation failed (SSR, etc.), no fallback needed
  }
  return (
    <Operation id={FrameQuery}>
      {(result) => {
        if (result.state === 'success') {
          const rawTranslations = result.data.stringTranslations || [];
          const translations = {
            ...translationsMap(
              rawTranslations?.filter(filterByLocale('en')) || [],
            ),
            ...translationsMap(
              rawTranslations?.filter(filterByLocale(locale)) || [],
            ),
          };
          const messages = Object.fromEntries(
            Object.keys(translationSources).map((key) => [
              key,
              translations[
                translationSources[key as keyof typeof translationSources]
                  .defaultMessage
              ] ||
                translationSources[key as keyof typeof translationSources]
                  .defaultMessage,
            ]),
          );
          return (
            <IntlProvider locale={locale} messages={messages}>
              <TranslationsProvider>
                <FrameProvider
                  currentPageId={currentPageId}
                  currentPath={navigationCurrentPath}
                  currentLocale={locale}
                  availableLocales={availableLocales || Object.values(Locale)}
                  translations={pageTranslations || pageTranslationsFromContext}
                >
                  <Header />
                  <PageTransitionWrapper>{children}</PageTransitionWrapper>
                  <Footer />
                </FrameProvider>
              </TranslationsProvider>
            </IntlProvider>
          );
        }
      }}
    </Operation>
  );
}
