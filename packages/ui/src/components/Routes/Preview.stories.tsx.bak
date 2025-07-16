import {
  FrameQuery,
  Locale,
  OperationExecutorsProvider,
  PreviewDrupalPageQuery,
  Url,
} from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

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
  render: (args) => {
    return (
      <OperationExecutorsProvider
        executors={[
          { executor: args, id: PreviewDrupalPageQuery },
          { id: FrameQuery, executor: FrameStory.args },
        ]}
      >
        <Preview />
      </OperationExecutorsProvider>
    );
  },
  args: {
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
  parameters: {
    location: new URL('local:/gatsby-turbo'),
  },
} satisfies StoryObj<PreviewDrupalPageQuery>;

export const Preview403 = {
  ...Default,
  args: {},
} satisfies StoryObj<PreviewDrupalPageQuery>;
