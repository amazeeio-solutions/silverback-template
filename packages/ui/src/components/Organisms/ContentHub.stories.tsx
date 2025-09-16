import {
  CardItemFragment,
  ContentHubQuery,
  ContentHubTermsQuery,
  OperationResult,
  Url,
} from '@custom/schema';
import Landscape from '@stories/landscape.jpg?as=metadata';
import Portrait from '@stories/portrait.jpg?as=metadata';
import { Meta, StoryObj } from '@storybook/react';
import qs from 'query-string';

import { Executor } from '../../helpers/executors';
import { image } from '../../helpers/image';
import SearchFormStories from '../Molecules/SearchForm.stories';
import {
  ContentHub,
  ContentHubPaginationArgs,
  ContentHubQueryArgs,
} from './ContentHub';

const pageSize = 6;

export default {
  title: 'Components/Organisms/ContentHub',
  component: ContentHub,
  args: {
    pageSize,
  },
} satisfies Meta<typeof ContentHub>;

type ContentHubStory = StoryObj<typeof ContentHub>;

const termOptions = {
  contentHubTerms: SearchFormStories.args.termOptions,
} satisfies Executor<typeof ContentHubTermsQuery>;

export const Empty = {
  parameters: {
    executors: {
      [ContentHubQuery]: async () => ({
        contentHub: { total: 0, items: [] },
      }),
      [ContentHubTermsQuery]: termOptions,
    },
  },
} satisfies ContentHubStory;

export const Loading = {
  parameters: {
    executors: {
      [ContentHubQuery]: () =>
        new Promise<OperationResult<typeof ContentHubQuery>>(() => {}),
      [ContentHubTermsQuery]: termOptions,
    },
  },
} satisfies ContentHubStory;

export const Error = {
  parameters: {
    executors: {
      [ContentHubQuery]: () =>
        new Promise<OperationResult<typeof ContentHubQuery>>(() => {
          throw 'Error loading content hub.';
        }),
      [ContentHubTermsQuery]: termOptions,
    },
  },
} satisfies ContentHubStory;

export const WithResults = {
  parameters: {
    executors: {
      [ContentHubQuery]: async (
        _: typeof ContentHubQuery,
        vars: { args?: string },
      ) => {
        const items = [...Array(82).keys()].map(
          (i) =>
            ({
              id: `${i}`,
              path: `/item/${i + 1}` as Url,
              title: `${i % 3 === 2 ? 'Article' : 'Story'} #${i + 1}`,
              hero:
                i % 2 === 0
                  ? { headline: `Lead text for #${i + 1}` }
                  : undefined,
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
          (item) => !args.title || item.title.includes(args.title),
        );
        // filter by terms
        filtered = filtered.filter(
          (item) =>
            !args.terms ||
            item.terms.some((term) => term.termId === args.terms),
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
      [ContentHubTermsQuery]: termOptions,
    },
  },
} satisfies ContentHubStory;

export const Filtered = {
  parameters: {
    ...WithResults.parameters,
    location: new URL('local:/content-hub?keyword=Article&terms=2'),
  },
} satisfies ContentHubStory;

export const Paged = {
  parameters: {
    ...WithResults.parameters,
    location: new URL('local:/content-hub?page=2'),
  },
} satisfies ContentHubStory;
