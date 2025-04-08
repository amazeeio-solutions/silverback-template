/**
 * URL helper functions for SEO analysis
 */
const urlHelper = {
  /**
   * Removes hash from a URL
   */
  removeHash(url: string): string {
    return url.split('#')[0];
  },

  /**
   * Removes query arguments from a URL
   */
  removeQueryArgs(url: string): string {
    return url.split('?')[0];
  },

  /**
   * Removes trailing slash from a URL
   */
  removeTrailingSlash(url: string): string {
    return url.replace(/\/$/, '');
  },

  /**
   * Adds trailing slash to a URL
   */
  addTrailingSlash(url: string): string {
    return this.removeTrailingSlash(url) + '/';
  },

  /**
   * Gets URL from an anchor tag
   */
  getFromAnchorTag(anchorTag: string): string {
    const match = /href=(["'])([^"']+)\1/i.exec(anchorTag);
    return match ? match[2] : '';
  },

  /**
   * Checks if two URLs are equal (ignoring trailing slashes, query args, and hashes)
   */
  areEqual(urlA: string, urlB: string): boolean {
    urlA = this.removeQueryArgs(this.removeHash(urlA));
    urlB = this.removeQueryArgs(this.removeHash(urlB));
    return this.addTrailingSlash(urlA) === this.addTrailingSlash(urlB);
  },

  /**
   * Gets hostname from a URL
   */
  getHostname(url: string): string {
    try {
      return new URL(url, window.location.origin).hostname;
    } catch {
      return '';
    }
  },

  /**
   * Gets protocol from a URL
   */
  getProtocol(url: string): string | null {
    try {
      return new URL(url, window.location.origin).protocol;
    } catch {
      return null;
    }
  },

  /**
   * Checks if a URL is an internal link
   */
  isInternalLink(anchorUrl: string, siteUrlOrDomain: string): boolean {
    try {
      // Handle relative URLs
      if (anchorUrl.startsWith('/') && !anchorUrl.startsWith('//')) {
        return true;
      }

      // Handle fragment URLs
      if (anchorUrl.startsWith('#')) {
        return false;
      }

      // Handle absolute URLs
      const anchorUrlObj = new URL(anchorUrl, window.location.origin);
      const siteUrlObj = siteUrlOrDomain.includes('/')
        ? new URL(siteUrlOrDomain)
        : { hostname: siteUrlOrDomain };

      return anchorUrlObj.hostname === siteUrlObj.hostname;
    } catch {
      // If URL parsing fails, assume it's internal if it starts with /
      return anchorUrl.startsWith('/');
    }
  },

  /**
   * Checks if protocol is HTTP(S)
   */
  protocolIsHttpScheme(protocol: string | null): boolean {
    return protocol === 'http:' || protocol === 'https:';
  },

  /**
   * Checks if URL is a relative fragment
   */
  isRelativeFragmentURL(url: string): boolean {
    return url.startsWith('#');
  },

  /**
   * Parse URL (compatibility with Node's url.parse)
   */
  parse(urlString: string) {
    // Handle fragment-only URLs
    if (urlString.startsWith('#')) {
      return {
        protocol: null,
        hostname: null,
        pathname: null,
        search: null,
        hash: urlString,
        href: urlString
      };
    }

    // Handle relative URLs
    if (urlString.startsWith('/') && !urlString.startsWith('//')) {
      return {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        pathname: urlString,
        search: null,
        hash: null,
        href: new URL(urlString, window.location.origin).href
      };
    }

    try {
      const url = new URL(urlString, window.location.origin);
      return {
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname,
        search: url.search || null,
        hash: url.hash || null,
        href: url.href
      };
    } catch {
      // If URL parsing fails, return object with nulls
      return {
        protocol: null,
        hostname: null,
        pathname: null,
        search: null,
        hash: null,
        href: urlString
      };
    }
  },
};

export default urlHelper;
