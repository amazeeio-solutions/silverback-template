'use client';
import { Link, Locale, FrameQuery, Url } from '@custom/schema';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React, { Fragment, useEffect } from 'react';

import { useLocaleContext } from '../../utils/frame-contexts';
import { useLocale } from '../../utils/locale';
import { useOperation } from '../../utils/operation';
import { useTranslations } from '../../utils/translations';

function getLanguageName(locale: string) {
  const formattedLocale = formatLocalePath(locale);
  const languageNames = new Intl.DisplayNames([formattedLocale], {
    type: 'language',
  });
  return languageNames.of(formattedLocale);
}

/**
 * Format locale containing the country code,
 * so it's ISO 639-1 compliant in the path.
 * This is needed as GraphQL enums are not supporting dashes (-).
 *
 * @param locale
 */
function formatLocalePath(locale: Locale | string) {
  return locale.replace('_', '-');
}

export function LanguageSwitcher() {
  const translations = useTranslations();
  const locale = useLocale();
  const operation = useOperation(FrameQuery);
  const {
    currentLocale: contextLocale,
    translations: contextTranslations,
    updateLocale,
  } = useLocaleContext();

  // Update locale context when data is available
  useEffect(() => {
    if (operation.data) {
      const localeTranslations =
        operation.data.websiteSettings?.homePage?.translations?.reduce(
          (acc, translation) => {
            if (translation?.locale && translation?.path) {
              acc[translation.locale] = translation.path;
            }
            return acc;
          },
          {} as Record<Locale, string>,
        ) || {};

      updateLocale({
        currentLocale: locale,
        availableLocales: Object.keys(localeTranslations) as Locale[],
        translations: localeTranslations as Record<Locale, Url>,
        defaultLocale: 'en',
      });
    }
  }, [operation.data, locale, updateLocale]);

  // Use context locale if available, fallback to path-based detection for backward compatibility
  const currentLocale =
    contextLocale ||
    Object.entries(translations).find(([, path]) => {
      // Only use pathname detection as fallback when context is not available
      if (typeof window === 'undefined') return false;
      return path === window.location.pathname;
    })?.[0];

  // Check if context translations are meaningful (not just homepage defaults)
  // If all context translations are just homepage paths, use the translations hook instead
  const isContextTranslationsHomepageOnly =
    Object.keys(contextTranslations).length > 0 &&
    Object.values(contextTranslations).every(
      (path) => path === '/' || path?.match(/^\/[a-z]{2}(_[A-Z]{2})?$/),
    );

  // Use context translations if available and meaningful, otherwise use translations hook
  const availableTranslations =
    Object.keys(contextTranslations).length > 0 &&
    !isContextTranslationsHomepageOnly
      ? contextTranslations
      : translations;
  const isMultiLingual = Object.keys(availableTranslations).length > 1;

  return (
    <div className="relative inline-block text-left">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <React.Fragment key={currentLocale}>
            <MenuButton
              className={clsx(
                'inline-flex w-full justify-center rounded-md bg-white text-sm font-medium',
                {
                  'hover:text-blue-600': isMultiLingual,
                  'cursor-not-allowed opacity-70': !isMultiLingual,
                },
              )}
              disabled={!isMultiLingual}
            >
              {getLanguageName(currentLocale ?? 'en')}
              <ChevronDownIcon className="ml-1 size-5" aria-hidden="true" />
            </MenuButton>
          </React.Fragment>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <MenuItems className="absolute right-0 z-50 mt-3 w-48 origin-top-right rounded bg-white shadow-md ring-1 ring-gray-100">
            <div className="py-1">
              {Object.values(Locale).map((locale) => (
                <React.Fragment key={locale}>
                  {availableTranslations[locale] && locale !== currentLocale ? (
                    <MenuItem>
                      {({ focus }) =>
                        availableTranslations[locale] ? (
                          <Link
                            href={availableTranslations[locale]!}
                            className={clsx(
                              focus ? 'text-blue-600' : 'text-gray-500',
                              'block px-4 py-2 text-sm',
                            )}
                          >
                            {getLanguageName(locale as string)}
                          </Link>
                        ) : (
                          <span
                            className={clsx(
                              focus
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-500',
                              'block px-3.5 py-2 text-sm opacity-70',
                            )}
                          >
                            {getLanguageName(locale as string)}
                          </span>
                        )
                      }
                    </MenuItem>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}
