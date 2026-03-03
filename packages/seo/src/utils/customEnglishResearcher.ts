import type { Paper } from 'yoastseo';
import EnglishResearcher from 'yoastseo/build/languageProcessing/languages/en/Researcher';

import customGetLinkStatistics from './customGetLinkStatistics';

export class CustomEnglishResearcher extends EnglishResearcher {
  // Explicitly declare these properties to fix TypeScript errors
  private addHelper: (name: string, helper: () => unknown) => void;
  private addResearch: (name: string, research: unknown) => void;
  private defaultResearches: Record<string, unknown>;

  constructor(paper: Paper) {
    super(paper);

    // Add required research methods

    // Override the default getLinkStatistics in defaultResearches
    this.defaultResearches.getLinkStatistics = customGetLinkStatistics;
  }
}
