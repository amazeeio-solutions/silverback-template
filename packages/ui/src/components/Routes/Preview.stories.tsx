import {
  FrameQuery,
  Locale,
  PreviewDrupalPageQuery,
  Url,
} from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';

import { AccordionItemText } from '../Organisms/PageContent/BlockAccordion.stories';
import { Default as BlockImageTeasers } from '../Organisms/PageContent/BlockImageTeasers.stories';
import { ImageRight } from '../Organisms/PageContent/BlockImageWithText.stories';
import { Mixed, Paragraph } from '../Organisms/PageContent/BlockMarkup.stories';
import { WithCaption } from '../Organisms/PageContent/BlockMedia.stories';
import { Default as FrameStory } from './Frame.stories';
import { Preview } from './Preview';

export default {
  component: Preview,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Preview>;

export const Default = {
  parameters: {
    executors: {
      [PreviewDrupalPageQuery]: {
        preview: {
          title: 'Preview Page Title',
          locale: 'en',
          translations: [
            {
              locale: Locale.En,
              path: '/test' as Url,
            },
          ],
          path: '/test' as Url,
          content: [
            {
              __typename: 'BlockImageTeasers',
              ...BlockImageTeasers.args,
            },
            {
              __typename: 'BlockMarkup',
              ...Mixed.args,
            },
            {
              __typename: 'BlockMedia',
              ...WithCaption.args,
            },
            {
              __typename: 'BlockMarkup',
              ...Paragraph.args,
            },
            {
              __typename: 'BlockImageWithText',
              ...ImageRight.args,
            },
            {
              __typename: 'BlockAccordion',
              ...AccordionItemText.args,
            },
            {
              __typename: 'BlockImageTeasers',
              ...BlockImageTeasers.args,
            },
          ] as Exclude<PreviewDrupalPageQuery['preview'], undefined>['content'],
        },
      },
      [FrameQuery]: FrameStory.parameters.executors[FrameQuery],
    },
    location: new URL('local:/gatsby-turbo'),
  },
} satisfies StoryObj<PreviewDrupalPageQuery>;

export const Preview403 = {
  parameters: {
    executors: {
      [PreviewDrupalPageQuery]: {},
      [FrameQuery]: FrameStory.parameters.executors[FrameQuery],
    },
    location: new URL('local:/gatsby-turbo'),
  },
} satisfies StoryObj<PreviewDrupalPageQuery>;
