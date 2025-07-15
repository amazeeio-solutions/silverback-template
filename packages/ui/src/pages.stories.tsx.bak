import {
  ContentHubQuery,
  ContentHubTermsQuery,
  FrameQuery,
  Locale,
  OperationExecutorsProvider,
  Url,
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
        { executor: WithResults.args?.execTerms, id: ContentHubTermsQuery },
        { executor: FrameStory.args, id: FrameQuery },
      ]}
    >
      <Frame>
        <ContentHub pageSize={6} />
      </Frame>
    </OperationExecutorsProvider>
  );
}) satisfies StoryFn;

export const SimplePageWithDropCap = (() => {
  const simplePageArgs = {
    page: {
      title: 'Simple Page with Drop Cap',
      locale: 'en',
      translations: [
        {
          locale: Locale.En,
          path: '/simple-page' as Url,
        },
      ],
      path: '/simple-page' as Url,
      editLink: {
        type: 'drupal',
        url: '/simple-page/edit' as Url,
      },
      content: [
        {
          __typename: 'BlockMarkup',
          markup: `<p class="has-drop-cap">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>`,
        },
      ],
    },
  };

  return (
    <OperationExecutorsProvider
      executors={[
        { executor: simplePageArgs, id: ViewPageQuery },
        { executor: FrameStory.args, id: FrameQuery },
      ]}
    >
      <Frame>
        <Page />
      </Frame>
    </OperationExecutorsProvider>
  );
}) satisfies StoryFn;
