import { ImageSettings } from '@amazeelabs/image';
import { IntlProvider } from '@amazeelabs/react-intl';
import { FrameQuery, Locale, Operation } from '@custom/schema';
import React, { ComponentProps, PropsWithChildren } from 'react';

import translationSources from '../../../build/translatables.json';
import { useLocale } from '../../utils/locale';

function filterByLocale(locale: Locale) {
  return (str: Exclude<FrameQuery['stringTranslations'], undefined>[number]) =>
    str.language === locale;
}

function translationsMap(
  translatables: Required<FrameQuery>['stringTranslations'],
) {
  return Object.fromEntries(
    translatables
      .filter((tr) => tr.translation)
      .map((tr) => [tr.source, tr.translation]),
  );
}

export function Providers({
  children,
  ...imageSettings
}: PropsWithChildren<ComponentProps<typeof ImageSettings>>) {
  const locale = useLocale();
  return (
    <Operation id={FrameQuery} all={true}>
      {(result) => {
        if (result.state === 'success') {
          const rawTranslations = result.data
            .map((res) => res.stringTranslations || [])
            .reduce((acc, val) => [...acc, ...val], []);
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
            <ImageSettings {...imageSettings}>
              <IntlProvider locale={locale} messages={messages}>
                {children}
              </IntlProvider>
            </ImageSettings>
          );
        }
      }}
    </Operation>
  );
}
