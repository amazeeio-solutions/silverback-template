import { useCallback, useState } from 'react';

import type { SeoResult } from '../types';
import { createAnalyzer } from '../utils/analysis';

export function useSeoAnalysis() {
  const [results, setResults] = useState<SeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(
    (
      content: string,
      keyword: string,
      locale: string,
      config?: {
        title?: string;
        description?: string;
        url?: string;
        permalink?: string;
      },
    ) => {
      setLoading(true);
      try {
        const analyzer = createAnalyzer(locale);
        const results = analyzer(content, keyword, config);
        setResults(results);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Analysis failed'));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { analyze, results, loading, error };
}
