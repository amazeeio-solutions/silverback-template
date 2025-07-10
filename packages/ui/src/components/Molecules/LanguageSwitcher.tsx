'use client';
import { Link, Locale, useLocation } from '@custom/schema';
import clsx from 'clsx';
import React from 'react';

import { useTranslations } from '../../utils/translations';

export function LanguageSwitcher({
  variant = 'header',
}: {
  variant?: 'header' | 'mobile';
}) {
  const translations = useTranslations();
  const [location] = useLocation();

  const currentLocale = Object.entries(translations).find(
    ([, path]) => path === location.pathname,
  )?.[0];

  return (
    <div
      className={clsx(
        'relative',
        variant === 'header'
          ? 'shrink-0 text-nowrap text-left'
          : 'inline-block text-left',
      )}
    >
      <div
        className={clsx(
          "text-nowrap text-left font-['Open_Sans:Regular',_sans-serif] text-[13px] font-normal leading-[0]",
          {
            'text-[#ffffff]': variant === 'header',
            'text-gray-dark': variant === 'mobile',
          },
        )}
      >
        <span className="block whitespace-pre leading-[normal]">
          {Object.values(Locale).map((locale, index) => {
            const shortLocale = locale
              .replace('_', '-')
              .split('-')[0]
              .toUpperCase();
            const translationPath = translations[locale];
            const isCurrentLocale = locale === currentLocale;
            const isAvailable = !!translationPath;

            const content = (
              <span
                key={locale}
                className={clsx({
                  'font-bold': isCurrentLocale,
                  'opacity-50 cursor-not-allowed': !isAvailable,
                })}
              >
                {shortLocale}
              </span>
            );

            const linkContent =
              isAvailable && !isCurrentLocale ? (
                <Link
                  key={locale}
                  href={translationPath}
                  className={clsx('hover:opacity-80', {
                    'hover:text-kls-orange-primary': variant === 'mobile',
                  })}
                >
                  {content}
                </Link>
              ) : (
                content
              );

            return index === 0 ? (
              linkContent
            ) : (
              <React.Fragment key={`fragment-${locale}`}>
                <span> / </span>
                {linkContent}
              </React.Fragment>
            );
          })}
        </span>
      </div>
    </div>
  );
}
