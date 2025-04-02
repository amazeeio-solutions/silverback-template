import '@custom/ui/styles.css';

import { GatsbyBrowser } from 'gatsby';

import { WrapRootElement } from './src/utils/wrapRootElement';

export const wrapRootElement = WrapRootElement;

export const shouldUpdateScroll: GatsbyBrowser['shouldUpdateScroll'] = (
  args,
) => {
  // Tell Gatsby to only update scroll position if the pathname or hash has changed.
  // If only the search has changed (e.g. when a search form is submitted),
  // the scroll position should remain the same.
  const current = args.routerProps.location;
  const previous = args.prevRouterProps?.location;
  return (
    current.pathname !== previous?.pathname || current.hash !== previous?.hash
  );
};
