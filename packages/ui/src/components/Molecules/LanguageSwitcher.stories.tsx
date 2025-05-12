import { FrameQuery, OperationExecutorsProvider, Url } from '@custom/schema';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  TranslationPaths,
  TranslationsProvider,
} from '../../utils/translations';
import { Default } from '../Routes/Frame.stories';
import { LanguageSwitcher } from './LanguageSwitcher';

const TranslationsDecorator = ((Story, ctx) => {
  return (
    <OperationExecutorsProvider
      executors={[
        {
          executor: {
            ...Default.args,
            websiteSettings: {
              homePage: {
                translations: [
                  { locale: 'en', path: '/en/home' as Url },
                  { locale: 'de', path: '/de/home' as Url },
                  { locale: 'fr', path: '/french/home' as Url },
                ],
              },
            },
          },
          id: FrameQuery,
        },
      ]}
    >
      <TranslationsProvider defaultTranslations={ctx.args}>
        <Story />
      </TranslationsProvider>
    </OperationExecutorsProvider>
  );
}) as Decorator<TranslationPaths>;

export default {
  component: LanguageSwitcher,
  decorators: [TranslationsDecorator],
  parameters: {
    location: new URL('local:/en/english-version'),
    layout: 'centered',
  },
} satisfies Meta<TranslationPaths>;

type Story = StoryObj<TranslationPaths>;

export const Empty = {} satisfies Story;

export const Partial = {
  args: {
    en: '/en/english-version' as Url,
  },
} satisfies Story;

export const Full = {
  args: {
    de: '/de/german-version' as Url,
    en: '/en/english-version' as Url,
    fr: '/french/french-version' as Url,
  },
} satisfies Story;

export const Homepage = {
  args: {
    de: '/de/home' as Url,
    en: '/en/home' as Url,
    fr: '/french/home' as Url,
  },
  parameters: {
    location: new URL('local:/de'),
  },
} satisfies Story;
