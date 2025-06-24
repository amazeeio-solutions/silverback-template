import { IntlProvider } from '@amazeelabs/react-intl';
import {
  FrameQuery,
  Locale,
  Operation,
  Url,
  useLocation,
} from '@custom/schema';
import React, { PropsWithChildren } from 'react';

import translationSources from '../../../build/translatables.json';
import { FrameProvider } from '../../utils/frame-provider';
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

export function Frame({ children }: PropsWithChildren) {
  const locale = useLocale();
  const [location] = useLocation();

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

          // Extract navigation data for context
          const mainNavigation =
            result.data.mainNavigation
              ?.filter((nav) => nav?.locale === locale)
              .pop()
              ?.items.filter(
                (item): item is NonNullable<typeof item> =>
                  item !== null && item !== undefined,
              ) || [];

          const footerNavigation =
            result.data.footerNavigation
              ?.filter((nav) => nav?.locale === locale)
              .pop()
              ?.items.filter(
                (item): item is NonNullable<typeof item> =>
                  item !== null && item !== undefined,
              ) || [];

          // Extract locale translations from website settings
          const localeTranslations =
            result.data.websiteSettings?.homePage?.translations?.reduce(
              (acc, translation) => {
                if (translation?.locale && translation?.path) {
                  acc[translation.locale] = translation.path;
                }
                return acc;
              },
              {} as Record<Locale, string>,
            ) || {};

          return (
            <IntlProvider locale={locale} messages={messages}>
              <FrameProvider
                // Navigation context
                mainNavigation={mainNavigation}
                footerNavigation={footerNavigation}
                currentPath={location.pathname}
                currentPageId={location.pathname}
                // Locale context
                currentLocale={locale}
                availableLocales={Object.keys(localeTranslations) as Locale[]}
                translations={localeTranslations as Record<Locale, Url>}
                defaultLocale={'en'}
              >
                <TranslationsProvider>
                  <Header />
                  <PageTransitionWrapper>{children}</PageTransitionWrapper>
                  <Footer />
                </TranslationsProvider>
              </FrameProvider>
            </IntlProvider>
          );
        }
      }}
    </Operation>
  );
}
