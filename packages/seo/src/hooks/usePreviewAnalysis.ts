import { useEffect, useRef } from 'react';

import { useSeoAnalysis } from './useSeoAnalysis';

interface PreviewAnalysisProps {
  content: string | null;
  keyword: string;
  locale: string;
  title?: string;
  description?: string;
}

export function usePreviewAnalysis({
  content,
  keyword,
  locale,
  title,
  description,
}: PreviewAnalysisProps) {
  const contentRef = useRef<string | null>(null);
  const { analyze, results, loading: isAnalyzing, error } = useSeoAnalysis();

  useEffect(() => {
    if (!content) return;

    // Skip if content hasn't changed
    if (content === contentRef.current) return;
    contentRef.current = content;

    // Run analysis with a slight delay to ensure rendering is complete
    const timeoutId = setTimeout(() => {
      analyze(content, keyword, locale, { title, description });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [content, keyword, locale, title, description, analyze]);

  return {
    results,
    isAnalyzing,
    error,
  };
}
