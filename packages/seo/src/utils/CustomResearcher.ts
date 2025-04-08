import { AbstractResearcher } from 'yoastseo';
import getLinks from 'yoastseo/build/languageProcessing/researches/getLinks';

import customGetLinkStatistics from './customGetLinkStatistics';
// ... import other needed researches

export class CustomResearcher extends AbstractResearcher {
  constructor(paper: unknown) {
    super(paper);

    // Override defaultResearches with only what we need
    (this as any).defaultResearches = {
      getLinks,
      getLinkStatistics: customGetLinkStatistics,
      // ... other researches we need
    };
  }
}
