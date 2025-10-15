import { useEffect, useRef } from 'react';

import { useSeoAnalysis } from './useSeoAnalysis';

interface PreviewAnalysisProps {
  content: string | null;
  keyword: string;
  locale: string;
  title?: string;
  description?: string;
  url?: string;
  permalink?: string;
}

export function usePreviewAnalysis({
  content,
  keyword,
  locale,
  title,
  description,
  url,
  permalink,
}: PreviewAnalysisProps) {
  const lastHashRef = useRef<string | null>(null);
  const { analyze, results, loading: isAnalyzing, error } = useSeoAnalysis();

  useEffect(() => {
    if (!content) return;

    // Build a composite hash so changes in any relevant input re-run analysis
    const composite = JSON.stringify({
      content,
      keyword,
      locale,
      title: title || '',
      description: description || '',
      url: url || '',
      permalink: permalink || '',
    });
    if (composite === lastHashRef.current) return;
    lastHashRef.current = composite;

    // Run analysis with a slight delay to ensure rendering is complete
    const timeoutId = setTimeout(() => {
      analyze(content, keyword, locale, { title, description, url, permalink });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [content, keyword, locale, title, description, url, permalink, analyze]);

  return {
    results,
    isAnalyzing,
    error,
  };
}
