'use client';
import {
  BlockConditionalFragment,
  PageFragment,
  FrameQuery,
  useLocation,
  Locale,
  Url,
} from '@custom/schema';
import { useIntl } from '@amazeelabs/react-intl';
import React, { useEffect } from 'react';

import { isTruthy } from '../../utils/isTruthy';
import { UnreachableCaseError } from '../../utils/unreachable-case-error';
import { useNavigation, useLocaleContext } from '../../utils/frame-contexts';
import { useOperation } from '../../utils/operation';
import { BreadCrumbs } from '../Molecules/Breadcrumbs';
import { ContentEditLink } from '../Molecules/ContentEditLink';
import { PageTransition } from '../Molecules/PageTransition';
import { BlockAccordion } from './PageContent/BlockAccordion';
import { BlockConditional } from './PageContent/BlockConditional';
import { BlockCta } from './PageContent/BlockCta';
import { BlockForm } from './PageContent/BlockForm';
import { BlockHorizontalSeparator } from './PageContent/BlockHorizontalSeparator';
import { BlockImageTeasers } from './PageContent/BlockImageTeasers';
import { BlockImageWithText } from './PageContent/BlockImageWithText';
import { BlockInfoGrid } from './PageContent/BlockInfoGrid';
import { BlockMarkup } from './PageContent/BlockMarkup';
import { BlockMedia } from './PageContent/BlockMedia';
import { BlockQuote } from './PageContent/BlockQuote';
import { BlockTeaserList } from './PageContent/BlockTeaserList';
import { PageHero } from './PageHero';

function extractLanguageMessageProps(): {
  contentLanguageNotAvailable?: boolean;
  requestedLanguage?: string;
} {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  const contentLanguageNotAvailable =
    urlParams.get('content_language_not_available') === 'true';
  const requestedLanguage = urlParams.get('requested_language');

  if (contentLanguageNotAvailable && requestedLanguage) {
    return { contentLanguageNotAvailable, requestedLanguage };
  }

  return {};
}

export function PageDisplay(page: PageFragment) {
  const languageMessageProps = extractLanguageMessageProps();
  const intl = useIntl();
  const [location] = useLocation();
  const { updateNavigation } = useNavigation();
  const { updateLocale } = useLocaleContext();
  const operation = useOperation(FrameQuery);

  // Update navigation context when location and data are available
  useEffect(() => {
    if (operation.data && location) {
      const mainNavigation =
        operation.data.mainNavigation
          ?.filter((nav) => nav?.locale === intl.locale)
          .pop()
          ?.items.filter(
            (item): item is NonNullable<typeof item> =>
              item !== null && item !== undefined,
          ) || [];

      const footerNavigation =
        operation.data.footerNavigation
          ?.filter((nav) => nav?.locale === intl.locale)
          .pop()
          ?.items.filter(
            (item): item is NonNullable<typeof item> =>
              item !== null && item !== undefined,
          ) || [];

      updateNavigation({
        mainNavigation,
        footerNavigation,
        currentPath: location.pathname,
        currentPageId: location.pathname,
      });
    }
  }, [operation.data, location, intl.locale, updateNavigation]);

  // Update locale context when data is available
  useEffect(() => {
    if (operation.data) {
      const localeTranslations =
        operation.data.websiteSettings?.homePage?.translations?.reduce(
          (acc, translation) => {
            if (translation?.locale && translation?.path) {
              acc[translation.locale] = translation.path;
            }
            return acc;
          },
          {} as Record<Locale, string>,
        ) || {};

      updateLocale({
        currentLocale: intl.locale as Locale,
        availableLocales: Object.keys(localeTranslations) as Locale[],
        translations: localeTranslations as Record<Locale, Url>,
        defaultLocale: 'en',
      });
    }
  }, [operation.data, intl.locale, updateLocale]);

  return (
    <PageTransition languageMessageProps={languageMessageProps}>
      <div>
        {page.editLink ? <ContentEditLink {...page.editLink} /> : null}
        {!page.hero && <BreadCrumbs />}
        {page.hero && <PageHero {...page.hero} />}
        {page?.content?.filter(isTruthy).map((block, index) => {
          switch (block.__typename) {
            case 'BlockMedia':
              return <BlockMedia key={index} {...block} />;
            case 'BlockMarkup':
              return <BlockMarkup key={index} {...block} />;
            case 'BlockForm':
              return <BlockForm key={index} {...block} />;
            case 'BlockImageTeasers':
              return <BlockImageTeasers key={index} {...block} />;
            case 'BlockCta':
              return <BlockCta key={index} {...block} />;
            case 'BlockImageWithText':
              return <BlockImageWithText key={index} {...block} />;
            case 'BlockQuote':
              return <BlockQuote key={index} {...block} />;
            case 'BlockHorizontalSeparator':
              return <BlockHorizontalSeparator key={index} {...block} />;
            case 'BlockAccordion':
              return <BlockAccordion key={index} {...block} />;
            case 'BlockInfoGrid':
              return <BlockInfoGrid key={index} {...block} />;
            case 'BlockTeaserList':
              return <BlockTeaserList key={index} {...block} />;
            case 'BlockConditional':
              return <BlockConditional key={index} {...block} />;
            default:
              throw new UnreachableCaseError(block);
          }
        })}
      </div>
    </PageTransition>
  );
}

type CommonContentBlock = NonNullable<
  Required<BlockConditionalFragment>['content'][number]
>;

export function CommonContent(props: CommonContentBlock) {
  switch (props.__typename) {
    case 'BlockMedia':
      return <BlockMedia {...props} />;
    case 'BlockMarkup':
      return <BlockMarkup {...props} />;
    case 'BlockForm':
      return <BlockForm {...props} />;
    case 'BlockImageTeasers':
      return <BlockImageTeasers {...props} />;
    case 'BlockCta':
      return <BlockCta {...props} />;
    case 'BlockImageWithText':
      return <BlockImageWithText {...props} />;
    case 'BlockQuote':
      return <BlockQuote {...props} />;
    case 'BlockHorizontalSeparator':
      return <BlockHorizontalSeparator />;
    case 'BlockAccordion':
      return <BlockAccordion {...props} />;
    case 'BlockInfoGrid':
      return <BlockInfoGrid {...props} />;
    default:
      throw new UnreachableCaseError(props);
  }
}
