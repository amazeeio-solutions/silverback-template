import React, { useEffect } from 'react';

import { usePreviewAnalysis } from '../hooks/usePreviewAnalysis';
import { de, en, fr, it } from '../translations';
import type { YoastTranslations } from '../types/translations';
import { initializeYoastTranslations } from '../utils/patchYoastTranslations';
import { SeoResultsFloating } from './SeoResultsFloating';

interface MetaTag {
  tag: string;
  attributes: {
    name?: string;
    property?: string;
    content?: string;
    rel?: string;
    href?: string;
    hreflang?: string;
  };
}

interface SeoAnalysisProps {
  content: string | null;
  keyword?: string;
  locale: string;
  metaTags?: MetaTag[] | null;
  title?: string;
  description?: string;
  url?: string;
}

export function SeoAnalysis({
  content,
  keyword,
  locale,
  metaTags,
  title: explicitTitle,
  description: explicitDescription,
}: SeoAnalysisProps) {
  // Find title: first try explicit title, then meta title, then og:title
  const title =
    explicitTitle ||
    metaTags?.find(
      (tag) =>
        (tag.tag === 'meta' && tag.attributes.name === 'title') ||
        (tag.tag === 'meta' && tag.attributes.property === 'og:title'),
    )?.attributes.content;

  // Find description: first try explicit meta, then meta description, then og:description
  const description =
    explicitDescription ||
    metaTags?.find(
      (tag) =>
        (tag.tag === 'meta' && tag.attributes.name === 'description') ||
        (tag.tag === 'meta' && tag.attributes.property === 'og:description'),
    )?.attributes.content;

  // Use an effect to initialize translations when the component mounts or locale changes
  useEffect(() => {
    // Select translations based on locale
    let translations: YoastTranslations = en;
    if (locale.startsWith('de')) {
      translations = de as YoastTranslations;
    } else if (locale.startsWith('fr')) {
      translations = fr as YoastTranslations;
    } else if (locale.startsWith('it')) {
      translations = it as YoastTranslations;
    }

    // Initialize Yoast translations
    initializeYoastTranslations(locale, translations);
  }, [locale]);

  const { results, isAnalyzing, error } = usePreviewAnalysis({
    content,
    keyword,
    locale,
    title,
    description,
  });

  return (
    <SeoResultsFloating
      results={results}
      keyword={keyword || ''}
      onKeywordChange={() => {}} // Add if needed
      content={content || ''}
      isAnalyzing={isAnalyzing}
      error={error}
      locale={locale}
    />
  );
}
