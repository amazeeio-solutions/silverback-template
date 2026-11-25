import type { Paper } from 'yoastseo';
import checkNofollow from 'yoastseo/build/languageProcessing/helpers/link/checkNofollow';
import getAnchors from 'yoastseo/build/languageProcessing/helpers/link/getAnchorsFromText';

import { getLinkType } from './customGetLinkType';

export default function customGetLinkStatistics(paper: Paper) {
  const anchors = getAnchors(paper.getText());
  /*
   * We get the site's URL (e.g., https://yoast.com) or domain (e.g., yoast.com) from the paper.
   * In case of WordPress, the variable is a URL. In case of Shopify, it is a domain.
   */
  const siteUrlOrDomain = paper.getPermalink();

  const linkCount = {
    total: anchors.length,
    internalTotal: 0,
    internalDofollow: 0,
    internalNofollow: 0,
    externalTotal: 0,
    externalDofollow: 0,
    externalNofollow: 0,
    otherTotal: 0,
    otherDofollow: 0,
    otherNofollow: 0,
  };

  for (let i = 0; i < anchors.length; i++) {
    const currentAnchor = anchors[i];

    const linkType = getLinkType(currentAnchor, siteUrlOrDomain);
    const linkFollow = checkNofollow(currentAnchor);

    linkCount[linkType + 'Total']++;
    linkCount[linkType + linkFollow]++;
  }

  return linkCount;
}
