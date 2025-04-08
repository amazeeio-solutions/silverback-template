import { App } from 'yoastseo';

export class SEOAssessor {
  private app: App;

  constructor(options: {
    locale?: string,
    translations?: {
      domain: string;
      locale_data: {
        [key: string]: {
          "": {
            domain: string;
            lang: string;
            [key: string]: unknown;
          };
          [key: string]: unknown;
        };
      };
    }
  }) {
    this.app = new App({
      callbacks: {
        getData: () => ({
          text: '',
          keyword: '',
          meta: '',
          url: '',
          title: '',
          excerpt: '',
          // ... other data needed
        })
      },
      locale: options.locale || 'en',
      translations: options.translations,
      targets: {
        output: 'output',
      },
      contentAnalysisActive: true,
      keywordAnalysisActive: true,
    });
  }

  analyze(data: {
    text: string;
    keyword?: string;
    meta?: string;
    url?: string;
    title?: string;
  }) {
    // Update the data
    this.app.getData = () => data;
    
    // Refresh analysis
    this.app.refresh();
    
    // Return results
    return {
      seo: this.app.getResults(),
      readability: this.app.getContentResults()
    };
  }
}

export function calculateOverallScore(results: Array<{ score: number }>): number {
  if (!results || results.length === 0) {
    return 0;
  }

  const validScores = results
    .map(result => {
      // Ensure score is not negative
      const score = typeof result.score === 'number' ? Math.max(0, result.score) : 0;
      return score;
    })
    .filter(score => !isNaN(score));

  if (validScores.length === 0) {
    return 0;
  }

  // Calculate average
  const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  
  // Ensure final score is between 0 and 10
  return Math.max(0, Math.min(10, Math.round(average)));
} 