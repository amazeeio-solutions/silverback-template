import '../src/tailwind.css';

import { IntlProvider } from '@amazeelabs/react-intl';
import { LocationProvider } from '@custom/schema';
import { Decorator } from '@storybook/react';
import React from 'react';
import { SWRConfig, useSWRConfig } from 'swr';

// Every story is wrapped in an IntlProvider by default.
const IntlDecorator: Decorator = (Story) => (
  <IntlProvider locale={'en'} defaultLocale={'en'}>
    <Story />
  </IntlProvider>
);

const LocationDecorator: Decorator = (Story, ctx) => {
  return (
    <LocationProvider currentLocation={ctx.parameters.location}>
      <Story />
    </LocationProvider>
  );
};

const IsStorybookDecorator: Decorator = (Story) => {
  // This var is documented but does not exist in our setup for some reason.
  // https://storybook.js.org/docs/faq#how-can-my-code-detect-if-it-is-running-in-storybook
  // @ts-expect-error Custom global variable.
  window.IS_STORYBOOK = true;
  return <Story />;
};

declare global {
  interface Window {
    __STORYBOOK_PREVIEW__: {
      currentRender: {
        id: string;
      };
    };
  }
}

const SWRCacheDecorator: Decorator = (Story, context) => {
  const { cache } = useSWRConfig();
  for (const key of cache.keys()) {
    cache.delete(key);
  }
  return (
    <SWRConfig
      value={{
        use: [
          (useSWR) => (key, fetcher, config) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            return useSWR(
              // Make sure SWR caches are unique per story.
              [...(key instanceof Array ? key : [key]), context.id],
              fetcher,
              config,
            );
          },
        ],
      }}
    >
      <Story />
    </SWRConfig>
  );
};

export const parameters = {
  chromatic: { viewports: [320, 840, 1440] },
};

export const decorators = [
  LocationDecorator,
  IntlDecorator,
  SWRCacheDecorator,
  IsStorybookDecorator,
];
