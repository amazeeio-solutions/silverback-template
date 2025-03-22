'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { FrameQuery, Link, Url } from '@custom/schema';
import clsx from 'clsx';
import React from 'react';

import { isTruthy } from '../../utils/isTruthy';
import { buildNavigationTree } from '../../utils/navigation';
import { useOperation } from '../../utils/operation';
import {
  DesktopMenuDropDown,
  DesktopMenuDropdownDisclosure,
} from '../Client/DesktopMenu';
import {
  MobileMenu,
  MobileMenuButton,
  MobileMenuDropdown,
  MobileMenuLink,
  MobileMenuProvider,
} from '../Client/MobileMenu';
import { LanguageSwitcher } from '../Molecules/LanguageSwitcher';

function useHeaderNavigation(lang: string = 'en') {
  return (
    useOperation(FrameQuery)
      .data?.mainNavigation?.filter((nav) => nav?.locale === lang)
      .pop()
      ?.items.filter(isTruthy) || []
  );
}
function useMetaNavigation(lang: string = 'en') {
  return (
    useOperation(FrameQuery)
      .data?.metaNavigation?.filter((nav) => nav?.locale === lang)
      .pop()
      ?.items.filter(isTruthy) || []
  );
}

export function Header() {
  const intl = useIntl();
  const items = buildNavigationTree(useHeaderNavigation(intl.locale));

  const metaItems = buildNavigationTree(useMetaNavigation(intl.locale));

  return (
    <MobileMenuProvider>
      <div className="container-page">
        <header className="container-content">
          <div className="hidden border-b border-gray-200 py-2 md:flex md:gap-x-8 md:align-bottom">
            <nav className={'flex w-full justify-end gap-x-6'}>
              {metaItems.map((item, key) => (
                <Link
                  key={key}
                  href={item.target}
                  className="mt-px text-sm font-medium leading-6 text-gray-900 hover:text-teal-600"
                  activeClassName={'font-bold text-teal-200'}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <UserActions />
          </div>
          <nav
            className="relative z-20 mx-auto flex items-center justify-between border-b border-b-gray-200 py-6"
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <Link href={'/' as Url} className="-ml-1 mt-1 md:-mt-2.5">
                <span className="sr-only">
                  {intl.formatMessage({
                    defaultMessage: 'Company name',
                    id: 'FPGwAt',
                  })}
                </span>
                <SiteLogo
                  width={213}
                  height={59}
                  className={'hidden lg:block'}
                />
                <SiteLogo
                  width={160}
                  height={40}
                  className={'block lg:hidden'}
                />
              </Link>
            </div>
            <div className="flex md:hidden">
              <UserActions />
              <MobileMenuButton className="ml-5 inline-flex cursor-pointer items-center justify-center rounded-md text-gray-700 sm:ml-7"></MobileMenuButton>
            </div>
            <div className={'hidden md:flex'}>
              {items.map((item, key) =>
                item.children.length === 0 ? (
                  <Link
                    key={key}
                    href={item.target}
                    className="ml-8 text-base font-medium text-gray-900 hover:text-teal-600"
                    activeClassName={'font-bold text-teal-200'}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <DesktopMenuDropDown title={item.title} key={item.title}>
                    <Link
                      key={item.target}
                      href={item.target}
                      className="m-1.5 block p-2 text-sm font-bold leading-5 text-gray-900 hover:text-teal-600"
                    >
                      {item.title}
                    </Link>
                    {item.children.map((child) =>
                      child.children.length === 0 ? (
                        <Link
                          key={child.target}
                          href={child.target}
                          className="m-1.5 block p-2 text-sm leading-5 text-gray-500 hover:text-teal-600"
                        >
                          {child.title}
                        </Link>
                      ) : (
                        <DesktopMenuDropdownDisclosure
                          title={child.title}
                          key={child.title}
                        >
                          {child.children.map((grandChild) => (
                            <Link
                              key={grandChild.target}
                              href={grandChild.target}
                              className="block p-2 pl-5 text-sm leading-5 text-gray-500 hover:text-teal-600"
                            >
                              {grandChild.title}
                            </Link>
                          ))}
                        </DesktopMenuDropdownDisclosure>
                      ),
                    )}
                  </DesktopMenuDropDown>
                ),
              )}
            </div>
          </nav>
          <MobileMenu>
            <div className="flow-root">
              <div className="divide-y divide-gray-500/10">
                <div>
                  {items.map((item) =>
                    item.children.length === 0 ? (
                      <Link
                        key={item.title}
                        href={item.target}
                        className="block border-b border-b-teal-100 px-8 py-4 text-lg text-gray-900 hover:text-teal-600"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <MobileMenuDropdown
                        title={item.title}
                        key={item.title}
                        nestLevel={1}
                      >
                        <Link
                          key={item.target}
                          href={item.target}
                          title={item.title}
                          className="block py-4 pl-10 pr-8 text-base text-gray-900 hover:text-teal-600"
                        >
                          {item.title}
                        </Link>
                        {item.children.map((child) =>
                          child.children.length === 0 ? (
                            <Link
                              key={child.target}
                              href={child.target}
                              title={child.title}
                              className="block py-4 pl-10 pr-8 text-base text-gray-900 hover:text-teal-600"
                            >
                              {child.title}
                            </Link>
                          ) : (
                            <MobileMenuDropdown
                              title={child.title}
                              key={child.title}
                              nestLevel={2}
                            >
                              {child.children.map((grandChild) => (
                                <MobileMenuLink
                                  key={grandChild.target}
                                  href={grandChild.target}
                                  title={grandChild.title}
                                />
                              ))}
                            </MobileMenuDropdown>
                          ),
                        )}
                      </MobileMenuDropdown>
                    ),
                  )}
                </div>
              </div>
            </div>
            <nav className={'mt-10 flex w-full flex-col gap-y-6 px-8'}>
              {metaItems.map((item, key) => (
                <Link
                  key={key}
                  href={item.target}
                  className="text-base font-medium text-gray-900 hover:text-teal-600"
                  activeClassName={'font-bold text-teal-200'}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </MobileMenu>
        </header>
      </div>
    </MobileMenuProvider>
  );
}

function UserActions() {
  return (
    <div>
      <LanguageSwitcher />
    </div>
  );
}

export const Logo: React.FC<{
  forceFullLogo?: boolean;
  forceIcon?: boolean;
  fullColor?: boolean;
  className?: string;
  width: number;
  height: number;
}> = ({
  forceFullLogo = false,
  forceIcon = false,
  fullColor = true,
  className,
  width,
  height,
}) => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 523.34 109.64"
      width={width}
      height={height}
      className={clsx(className, {
        'hidden md:block': !forceFullLogo && !forceIcon,
        hidden: forceIcon,
      })}
      style={{ maxWidth: '200px' }}
    >
      <title>responsAbility Logo</title>
      <path
        d="M134.59,87.37V70.9a7.33,7.33,0,0,1,1.72-5.27,6.77,6.77,0,0,1,5.11-1.78h2.77V55.37H143a8.8,8.8,0,0,0-5.17,1.51A12.23,12.23,0,0,0,134,61.6V56.2h-7.76V87.37Zm31.18-6.83a6.63,6.63,0,0,1-3.54.85,5.83,5.83,0,0,1-4.67-1.87,8.91,8.91,0,0,1-1.8-5.54h20.81a8.12,8.12,0,0,0,.07-.85V71.8q0-8-3.89-12.38T161.7,55.08q-6.76,0-10.66,4.41t-3.89,12.07c0,5.17,1.32,9.28,4,12.3a13.5,13.5,0,0,0,10.72,4.55,15.41,15.41,0,0,0,9.33-2.8,13.3,13.3,0,0,0,5.09-7.73H168a5.81,5.81,0,0,1-2.19,2.66m-8.19-16.86A5.59,5.59,0,0,1,161.87,62a5.89,5.89,0,0,1,4.49,1.66,7.14,7.14,0,0,1,1.68,4.8H155.76a7.71,7.71,0,0,1,1.82-4.79M180.35,77.5a9.65,9.65,0,0,0,3.64,8q3.64,2.91,10.11,2.91,7.14,0,10.89-2.79a9.49,9.49,0,0,0,3.74-8.11,7.39,7.39,0,0,0-2.29-5.8q-2.28-2.05-8.53-3.51c-.56-.14-1.31-.31-2.26-.52-4.14-1-6.21-2.05-6.21-3.28a2.38,2.38,0,0,1,1.16-2.15,6.94,6.94,0,0,1,3.53-.71,6.31,6.31,0,0,1,3.93,1.09,3.84,3.84,0,0,1,1.51,3.05h8.13a10,10,0,0,0-3.79-7.82q-3.57-2.78-9.81-2.78-5.9,0-9.35,2.79a9.2,9.2,0,0,0-3.44,7.57,7.31,7.31,0,0,0,2.35,5.72q2.35,2.11,8.41,3.66,1.22.32,3.27.75,5,1.05,5,3.18a2.55,2.55,0,0,1-1.34,2.3,7.27,7.27,0,0,1-3.8.82,8.33,8.33,0,0,1-4.85-1.16,4.37,4.37,0,0,1-1.73-3.55h-8.29Zm54.07,1.18a5.81,5.81,0,0,1-4.95,2.46,6.06,6.06,0,0,1-5.14-2.4A11,11,0,0,1,222.51,72q0-4.71,1.73-7.17a5.79,5.79,0,0,1,5.06-2.46,6,6,0,0,1,5.15,2.47q1.77,2.47,1.77,7.16a11.19,11.19,0,0,1-1.8,6.73m-11.91,21.2V83.45a10.65,10.65,0,0,0,3.88,3.69,11.57,11.57,0,0,0,14.55-3.39q3.57-4.65,3.58-12.13T240.94,59.7a11.32,11.32,0,0,0-9.35-4.54,10.48,10.48,0,0,0-5.23,1.26,12.14,12.14,0,0,0-4,4V56.2h-8V99.89ZM258.94,64.6a7.08,7.08,0,0,1,10.8,0q1.88,2.5,1.88,7.11c0,3.1-.63,5.48-1.9,7.16a7,7,0,0,1-9.86.92,6.67,6.67,0,0,1-.92-.92c-1.27-1.68-1.91-4.06-1.91-7.16s.64-5.44,1.91-7.11M252.79,84q4.22,4.44,11.58,4.44T275.93,84c2.82-3,4.23-7,4.23-12.24s-1.41-9.25-4.23-12.21-6.67-4.44-11.56-4.44-8.77,1.48-11.58,4.44-4.21,7-4.21,12.21S250,81,252.79,84m41.43,3.4V68.89a6.52,6.52,0,0,1,1.72-4.79,6.15,6.15,0,0,1,4.65-1.77,4.4,4.4,0,0,1,3.67,1.44c.75.95,1.12,2.55,1.12,4.78V87.37h8.38V66.15q0-5.4-2.57-8.07c-1.71-1.78-4.29-2.67-7.72-2.68a12.22,12.22,0,0,0-5.29,1.13,11.29,11.29,0,0,0-4.13,3.38V56.2h-8.2V87.37Zm24.84-9.86a9.66,9.66,0,0,0,3.65,8q3.63,2.91,10.1,2.91,7.14,0,10.89-2.79a9.49,9.49,0,0,0,3.74-8.11,7.39,7.39,0,0,0-2.29-5.8q-2.28-2.06-8.54-3.51c-.55-.14-1.3-.31-2.25-.52-4.14-1-6.21-2-6.21-3.28a2.38,2.38,0,0,1,1.16-2.15,6.94,6.94,0,0,1,3.53-.71,6.31,6.31,0,0,1,3.93,1.09,3.85,3.85,0,0,1,1.5,3h8.14a10,10,0,0,0-3.8-7.82q-3.56-2.77-9.8-2.78-5.9,0-9.34,2.79A9.2,9.2,0,0,0,320,65.44a7.32,7.32,0,0,0,2.36,5.72q2.36,2.11,8.41,3.66c.81.21,1.9.46,3.26.75,3.36.7,5,1.76,5,3.18a2.56,2.56,0,0,1-1.34,2.3,7.27,7.27,0,0,1-3.8.82A8.33,8.33,0,0,1,329,80.71a4.37,4.37,0,0,1-1.73-3.55H319v.35"
        transform="translate(0 0)"
        style={{ fill: 'currentColor' }}
      />
      <path
        d="M375.19,71.58H363.47l5.85-17.94ZM349.26,87.37h9.14l2.78-8.69h16.37l2.86,8.69h9.12L374.31,45.19h-10l-15,42.18"
        transform="translate(0 0)"
        style={{ fill: 'currentColor' }}
      />
      <path
        d="M393.34,87.37h8V83.13a12.14,12.14,0,0,0,4,4,10.28,10.28,0,0,0,5.23,1.27,11.34,11.34,0,0,0,9.34-4.56q3.58-4.55,3.58-11.94t-3.58-12.1a11.62,11.62,0,0,0-14.54-3.4,10.44,10.44,0,0,0-3.88,3.7V45.19h-8.14Zm20.08-8.61a6,6,0,0,1-5.16,2.47,5.82,5.82,0,0,1-5.05-2.45c-1.16-1.64-1.73-4-1.73-7.2q0-4.39,1.81-6.78a6.1,6.1,0,0,1,5.14-2.39,5.84,5.84,0,0,1,5,2.45,11,11,0,0,1,1.8,6.72q0,4.71-1.77,7.18m24.26-33.57h-8.37v7.57h8.37Zm0,11h-8.37V87.37h8.37Zm16-11h-8.37V87.37h8.37Zm16,0H461.4v7.57h8.37Zm0,11H461.4V87.37h8.37ZM491,81.31h-2a4.25,4.25,0,0,1-2.22-.39,1.87,1.87,0,0,1-.54-1.62V62H491V56.2h-4.78V47.75H478V56.2h-4.1V62H478V78.9c0,3.52.58,5.88,1.76,7.08s3.36,1.79,6.55,1.79c.29,0,1,0,2-.07s2-.08,2.73-.1Zm7.86,18.76c.59,0,1.15.06,1.66.06,2.87,0,5-.5,6.44-1.51s2.63-2.88,3.58-5.63l12.8-36.79H514.6l-6.39,22.48L501.66,56.2H492.5l11.22,31.54a2.63,2.63,0,0,0,.12.43,3.29,3.29,0,0,1,.05.44,4.6,4.6,0,0,1-1.23,3.5A5.23,5.23,0,0,1,499,93.27h-1.12a5.7,5.7,0,0,1-.83-.09V99.9c.65.08,1.27.13,1.86.17"
        transform="translate(0 0)"
        style={{ fill: 'currentColor' }}
      />
      <polygon
        points="105.1 109.64 63.98 0 43.12 28.58 73.54 109.64 105.1 109.64"
        style={{ fill: fullColor ? '#0D6361' : 'currentColor' }}
      />
      <path
        d="M39.2,51.18a24.88,24.88,0,0,0-23,15.28L16,67,0,109.64H31.57L52.15,54.78A25,25,0,0,0,39.2,51.18Z"
        transform="translate(0 0)"
        style={{ fill: 'currentColor' }}
      />
    </svg>
    {(!forceFullLogo || forceIcon) && (
      <Icon forceIcon={forceIcon} fullColor={forceIcon} />
    )}
  </>
);

export const Icon: React.FC<{ forceIcon?: boolean; fullColor?: boolean }> = ({
  forceIcon = false,
  fullColor = false,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 105.1 109.64"
    className={clsx({
      'w-full block md:hidden': !forceIcon,
      'w-full block': forceIcon,
    })}
    style={{ maxWidth: '100px' }}
  >
    <title>responsAbility Logo icon</title>
    <polygon
      points="105.1 109.64 63.98 0 43.12 28.58 73.54 109.64 105.1 109.64"
      style={{ fill: fullColor ? '#0D6361' : 'currentColor' }}
    />
    <path
      d="M39.2,51.18a24.88,24.88,0,0,0-23,15.28L16,67,0,109.64H31.57L52.15,54.78A25,25,0,0,0,39.2,51.18Z"
      transform="translate(0 0)"
      style={{ fill: 'currentColor' }}
    />
  </svg>
);

function SiteLogo({
  className,
  width,
  height,
}: {
  className?: string;
  width: number;
  height: number;
}) {
  return (
    <Logo
      forceFullLogo={true}
      forceIcon={false}
      fullColor={true}
      className={className}
      width={width}
      height={height}
    />
  );
}
