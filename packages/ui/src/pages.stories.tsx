import {
  CartQuery,
  ContentHubQuery,
  ContentHubTermsQuery,
  FrameQuery,
  ViewPageQuery,
} from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { EmptyCart as CartStory } from './components/Organisms/CartPage.stories';
import { WithResults } from './components/Organisms/ContentHub.stories';
import { ContentHub } from './components/Routes/ContentHub';
import { Frame } from './components/Routes/Frame';
import { Default as FrameStory } from './components/Routes/Frame.stories';
import { Page } from './components/Routes/Page';
import { Default as PageStory } from './components/Routes/Page.stories';

export default {
  title: 'Pages',
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      // We don't want to snapshot page examples, that just causes a lot of noise.
      disableSnapshot: true,
    },
    executors: {
      [FrameQuery]: FrameStory.parameters.executors[FrameQuery],
      [CartQuery]: CartStory.parameters.executors[CartQuery],
    },
  },
  decorators: [(Story, ctx) => <Frame>{Story(ctx)}</Frame>],
} satisfies Meta;

export const ContentPage = {
  render: () => <Page />,
  parameters: {
    executors: {
      [ViewPageQuery]: PageStory.parameters.executors[ViewPageQuery],
    },
  },
} satisfies StoryObj;

export const ContentHubPage = {
  render: () => <ContentHub pageSize={6} />,
  parameters: {
    executors: {
      [ContentHubQuery]: WithResults.parameters?.executors?.[ContentHubQuery],
      [ContentHubTermsQuery]:
        WithResults.parameters?.executors?.[ContentHubTermsQuery],
    },
  },
};
