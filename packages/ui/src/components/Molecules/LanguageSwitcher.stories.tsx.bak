import {
  FrameQuery,
  Locale,
  OperationExecutorsProvider,
  Url,
} from '@custom/schema';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  TranslationPaths,
  TranslationsProvider,
} from '../../utils/translations';
import { Default } from '../Routes/Frame.stories';
import { LanguageSwitcher } from './LanguageSwitcher';

const TranslationsDecorator = ((Story, ctx) => {
  const isHeader = ctx.args.variant === 'header';
  return (
    <OperationExecutorsProvider
      executors={[
        {
          executor: {
            ...Default.args,
            websiteSettings: {
              homePage: {
                translations: [
                  { locale: Locale.En, path: '/en/home' as Url },
                  { locale: Locale.De, path: '/de/home' as Url },
                  { locale: Locale.It, path: '/it/home' as Url },
                  { locale: Locale.French, path: '/french/home' as Url },
                ],
              },
            },
          },
          id: FrameQuery,
        },
      ]}
    >
      <TranslationsProvider defaultTranslations={ctx.args}>
        <div className={isHeader ? 'bg-kls-orange-accent p-4' : 'p-4'}>
          <Story args={ctx.args} />
        </div>
      </TranslationsProvider>
    </OperationExecutorsProvider>
  );
}) as Decorator<TranslationPaths & { variant?: 'header' | 'mobile' }>;

export default {
  component: LanguageSwitcher,
  decorators: [TranslationsDecorator],
  parameters: {
    location: new URL('local:/en/english-version'),
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['header', 'mobile'],
      description: 'Visual variant of the language switcher',
    },
  },
  args: {
    variant: 'header',
  },
} satisfies Meta<TranslationPaths & { variant?: 'header' | 'mobile' }>;

type Story = StoryObj<TranslationPaths & { variant?: 'header' | 'mobile' }>;

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
    it: '/it/italian-version' as Url,
    french: '/french/french-version' as Url,
  },
} satisfies Story;

export const Homepage = {
  args: {
    en: '/en/home' as Url,
    de: '/de/home' as Url,
    it: '/it/home' as Url,
    french: '/french/home' as Url,
  },
  parameters: {
    location: new URL('local:/de'),
  },
} satisfies Story;

export const MobileVariant = {
  args: {
    variant: 'mobile',
    en: '/en/english-version' as Url,
    de: '/de/german-version' as Url,
    it: '/it/italian-version' as Url,
    french: '/french/french-version' as Url,
  },
} satisfies Story;
