import { FrameQuery, OperationExecutorsProvider } from '@custom/schema';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Footer as FooterStory } from '../Organisms/Footer.stories';
import { Idle as HeaderStory } from '../Organisms/Header.stories';
import { Frame } from './Frame';

export default {
  component: Frame,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Frame>;

export const Default = {
  render: (args) => {
    return (
      <OperationExecutorsProvider
        executors={[{ executor: args, id: FrameQuery }]}
      >
        <Frame />
      </OperationExecutorsProvider>
    );
  },
  args: {
    mainNavigation: HeaderStory.args.mainNavigation,
    footerNavigation: FooterStory.args.footerNavigation,
    metaNavigation: HeaderStory.args.metaNavigation,
    stringTranslations: [],
  },
} satisfies StoryObj<FrameQuery>;
