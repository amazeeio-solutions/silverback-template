// Resolving against the current origin is what rejects `javascript:` and other
// script bearing schemes: a path resolves to the current origin, while a scheme
// carrying value keeps its own protocol and fails the checks below. Returning
// only the path means the caller can never hand a scheme to `location.href`.
export function sameOriginDestination(
  destination: string | null,
): string | null {
  if (!destination) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(destination, window.location.origin);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
