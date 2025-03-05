import {
  ContentHubQuery,
  FrameQuery,
  OperationExecutorsProvider,
  ViewPageQuery,
} from '@custom/schema';
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

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
  },
} satisfies Meta;

export const ContentPage = (() => {
  return (
    <OperationExecutorsProvider
      executors={[
        { executor: PageStory.args, id: ViewPageQuery },
        { executor: FrameStory.args, id: FrameQuery },
      ]}
    >
      <Frame>
        <Page />
      </Frame>
    </OperationExecutorsProvider>
  );
}) satisfies StoryFn;

export const ContentHubPage = (() => {
  return (
    <OperationExecutorsProvider
      executors={[
        { executor: PageStory.args, id: ViewPageQuery },
        { executor: WithResults.args?.execQuery, id: ContentHubQuery },
        { executor: FrameStory.args, id: FrameQuery },
      ]}
    >
      <Frame>
        <ContentHub pageSize={6} termsResults={[]} />
      </Frame>
    </OperationExecutorsProvider>
  );
}) satisfies StoryFn;
