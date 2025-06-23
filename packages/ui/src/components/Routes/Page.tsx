import { useLocation, ViewPageQuery, Locale } from '@custom/schema';
import React from 'react';

import { NavigationState, LocaleState } from '../../contexts/FrameProvider';
import { isTruthy } from '../../utils/isTruthy';
import { isLocale, defaultLocale } from '../../utils/locale';
import { Translations } from '../../utils/translations';
import { withOperation } from '../../utils/with-operation';
import { PageDisplay } from '../Organisms/PageDisplay';

export const PageWithData = withOperation(ViewPageQuery, (result, pathname) => {
  // Initialize the language switcher with the options this page has.
  const translations = Object.fromEntries(
    result?.page?.translations
      ?.filter(isTruthy)
      .map((translation) => [translation.locale, translation.path]) || [],
  );
  
  // Extract locale from pathname
  const pathSegments = pathname.split('/');
  const localePrefix = pathSegments[1];
  const currentLocale = isLocale(localePrefix) ? localePrefix : defaultLocale;
  
  // Create navigation state
  const navigationState: NavigationState = {
    currentPath: pathname,
    currentPageId: result?.page?.id || undefined
  };
  
  // Create locale state  
  const localeState: LocaleState = {
    currentLocale,
    availableLocales: Object.keys(translations) as Locale[],
    translations
  };
  
  // Extract language message parameters from URL
  const urlParams = new URLSearchParams(pathname.includes('?') ? pathname.split('?')[1] : '');
  const languageMessageProps = {
    contentLanguageNotAvailable: urlParams.get('content_language_not_available') === 'true',
    requestedLanguage: urlParams.get('requested_language') || undefined
  };
  
  return result?.page ? (
    <Translations translations={translations}>
      <PageDisplay 
        {...result.page} 
        navigationState={navigationState}
        localeState={localeState}
        languageMessageProps={languageMessageProps}
      />
    </Translations>
  ) : null;
});

export function Page() {
  // Retrieve the current location and load the page
  // behind it.
  const [loc] = useLocation();
  return <PageWithData pathname={loc.pathname} />;
}
