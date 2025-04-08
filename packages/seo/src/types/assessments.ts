export interface AssessmentResult {
  identifier?: string;
  _identifier?: string;
  text?: string;
  score?: number;
  wordCount?: number;
  recommendedMinimum?: number;
  noAlt?: number;
  imageCount?: number;
  h1Count?: number;
  hasSubheadings?: boolean;
  tooLong?: boolean;
  linkCount?: number;
  descriptionLength?: number;
  maxLength?: number;
  hasDescription?: boolean;
  titleWidth?: number;
  maxWidth?: number;
}

export interface TranslationResult {
  key: string;
  variables: Record<string, unknown>;
} 