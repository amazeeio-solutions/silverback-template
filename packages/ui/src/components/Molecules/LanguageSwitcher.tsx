'use client';
import { Link, Locale } from '@custom/schema';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React, { Fragment } from 'react';

import { useLocaleContext } from '../../contexts/FrameProvider';
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
  
  // Get current locale from context, fallback to useTranslations if context not available
  let currentLocale: string | undefined;
  let currentPath: string | undefined;
  
  try {
    const { localeState } = useLocaleContext();
    currentLocale = localeState.currentLocale;
    currentPath = localeState.translations[localeState.currentLocale];
  } catch {
    // Fallback to the old logic when context is not available
    // This provides backward compatibility during migration
    currentLocale = 'en'; // fallback to default
    currentPath = undefined;
  }
  
  const isMultiLingual = Object.keys(translations).length > 1;

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
                  {translations[locale] &&
                  currentPath !== translations[locale] ? (
                    <MenuItem>
                      {({ focus }) =>
                        translations[locale] ? (
                          <Link
                            href={translations[locale]!}
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
