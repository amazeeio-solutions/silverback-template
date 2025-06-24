import {
  FrameQuery,
  Locale,
  OperationExecutorsProvider,
  Url,
} from '@custom/schema';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import React from 'react';

import {
  TranslationPaths,
  TranslationsProvider,
} from '../../utils/translations';
import { FrameProvider } from '../../utils/frame-provider';
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
                  { locale: Locale.En, path: '/en/home' as Url },
                  { locale: Locale.De, path: '/de/home' as Url },
                  { locale: Locale.DeCh, path: '/de-CH/home' as Url },
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

export const Empty = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show default language (English) with disabled state
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toBeDisabled();
    await expect(button).toHaveTextContent('English');
    
    // Should not open dropdown when disabled
    await userEvent.click(button);
    const menu = canvas.queryByRole('menu');
    await expect(menu).not.toBeInTheDocument();
  },
} satisfies Story;

export const Partial = {
  args: {
    en: '/en/english-version' as Url,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show current language with disabled state (only one language available)
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toBeDisabled();
    await expect(button).toHaveTextContent('English');
    
    // Should not open dropdown when only one language is available
    await userEvent.click(button);
    const menu = canvas.queryByRole('menu');
    await expect(menu).not.toBeInTheDocument();
  },
} satisfies Story;

export const Full = {
  args: {
    en: '/en/english-version' as Url,
    de: '/de/german-version' as Url,
    de_CH: '/de-CH/swiss-german-version' as Url,
    french: '/french/french-version' as Url,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show current language and be enabled for multiple languages
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();
    await expect(button).toHaveTextContent('English');
    
    // Should open dropdown when clicked
    await userEvent.click(button);
    
    // Verify dropdown menu is visible
    const menu = canvas.getByRole('menu');
    await expect(menu).toBeInTheDocument();
    
    // Should show alternative language options (all except current)
    const germanLink = canvas.getByRole('menuitem', { name: /German/i });
    await expect(germanLink).toBeInTheDocument();
    await expect(germanLink).toHaveAttribute('href', '/de/german-version');
    
    const swissGermanLink = canvas.getByRole('menuitem', { name: /German \(Switzerland\)/i });
    await expect(swissGermanLink).toBeInTheDocument();
    await expect(swissGermanLink).toHaveAttribute('href', '/de-CH/swiss-german-version');
    
    const frenchLink = canvas.getByRole('menuitem', { name: /French/i });
    await expect(frenchLink).toBeInTheDocument();
    await expect(frenchLink).toHaveAttribute('href', '/french/french-version');
    
    // Should not show current language (English) in dropdown
    const englishLink = canvas.queryByRole('menuitem', { name: /English/i });
    await expect(englishLink).not.toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show current language (German) for homepage
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();
    await expect(button).toHaveTextContent('German');
    
    // Should open dropdown when clicked
    await userEvent.click(button);
    
    // Verify dropdown menu is visible
    const menu = canvas.getByRole('menu');
    await expect(menu).toBeInTheDocument();
    
    // Should show alternative language options for homepage
    const englishLink = canvas.getByRole('menuitem', { name: /English/i });
    await expect(englishLink).toBeInTheDocument();
    await expect(englishLink).toHaveAttribute('href', '/en/home');
    
    const swissGermanLink = canvas.getByRole('menuitem', { name: /German \(Switzerland\)/i });
    await expect(swissGermanLink).toBeInTheDocument();
    await expect(swissGermanLink).toHaveAttribute('href', '/de-CH/home');
    
    const frenchLink = canvas.getByRole('menuitem', { name: /French/i });
    await expect(frenchLink).toBeInTheDocument();
    await expect(frenchLink).toHaveAttribute('href', '/french/home');
    
    // Should not show current language (German) in dropdown
    const germanLink = canvas.queryByRole('menuitem', { name: /^German$/i });
    await expect(germanLink).not.toBeInTheDocument();
  },
} satisfies Story;

// Test the new LocaleContext functionality
export const WithContext = {
  decorators: [
    (Story) => (
      <FrameProvider
        currentLocale={Locale.De}
        availableLocales={[Locale.En, Locale.De, Locale.DeCh]}
        translations={{
          en: '/en/context-page' as Url,
          de: '/de/context-page' as Url,
          de_CH: '/de-CH/context-page' as Url,
        }}
        defaultLocale={Locale.En}
      >
        <Story />
      </FrameProvider>
    ),
  ],
  parameters: {
    // Remove the TranslationsDecorator for this story to test pure context
    decorators: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should show current language from context (German)
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();
    await expect(button).toHaveTextContent('German');
    
    // Should open dropdown when clicked
    await userEvent.click(button);
    
    // Verify dropdown uses context translations
    const menu = canvas.getByRole('menu');
    await expect(menu).toBeInTheDocument();
    
    const englishLink = canvas.getByRole('menuitem', { name: /English/i });
    await expect(englishLink).toBeInTheDocument();
    await expect(englishLink).toHaveAttribute('href', '/en/context-page');
    
    const swissGermanLink = canvas.getByRole('menuitem', { name: /German \(Switzerland\)/i });
    await expect(swissGermanLink).toBeInTheDocument();
    await expect(swissGermanLink).toHaveAttribute('href', '/de-CH/context-page');
    
    // Should not show current language in dropdown
    const germanLink = canvas.queryByRole('menuitem', { name: /^German$/i });
    await expect(germanLink).not.toBeInTheDocument();
  },
} satisfies StoryObj;

// Test homepage context fallback behavior
export const HomepageContextFallback = {
  decorators: [
    (Story) => (
      <OperationExecutorsProvider
        executors={[
          {
            executor: {
              ...Default.args,
              websiteSettings: {
                homePage: {
                  translations: [
                    { locale: Locale.En, path: '/en' as Url },
                    { locale: Locale.De, path: '/de' as Url },
                    { locale: Locale.DeCh, path: '/de-CH' as Url },
                  ],
                },
              },
            },
            id: FrameQuery,
          },
        ]}
      >
        <FrameProvider
          currentLocale={Locale.En}
          availableLocales={[Locale.En, Locale.De, Locale.DeCh]}
          translations={{
            en: '/' as Url,
            de: '/de' as Url,
            de_CH: '/de-CH' as Url,
          }}
          defaultLocale={Locale.En}
        >
          <TranslationsProvider
            defaultTranslations={{
              en: '/en/specific-page' as Url,
              de: '/de/specific-page' as Url,
              de_CH: '/de-CH/specific-page' as Url,
            }}
          >
            <Story />
          </TranslationsProvider>
        </FrameProvider>
      </OperationExecutorsProvider>
    ),
  ],
  parameters: {
    // Remove default decorators to test custom setup
    decorators: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Should detect homepage context and fallback to TranslationsProvider
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();
    await expect(button).toHaveTextContent('English');
    
    // Should open dropdown when clicked
    await userEvent.click(button);
    
    // Should use the TranslationsProvider data instead of homepage context
    const menu = canvas.getByRole('menu');
    await expect(menu).toBeInTheDocument();
    
    const germanLink = canvas.getByRole('menuitem', { name: /German/i });
    await expect(germanLink).toBeInTheDocument();
    await expect(germanLink).toHaveAttribute('href', '/de/specific-page');
    
    const swissGermanLink = canvas.getByRole('menuitem', { name: /German \(Switzerland\)/i });
    await expect(swissGermanLink).toBeInTheDocument();
    await expect(swissGermanLink).toHaveAttribute('href', '/de-CH/specific-page');
  },
} satisfies StoryObj;
