import {
  CardItemFragment,
  ContentHubQuery,
  ContentHubTermsQuery,
  OperationExecutorsProvider,
  OperationResult,
  OperationVariables,
  Url,
} from '@custom/schema';
import Landscape from '@stories/landscape.jpg?as=metadata';
import Portrait from '@stories/portrait.jpg?as=metadata';
import { Meta, StoryObj } from '@storybook/react';
import qs from 'query-string';
import React from 'react';

import { image } from '../../helpers/image';
import SearchFormStories from '../Molecules/SearchForm.stories';
import {
  ContentHub,
  ContentHubPaginationArgs,
  ContentHubQueryArgs,
} from './ContentHub';

type ContentHubExecutor = (
  id: typeof ContentHubQuery,
  vars: OperationVariables<typeof ContentHubQuery>,
) => Promise<OperationResult<typeof ContentHubQuery>>;

const defaultItemsPerPage = 6;

export default {
  title: 'Components/Organisms/ContentHub',
  render: (args) => {
    return (
      <OperationExecutorsProvider
        executors={[
          { executor: args.execQuery, id: ContentHubQuery },
          { executor: args.execTerms, id: ContentHubTermsQuery },
        ]}
      >
        <ContentHub
          itemsPerPage={args.itemsPerPage || defaultItemsPerPage}
          showFilters={args.showFilters}
          defaultTerm={args.defaultTerm}
          defaultKeyword={args.defaultKeyword}
        />
      </OperationExecutorsProvider>
    );
  },
  argTypes: {
    showFilters: {
      control: 'boolean',
      description: 'Toggle search filters visibility',
    },
  },
} satisfies Meta<{
  execQuery: ContentHubExecutor;
  execTerms: ContentHubTermsQuery;
  itemsPerPage: number;
  showFilters: boolean;
  defaultKeyword: string;
  defaultTerm: string;
}>;

// Update the ContentHubStory type
type ContentHubStory = StoryObj<{
  execQuery: ContentHubExecutor;
  execTerms: ContentHubTermsQuery;
  itemsPerPage: number;
  showFilters: boolean;
  defaultKeyword: string;
  defaultTerm: string;
}>;

const termOptions = {
  contentHubTerms: SearchFormStories.args.termOptions,
};

export const Empty = {
  args: {
    execQuery: async () => ({
      contentHub: { total: 0, items: [] },
    }),
    execTerms: termOptions,
  },
} satisfies ContentHubStory;

export const Loading = {
  args: {
    execQuery: () =>
      new Promise<OperationResult<typeof ContentHubQuery>>(() => {}),
    execTerms: termOptions,
  },
} satisfies ContentHubStory;

export const Error = {
  args: {
    execQuery: () =>
      new Promise<OperationResult<typeof ContentHubQuery>>(() => {
        throw 'Error loading content hub.';
      }),
    execTerms: termOptions,
  },
} satisfies ContentHubStory;

export const WithResults: ContentHubStory = {
  args: {
    execQuery: async (_, vars) => {
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
                    source: image(i % 2 === 0 ? Landscape : Portrait, {
                      width: 400,
                      height: 300,
                    }),
                  },
            terms:
              i % 7 === 0
                ? [
                    SearchFormStories.args.termOptions![0],
                    SearchFormStories.args.termOptions![1],
                  ]
                : [SearchFormStories.args.termOptions![i % 4]],
          }) satisfies CardItemFragment,
      );

      const args = qs.parse(vars.args || '') as ContentHubQueryArgs &
        ContentHubPaginationArgs;

      // filter by title
      let filtered = items.filter(
        (item) =>
          !args.title ||
          item.title.toLowerCase().includes(args.title.toLowerCase()),
      );
      // filter by terms
      filtered = filtered.filter(
        (item) =>
          !args.terms || item.terms.some((term) => term.termId === args.terms),
      );

      // Use pageSize from args if available, otherwise use default itemsPerPage
      const itemsPerPage = args.pageSize
        ? parseInt(args.pageSize) || defaultItemsPerPage
        : defaultItemsPerPage;

      const offset = args.page
        ? ((parseInt(args.page) || 1) - 1) * itemsPerPage
        : 0;
      return {
        contentHub: {
          total: filtered.length,
          items: filtered.slice(offset, offset + itemsPerPage),
        },
      };
    },
    execTerms: termOptions,
  },
};

export const Filtered: ContentHubStory = {
  ...WithResults,
  parameters: {
    location: new URL('local:/content-hub?keyword=Article&terms=2'),
  },
};

export const Paged: ContentHubStory = {
  ...WithResults,
  parameters: {
    location: new URL('local:/content-hub?page=2'),
  },
};

export const HiddenFilters: ContentHubStory = {
  args: {
    ...WithResults.args,
    showFilters: false,
  },
};

export const DefaultKeyword: ContentHubStory = {
  args: {
    ...WithResults.args,
    defaultKeyword: 'Story',
  },
};

export const DefaultTerm: ContentHubStory = {
  args: {
    ...WithResults.args,
    defaultTerm: '3',
  },
};

export const LimitedPerPage: ContentHubStory = {
  args: {
    ...WithResults.args,
    itemsPerPage: 3,
  },
};
