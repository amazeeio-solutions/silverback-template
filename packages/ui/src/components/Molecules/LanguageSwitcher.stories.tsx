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
    // Scope within the menu for precision
    const menuWithin = within(menu);

    const germanLink = menuWithin.getByRole('menuitem', { name: 'Deutsch' });
    await expect(germanLink).toBeInTheDocument();
    await expect(germanLink).toHaveAttribute('href', '/de/german-version');

    const swissGermanLink = menuWithin.getByRole('menuitem', {
      name: 'Schweizer Hochdeutsch',
    });
    await expect(swissGermanLink).toBeInTheDocument();
    await expect(swissGermanLink).toHaveAttribute(
      'href',
      '/de-CH/swiss-german-version',
    );

    const frenchLink = menuWithin.getByRole('menuitem', { name: 'french' });
    await expect(frenchLink).toBeInTheDocument();
    await expect(frenchLink).toHaveAttribute('href', '/french/french-version');

    // Should not show current language (English) in dropdown
    const englishLink = menuWithin.queryByRole('menuitem', {
      name: 'English',
    });
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
    await expect(button).toHaveTextContent('Deutsch');

    // Should open dropdown when clicked
    await userEvent.click(button);

    // Verify dropdown menu is visible
    const menu = canvas.getByRole('menu');
    await expect(menu).toBeInTheDocument();

    // Should show alternative language options for homepage
    // Scope within the menu for precision
    const menuWithin = within(menu);

    const englishLink = menuWithin.getByRole('menuitem', { name: /English/i });
    await expect(englishLink).toBeInTheDocument();
    await expect(englishLink).toHaveAttribute('href', '/en/home');

    const swissGermanLink = menuWithin.getByRole('menuitem', {
      name: 'Schweizer Hochdeutsch',
    });
    await expect(swissGermanLink).toBeInTheDocument();
    await expect(swissGermanLink).toHaveAttribute('href', '/de-CH/home');

    const frenchLink = menuWithin.getByRole('menuitem', { name: /Français/i });
    await expect(frenchLink).toBeInTheDocument();
    await expect(frenchLink).toHaveAttribute('href', '/french/home');

    // Should not show current language (German) in dropdown
    const germanLink = menuWithin.queryByRole('menuitem', {
      name: /^Deutsch$/i,
    });
    await expect(germanLink).not.toBeInTheDocument();
  },
} satisfies Story;
