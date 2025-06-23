import { IntlProvider } from '@amazeelabs/react-intl';
import { FrameQuery, Locale, Operation } from '@custom/schema';
import React, { PropsWithChildren } from 'react';

import translationSources from '../../../build/translatables.json';
import { FrameProvider, NavigationState, LocaleState } from '../../contexts/FrameProvider';
import { useLocale } from '../../utils/locale';
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

export interface FrameProps extends PropsWithChildren {
  // Navigation and locale state for frame context
  navigationState?: NavigationState;
  localeState?: LocaleState;
  // Language message props for PageTransition
  languageMessageProps?: {
    contentLanguageNotAvailable?: boolean;
    requestedLanguage?: string;
  };
}

export function Frame({ 
  children, 
  navigationState, 
  localeState, 
  languageMessageProps 
}: FrameProps) {
  const locale = useLocale();
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
          // Build locale state from available data
          const defaultLocaleState: LocaleState = {
            currentLocale: locale,
            availableLocales: Object.values(Locale),
            translations: {}
          };

          // Use provided locale state or build from current data
          const finalLocaleState = localeState || defaultLocaleState;

          return (
            <IntlProvider locale={locale} messages={messages}>
              <TranslationsProvider>
                <FrameProvider 
                  navigationState={navigationState} 
                  localeState={finalLocaleState}
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
