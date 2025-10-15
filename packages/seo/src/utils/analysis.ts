import { Paper } from 'yoastseo';
import EnglishResearcher from 'yoastseo/build/languageProcessing/languages/en/Researcher';
import altTagCount from 'yoastseo/build/languageProcessing/researches/altTagCount';
import getLinks from 'yoastseo/build/languageProcessing/researches/getLinks';
import h1s from 'yoastseo/build/languageProcessing/researches/h1s';
import imageCount from 'yoastseo/build/languageProcessing/researches/imageCount';
import pageTitleWidth from 'yoastseo/build/languageProcessing/researches/pageTitleWidth';
import scoreToRating from 'yoastseo/build/scoring/interpreters/scoreToRating';
import { measureTextWidth } from 'yoastseo/build/helpers';

import CustomAssessor from './CustomAssessor';
import customGetLinkStatistics from './customGetLinkStatistics';
import urlHelper from './urlHelper';

interface AnalysisConfig {
  title?: string;
  description?: string;
  url?: string;
  permalink?: string;
}

export function createAnalyzer(locale: string) {
  return (content: string, keyword: string, config?: AnalysisConfig) => {
    const title = config?.title || '';

    // Calculate titleWidth (in pixels) using Yoast's measureTextWidth on the stripped title
    const titleWidth = title ? measureTextWidth(title) : 0;

    // Create paper with all required properties
    const paper = new Paper(content, {
      keyword,
      locale,
      title,
      description: config?.description || '',
      url: config?.url || '',
      titleWidth,
      permalink: config?.permalink || '',
    });

    // Use the standard EnglishResearcher from Yoast
    const researcher = new EnglishResearcher(paper);
    researcher.addHelper('url', () => urlHelper);

    researcher.addResearch('imageCount', imageCount);

    researcher.addResearch('altTagCount', altTagCount);

    researcher.addResearch('h1s', h1s);

    researcher.addResearch('pageTitleWidth', pageTitleWidth);
    researcher.addResearch('getLinks', getLinks);
    researcher.addResearch('getLinkStatistics', customGetLinkStatistics);

    // Initialize assessor and run it
    const assessor = new CustomAssessor(researcher, { locale });
    assessor.assess(paper);

    // At this point, use the assessor results directly
    const analysisResults = assessor.getValidResults();

    // Don't try to use the App class if it's causing errors
    // Just format and return the results from the assessor
    return analysisResults.map((result) => ({
      text: result.text,
      score: typeof result.score === 'number' ? result.score : 0,
      marker: result.marker || '',
      category: result.identifier?.toLowerCase().includes('readability')
        ? 'readability'
        : 'seo',
      status: scoreToRating(result.score || 0),
    }));
  };
}

function truncateForSnippet(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function getSnippetPreview(content: string): {
  title: string;
  url: string;
  description: string;
} {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  // Get title (max 60 chars)
  const title = truncateForSnippet(
    tempDiv.querySelector('title')?.textContent ||
      tempDiv.querySelector('meta[name="title"]')?.getAttribute('content') ||
      tempDiv
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content') ||
      '',
    60,
  );

  // Get URL from canonical or current location
  const url =
    tempDiv.querySelector('link[rel="canonical"]')?.getAttribute('href') ||
    tempDiv.querySelector('meta[property="og:url"]')?.getAttribute('content') ||
    window.location.href;

  // Get description (max 160 chars)
  const description = truncateForSnippet(
    tempDiv
      .querySelector('meta[name="description"]')
      ?.getAttribute('content') ||
      tempDiv
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content') ||
      '',
    160,
  );

  return {
    title,
    url,
    description,
  };
}

export type SeoCategory = 'seo' | 'content' | 'technical' | 'readability';
