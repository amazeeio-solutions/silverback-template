export type SeoCategory = 'readability' | 'seo' | 'technical';
export type SeoStatus = 'good' | 'ok' | 'poor';

export interface SeoResult {
  text: string;
  score: number;
  marker?: string;
  category: SeoCategory;
  status: SeoStatus;
}

export interface SeoSummary {
  score: number;
  color: string;
  status: SeoStatus;
}

export interface SeoResultsFloatingProps {
  results: SeoResult[];
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  content: string;
  isAnalyzing?: boolean;
  error?: Error | null;
}

export interface UseSeoAnalysisResult {
  results: SeoResult[];
  analyze: (content: string, keyword: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
} 