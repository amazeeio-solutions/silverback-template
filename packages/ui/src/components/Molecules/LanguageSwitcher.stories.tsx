import { FrameQuery, Locale, Url } from '@custom/schema';
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
    <TranslationsProvider defaultTranslations={ctx.args}>
      <Story />
    </TranslationsProvider>
  );
}) as Decorator<TranslationPaths>;

export default {
  component: LanguageSwitcher,
  decorators: [TranslationsDecorator],
  parameters: {
    location: new URL('local:/en/english-version'),
    layout: 'centered',
    executors: {
      [FrameQuery]: {
        ...Default.parameters.executors[FrameQuery],
        websiteSettings: {
          homePage: {
            translations: [
              { locale: Locale.En, path: '/en/home' as Url },
              { locale: Locale.De, path: '/de/home' as Url },
              { locale: Locale.DeCh, path: '/de-CH/home' as Url },
              { locale: Locale.French, path: '/french/home' as Url },
            ],
          },
        },
      },
    },
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
    en: '/en/english-version' as Url,
    de: '/de/german-version' as Url,
    de_CH: '/de-CH/swiss-german-version' as Url,
    french: '/french/french-version' as Url,
  },
} satisfies Story;

export const Homepage = {
  args: {
    en: '/en/home' as Url,
    de: '/de/home' as Url,
    de_CH: '/de-CH/home' as Url,
    french: '/french/home' as Url,
  },
  parameters: {
    location: new URL('local:/de'),
  },
} satisfies Story;
