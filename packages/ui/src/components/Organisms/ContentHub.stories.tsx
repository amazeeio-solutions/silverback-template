import {
  CardItemFragment,
  ContentHubQuery,
  OperationExecutorsProvider,
  OperationResult,
  OperationVariables,
  Url,
} from '@custom/schema';
import Landscape from '@stories/landscape.jpg';
import Portrait from '@stories/portrait.jpg';
import { Meta, StoryObj } from '@storybook/react';
import qs from 'query-string';
import React from 'react';

import { ContentHub, ContentHubQueryArgs } from './ContentHub';

type ContentHubExecutor = (
  id: typeof ContentHubQuery,
  vars: OperationVariables<typeof ContentHubQuery>,
) => Promise<OperationResult<typeof ContentHubQuery>>;

const pageSize = 6;

export default {
  title: 'Components/Organisms/ContentHub',
  render: (args) => {
    return (
      <OperationExecutorsProvider
        executors={[{ executor: args.exec, id: ContentHubQuery }]}
      >
        <ContentHub pageSize={pageSize} />
      </OperationExecutorsProvider>
    );
  },
} satisfies Meta<{ exec: ContentHubExecutor }>;

type ContentHubStory = StoryObj<{ exec: ContentHubExecutor }>;

export const Empty = {
  args: {
    exec: async () => ({
      contentHub: { total: 0, items: [] },
    }),
  },
} satisfies ContentHubStory;

export const Loading = {
  args: {
    exec: () => new Promise<OperationResult<typeof ContentHubQuery>>(() => {}),
  },
} satisfies ContentHubStory;

export const Error = {
  args: {
    exec: () =>
      new Promise<OperationResult<typeof ContentHubQuery>>(() => {
        throw 'Error loading content hub.';
      }),
  },
} satisfies ContentHubStory;

export const WithResults: ContentHubStory = {
  args: {
    exec: async (_, vars) => {
      const items = [...Array(82).keys()].map(
        (i) =>
          ({
            id: `${i}`,
            path: `/item/${i + 1}` as Url,
            title: `${i % 3 === 2 ? 'Article' : 'Story'} #${i + 1}`,
            hero:
              i % 2 === 0 ? { headline: `Lead text for #${i + 1}` } : undefined,
            teaserImage:
              i % 3 === 1
                ? undefined
                : {
                    alt: `Image for item #${i + 1}`,
                    url: i % 2 === 0 ? Landscape : Portrait,
                  },
          }) satisfies CardItemFragment,
      );
      const args = qs.parse(vars.args || '') as ContentHubQueryArgs;
      const filtered = items.filter(
        (item) => !args.title || item.title.includes(args.title),
      );
      const offset = args.page
        ? ((parseInt(args.page) || 1) - 1) * pageSize
        : 0;
      return {
        contentHub: {
          total: filtered.length,
          items: filtered.slice(offset, offset + pageSize),
        },
      };
    },
  },
};

export const Filtered: ContentHubStory = {
  ...WithResults,
  parameters: {
    location: new URL('local:/content-hub?keyword=Article'),
  },
};

export const Paged: ContentHubStory = {
  ...WithResults,
  parameters: {
    location: new URL('local:/content-hub?page=2'),
  },
};
