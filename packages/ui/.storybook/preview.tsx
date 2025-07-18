import '../src/tailwind.css';

import { IntlProvider } from '@amazeelabs/react-intl';
import { LocationProvider } from '@custom/schema';
import { Decorator } from '@storybook/react';
import React from 'react';
import { SWRConfig, useSWRConfig } from 'swr';

import { ExecutorsDecorator } from '../src/helpers/executors';

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

const SWRCacheDecorator: Decorator = (Story) => {
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
              [
                ...(key instanceof Array ? key : [key]),
                window.__STORYBOOK_PREVIEW__.currentRender.id,
              ],
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
  a11y: {
    // TODO: Remove once https://github.com/storybookjs/storybook/issues/30385
    //  is solved. Disable automated accessibility tests for now.
    manual: true,

    // Optional selector to inspect
    element: '#storybook-root',
    config: {
      rules: [
        {
          // The autocomplete rule will not run based on the CSS selector provided
          id: 'autocomplete-valid',
          selector: '*:not([autocomplete="nope"])',
        },
        {
          // Setting the enabled option to false will disable checks for this particular rule on all stories.
          id: 'image-alt',
          enabled: false,
        },
        {
          // Setting the enabled option to false will disable checks for this particular rule on all stories.
          id: 'color-contrast',
          reviewOnFail: true,
        },
        {
          id: 'link-name',
          reviewOnFail: true,
        },
        {
          id: 'duplicate-id',
          reviewOnFail: true,
        },
        {
          id: 'landmark-no-duplicate-main',
          reviewOnFail: true,
        },
        {
          id: 'landmark-main-is-top-level',
          reviewOnFail: true,
        },
        {
          id: 'landmark-unique',
          reviewOnFail: true,
        },
        {
          id: 'button-name',
          reviewOnFail: true,
        },
        {
          id: 'list',
          reviewOnFail: true,
        },
      ],
    },
    // Axe's options parameter
    options: {},
  },
};

export const decorators = [
  LocationDecorator,
  ExecutorsDecorator,
  IntlDecorator,
  SWRCacheDecorator,
  IsStorybookDecorator,
];
