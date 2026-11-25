import urlHelper from './urlHelper';

export function getLinkType(
  anchor: string,
  siteUrlOrDomain: string,
): 'internal' | 'external' | 'other' {
  const url = urlHelper.getFromAnchorTag(anchor);

  // Handle fragment URLs - consider them internal
  if (url.startsWith('#')) {
    return 'internal';
  }

  // Handle relative URLs - they're always internal
  if (url.startsWith('/') && !url.startsWith('//')) {
    return 'internal';
  }

  try {
    const protocol = urlHelper.getProtocol(url);

    // If it's not http(s), it's "other" (mailto:, tel:, etc)
    if (!urlHelper.protocolIsHttpScheme(protocol)) {
      return 'other';
    }

    // Check if internal or external
    return urlHelper.isInternalLink(url, siteUrlOrDomain)
      ? 'internal'
      : 'external';
  } catch {
    // If parsing fails, assume it's internal if it starts with /
    return url.startsWith('/') ? 'internal' : 'other';
  }
}
