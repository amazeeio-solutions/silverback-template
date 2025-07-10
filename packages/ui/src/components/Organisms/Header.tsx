'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { FrameQuery, Link, Url, useLocation } from '@custom/schema';
import React from 'react';
import { useForm } from 'react-hook-form';

import { isTruthy } from '../../utils/isTruthy';
import { buildNavigationTree } from '../../utils/navigation';
import { useOperation } from '../../utils/operation';
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
      <div
        className="bg-kls-orange-accent relative"
        style={{ '--header-height': '92px' } as React.CSSProperties}
      >
        <header className="container-content">
          <div className="relative box-border flex w-full flex-col content-stretch items-start justify-start gap-2.5 p-[40px] md:gap-[27px]">
            <div className="relative box-border flex w-full shrink-0 flex-col content-stretch items-start justify-start gap-[27px] p-0 md:gap-[27px]">
              {/* Top row: Logo and Meta Navigation */}
              <div className="relative box-border flex w-full shrink-0 flex-row content-stretch items-center justify-between p-0">
                <div className="flex lg:flex-1">
                  <Link
                    href={'/' as Url}
                    className="relative h-[43px] w-[161.408px] shrink-0 overflow-clip"
                  >
                    <span className="sr-only">
                      {intl.formatMessage({
                        defaultMessage: 'Company name',
                        id: 'FPGwAt',
                      })}
                    </span>
                    <KrebsligaLogo width={161.408} height={43} className={''} />
                  </Link>
                </div>

                {/* Mobile menu button */}
                <div className="flex md:hidden">
                  <MobileMenuButton className="ml-5 inline-flex cursor-pointer items-center justify-center rounded-md text-white"></MobileMenuButton>
                </div>

                {/* Meta Navigation - Desktop */}
                <div className="relative box-border hidden shrink-0 flex-row content-stretch items-center justify-end gap-10 p-0 md:flex">
                  {metaItems.map((item, key) => (
                    <div
                      key={key}
                      className="relative shrink-0 text-nowrap text-left font-['Open_Sans:Regular',_sans-serif] text-[13px] font-normal leading-[0] text-[#ffffff]"
                    >
                      <Link
                        href={item.target}
                        className="block whitespace-pre leading-[normal] hover:opacity-80"
                        activeClassName={'font-bold'}
                      >
                        {item.title}
                      </Link>
                    </div>
                  ))}
                  <LanguageSwitcher variant="header" />
                  <SearchInput />
                </div>
              </div>

              {/* Bottom row: Main Navigation and Donate Button */}
              <div className="relative box-border hidden w-full shrink-0 flex-row content-stretch items-center justify-between p-0 md:flex">
                <div className="relative box-border flex shrink-0 flex-row content-stretch items-center justify-start gap-7 p-0">
                  <HomeIconFigma locale={intl.locale} />
                  {items.map((item, key) => (
                    <div
                      key={key}
                      className="relative shrink-0 text-nowrap text-left font-['Open_Sans:Bold',_sans-serif] text-[18px] font-bold leading-[0] text-[#ffffff]"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      <Link
                        href={item.target}
                        className="block whitespace-pre leading-[1.25] hover:opacity-80"
                        activeClassName={'opacity-80'}
                      >
                        {item.title}
                      </Link>
                    </div>
                  ))}
                </div>
                <DonateButton />
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <MobileMenu>
            {/* Header replica for mobile */}
            <div className="bg-kls-orange-accent">
              <div className="container-content">
                <div className="relative box-border flex w-full flex-col content-stretch items-start justify-start gap-2.5 p-[40px]">
                  <div className="relative box-border flex w-full shrink-0 flex-col content-stretch items-start justify-start gap-[27px] p-0">
                    {/* Top row: Logo and Close Button */}
                    <div className="relative box-border flex w-full shrink-0 flex-row content-stretch items-center justify-between p-0">
                      <div className="flex lg:flex-1">
                        <Link
                          href={'/' as Url}
                          className="relative h-[43px] w-[161.408px] shrink-0 overflow-clip"
                        >
                          <span className="sr-only">
                            {intl.formatMessage({
                              defaultMessage: 'Company name',
                              id: 'FPGwAt',
                            })}
                          </span>
                          <KrebsligaLogo
                            width={161.408}
                            height={43}
                            className={''}
                          />
                        </Link>
                      </div>
                      <div className="flex">
                        <MobileMenuButton className="ml-5 inline-flex cursor-pointer items-center justify-center rounded-md text-white"></MobileMenuButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="flow-root">
                <div className="divide-gray/10 divide-y">
                  <div>
                    {items.map((item) =>
                      item.children.length === 0 ? (
                        <Link
                          key={item.title}
                          href={item.target}
                          className="copy-bold border-b-kls-orange-bright-alt text-gray-dark hover:text-kls-orange-primary block border-b px-8 py-4"
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
                            className="copy-medium text-gray-dark hover:text-kls-orange-primary block py-4 pl-10 pr-8"
                          >
                            {item.title}
                          </Link>
                          {item.children.map((child) =>
                            child.children.length === 0 ? (
                              <Link
                                key={child.target}
                                href={child.target}
                                title={child.title}
                                className="copy-medium text-gray-dark hover:text-kls-orange-primary block py-4 pl-10 pr-8"
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
              <nav className={'mt-10 flex w-full flex-col gap-y-6 px-8 pb-8'}>
                {metaItems.map((item, key) => (
                  <Link
                    key={key}
                    href={item.target}
                    className="copy-medium text-gray-dark hover:text-kls-orange-primary"
                    activeClassName={'font-bold text-kls-orange-bright'}
                  >
                    {item.title}
                  </Link>
                ))}
                <LanguageSwitcher variant="mobile" />
              </nav>
            </div>
          </MobileMenu>
        </header>
      </div>
    </MobileMenuProvider>
  );
}

function HomeIconFigma({ locale }: { locale: string }) {
  const intl = useIntl();

  // Create the localized home page URL
  const homeUrl = locale === 'en' ? '/' : `/${locale.replace('_', '-')}`;

  return (
    <Link
      href={homeUrl as Url}
      className="relative -mt-1 flex size-[19px] shrink-0 items-center justify-center overflow-clip hover:opacity-80"
    >
      <img
        alt={intl.formatMessage({
          defaultMessage: 'Home',
          id: 'ejEGdx',
        })}
        className="block size-full max-w-none"
        src="/home.svg"
        width={19}
        height={19}
      />
    </Link>
  );
}

function SearchInput() {
  const intl = useIntl();
  const [, navigate] = useLocation();
  const { register, handleSubmit } = useForm<{ query: string }>();

  const onSubmit = (data: { query: string }) => {
    if (data.query.trim()) {
      navigate('/search' as Url, { q: data.query.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative h-11 w-[207px] rounded-[50px] bg-[#ffffff]">
        <div className="relative flex size-full flex-row items-center">
          <div className="relative box-border flex size-full flex-row content-stretch items-center gap-3 px-3.5 py-2">
            <input
              {...register('query')}
              type="text"
              placeholder={intl.formatMessage({
                defaultMessage: 'Search',
                id: 'xmcVZ0',
              })}
              className="relative min-w-0 flex-1 border-none bg-transparent text-left font-['Open_Sans:Regular',_sans-serif] text-[13px] font-normal leading-[0] text-[#000000] outline-none"
              style={{ fontVariationSettings: "'wdth' 100" }}
            />
            <button
              type="submit"
              className="relative flex size-4 shrink-0 cursor-pointer items-center justify-center overflow-clip"
              data-name="icons / search"
            >
              <div
                className="absolute bottom-[20.833%] left-[12.5%] right-[20.833%] top-[12.5%]"
                data-name="Vector"
              >
                <div
                  className="absolute inset-[-7.031%]"
                  style={
                    { '--stroke-0': 'rgba(0, 0, 0, 1)' } as React.CSSProperties
                  }
                >
                  <img
                    alt={intl.formatMessage({
                      defaultMessage: 'Search',
                      id: 'xmcVZ0',
                    })}
                    className="block size-full max-w-none"
                    src="/search-icon-1.svg"
                    width={16}
                    height={16}
                  />
                </div>
              </div>
              <div
                className="absolute bottom-[12.499%] left-[69.379%] right-[12.496%] top-[69.376%]"
                data-name="Vector"
              >
                <div
                  className="absolute inset-[-25.862%]"
                  style={
                    { '--stroke-0': 'rgba(0, 0, 0, 1)' } as React.CSSProperties
                  }
                >
                  <img
                    alt=""
                    className="block size-full max-w-none"
                    src="/search-icon-2.svg"
                    width={16}
                    height={16}
                  />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function DonateButton() {
  return (
    <>
      <style>{`
        @keyframes heartbeat {
          0% {
            transform: scale(1);
          }
          14% {
            transform: scale(1.3);
          }
          28% {
            transform: scale(1);
          }
          42% {
            transform: scale(1.3);
          }
          70% {
            transform: scale(1);
          }
          100% {
            transform: scale(1);
          }
        }

        .heart-container:hover .heart-icon {
          animation: heartbeat 1.2s infinite;
        }
      `}</style>
      <button
        className="heart-container relative cursor-pointer rounded-[100px] bg-[#000000]"
        data-name="atoms/primary_button"
      >
        <div className="min-w-inherit relative flex flex-row items-center">
          <div className="min-w-inherit relative box-border flex flex-row content-stretch items-center justify-start px-6 py-3">
            <div className="relative box-border flex shrink-0 flex-row content-stretch items-center justify-start gap-2 p-0">
              <div className="relative size-5 shrink-0">
                <div className="heart-icon">
                  <img
                    alt=""
                    className="block size-5"
                    src="/heart-icon.svg"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
              <div
                className="relative shrink-0 text-nowrap text-center font-['Open_Sans:Regular',_sans-serif] text-[0px] font-normal leading-[0] text-[#ffffff]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                <p
                  className="block whitespace-pre font-['Open_Sans:Bold',_sans-serif] text-[14px] font-bold leading-none"
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  Spenden
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>
    </>
  );
}

function KrebsligaLogo({
  className,
  width,
  height,
}: {
  className?: string;
  width: number;
  height: number;
}) {
  return (
    <div
      className={`relative h-[43px] w-[161.408px] shrink-0 overflow-clip ${className}`}
    >
      <div className="absolute bottom-0 left-0 right-0 top-0">
        <img
          alt="Krebsliga Logo"
          className="block size-full max-w-none"
          src="/krebsliga-logo.svg"
          width={width}
          height={height}
        />
      </div>
    </div>
  );
}
