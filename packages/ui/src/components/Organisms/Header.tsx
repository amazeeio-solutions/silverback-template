'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { FrameQuery, Link, Url } from '@custom/schema';
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
                  className="mt-px text-sm font-medium leading-6 text-gray-900 hover:text-blue-600"
                  activeClassName={'font-bold text-blue-200'}
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
              <Link
                href={`/${intl.locale}` as Url}
                className="-ml-1 mt-1 md:-mt-2.5"
              >
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
                    className="ml-8 text-base font-medium text-gray-900 hover:text-blue-600"
                    activeClassName={'font-bold text-blue-200'}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <DesktopMenuDropDown title={item.title} key={item.title}>
                    <Link
                      key={item.target}
                      href={item.target}
                      className="m-1.5 block p-2 text-sm font-bold leading-5 text-gray-900 hover:text-blue-600"
                    >
                      {item.title}
                    </Link>
                    {item.children.map((child) =>
                      child.children.length === 0 ? (
                        <Link
                          key={child.target}
                          href={child.target}
                          className="m-1.5 block p-2 text-sm leading-5 text-gray-500 hover:text-blue-600"
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
                              className="block p-2 pl-5 text-sm leading-5 text-gray-500 hover:text-blue-600"
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
                        className="block border-b border-b-blue-100 px-8 py-4 text-lg text-gray-900 hover:text-blue-600"
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
                          className="block py-4 pl-10 pr-8 text-base text-gray-900 hover:text-blue-600"
                        >
                          {item.title}
                        </Link>
                        {item.children.map((child) =>
                          child.children.length === 0 ? (
                            <Link
                              key={child.target}
                              href={child.target}
                              title={child.title}
                              className="block py-4 pl-10 pr-8 text-base text-gray-900 hover:text-blue-600"
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
                  className="text-base font-medium text-gray-900 hover:text-blue-600"
                  activeClassName={'font-bold text-blue-200'}
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
    <svg
      width={width}
      height={height}
      viewBox="0 0 168 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="mask0_176_129733"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="168"
        height="14"
      >
        <path d="M167.999 0H0V14H167.999V0Z" fill="white"></path>
      </mask>
      <g mask="url(#mask0_176_129733)">
        <path
          d="M165.267 13.4665C166.124 13.1115 166.793 12.6068 167.276 11.9537C167.758 11.3007 168 10.5279 168 9.63681C168 8.99092 167.864 8.45054 167.591 8.01709C167.318 7.58365 166.934 7.22149 166.439 6.93063C165.943 6.63976 165.372 6.4045 164.725 6.22343C164.078 6.04235 163.385 5.89406 162.65 5.77715C162.167 5.70015 161.723 5.61175 161.317 5.5148C160.911 5.41784 160.558 5.29522 160.26 5.14694C159.962 4.99866 159.729 4.81758 159.565 4.60371C159.4 4.38984 159.318 4.14175 159.318 3.85659C159.318 3.50726 159.445 3.2107 159.699 2.96403C159.952 2.71879 160.295 2.53059 160.726 2.40226C161.157 2.27394 161.653 2.20835 162.212 2.20835C162.733 2.20835 163.227 2.27679 163.697 2.41224C164.166 2.5477 164.609 2.75159 165.02 3.02249C165.432 3.29339 165.798 3.62418 166.115 4.012L167.658 2.28677C167.303 1.80913 166.864 1.39849 166.345 1.05488C165.824 0.712681 165.225 0.450333 164.546 0.269255C163.867 0.0881779 163.108 -0.00164795 162.271 -0.00164795C161.484 -0.00164795 160.757 0.0924553 160.091 0.279236C159.424 0.467443 158.836 0.735494 158.329 1.08339C157.821 1.43271 157.427 1.85618 157.149 2.35379C156.87 2.85139 156.73 3.41031 156.73 4.03053C156.73 4.65076 156.841 5.14837 157.063 5.60177C157.285 6.05375 157.612 6.4487 158.044 6.78519C158.475 7.12168 159.001 7.39544 159.624 7.60931C160.246 7.82318 160.957 7.99428 161.757 8.1226C162.1 8.17393 162.443 8.23239 162.784 8.29655C163.127 8.36214 163.456 8.43913 163.774 8.52896C164.092 8.62021 164.374 8.73285 164.621 8.8683C164.869 9.00375 165.065 9.16629 165.212 9.35307C165.358 9.54128 165.431 9.76371 165.431 10.0218C165.431 10.4096 165.281 10.7361 164.983 11.0013C164.684 11.2665 164.304 11.4661 163.84 11.603C163.377 11.7384 162.885 11.8069 162.364 11.8069C161.463 11.8069 160.623 11.6301 159.841 11.2736C159.06 10.9186 158.283 10.3069 157.509 9.44147L156.043 11.4191C156.538 11.988 157.093 12.4599 157.709 12.8349C158.325 13.2099 159.01 13.4979 159.766 13.6975C160.52 13.8971 161.349 13.9984 162.251 13.9984C163.406 13.9984 164.413 13.8201 165.27 13.4651M143.663 2.49922H147.737C148.434 2.49922 149 2.63182 149.431 2.89702C149.862 3.16222 150.078 3.56002 150.078 4.08899C150.078 4.42548 149.986 4.71635 149.802 4.96159C149.619 5.20682 149.361 5.39788 149.031 5.53333C148.7 5.66879 148.332 5.73723 147.926 5.73723H143.661V2.50064L143.663 2.49922ZM143.663 7.90873H148.137C148.581 7.90873 149.007 7.97004 149.413 8.09266C149.819 8.21528 150.149 8.40634 150.403 8.66441C150.656 8.9239 150.784 9.2661 150.784 9.69242C150.784 10.0931 150.679 10.4324 150.47 10.7104C150.26 10.9885 149.966 11.1952 149.585 11.3307C149.204 11.4661 148.754 11.5346 148.233 11.5346H143.663V7.90873ZM148.233 13.803C148.892 13.803 149.524 13.7289 150.127 13.5806C150.731 13.4323 151.27 13.2028 151.746 12.8919C152.222 12.5811 152.596 12.1676 152.869 11.6515C153.142 11.1353 153.277 10.508 153.277 9.77083C153.277 9.11211 153.135 8.53894 152.849 8.05416C152.563 7.56939 152.18 7.17444 151.697 6.87074C151.214 6.56704 150.68 6.35032 150.098 6.22057L150.04 6.60839C150.865 6.38882 151.494 6.02096 151.925 5.50339C152.356 4.98725 152.572 4.3599 152.572 3.62275C152.572 2.88561 152.394 2.28535 152.038 1.78061C151.683 1.27588 151.156 0.892333 150.457 0.627133C149.759 0.361933 148.896 0.229333 147.867 0.229333H141.24V13.8059H148.228L148.233 13.803ZM135.12 10.8174L134.511 8.62591H127.39L126.514 10.8174H135.12ZM126.361 13.803L129.998 5.48486C130.099 5.22679 130.209 4.96159 130.322 4.68926C130.437 4.41835 130.55 4.13319 130.665 3.83662C130.78 3.53863 130.886 3.24491 130.988 2.95405C131.089 2.66319 131.184 2.3823 131.274 2.10997L130.703 2.12993C130.778 2.36234 130.868 2.62469 130.969 2.91555C131.07 3.20642 131.179 3.50441 131.292 3.80811C131.407 4.11181 131.518 4.40695 131.625 4.69068C131.733 4.97442 131.838 5.22108 131.939 5.42782L135.595 13.8044H138.203L132.281 0.232184H129.786L123.845 13.8059H126.358L126.361 13.803ZM121.176 13.803V11.4761H114.532V0.232184H112.057V13.8059H121.176V13.803ZM91.2451 5.7358H83.267V7.98572H91.2451V5.7358ZM92.2924 13.803V11.5146H84.4473V2.5206H92.2168V0.232184H82.0097V13.8059H92.2924V13.803ZM76.7689 5.7358H68.7909V7.98572H76.7689V5.7358ZM77.8162 13.803V11.5146H69.9712V2.5206H77.7406V0.232184H67.5335V13.8059H77.8162V13.803ZM63.8637 13.803V11.4561H54.1327L54.9896 12.1149L63.6523 1.97737V0.232184H52.3419V2.61756H61.3868L60.53 1.91891L51.8462 12.0407V13.8059H63.8623L63.8637 13.803ZM46.2302 10.8174L45.6211 8.62591H38.5L37.6235 10.8174H46.2302ZM37.4709 13.803L41.1085 5.48486C41.2107 5.22679 41.3185 4.96159 41.4319 4.68926C41.5453 4.41693 41.6601 4.13319 41.7749 3.83662C41.8897 3.53863 41.9976 3.24491 42.0984 2.95405C42.1992 2.66319 42.2944 2.3823 42.384 2.10997L41.8127 2.12993C41.8883 2.36234 41.9779 2.62469 42.0788 2.91555C42.1796 3.20642 42.2888 3.50441 42.4022 3.80811C42.517 4.11181 42.6276 4.40695 42.7354 4.69068C42.8432 4.97442 42.9483 5.22108 43.0491 5.42782L46.7049 13.8044H49.3133L43.3907 0.232184H40.8956L34.9548 13.8059H37.4681L37.4709 13.803ZM19.8556 13.803V8.59027C19.8556 7.43964 19.8303 6.3988 19.7799 5.46775C19.7295 4.5367 19.6273 3.60564 19.4747 2.67602L19.2087 3.56857L23.6906 13.8073H25.543L30.0977 3.56715L29.8316 2.67459C29.679 3.63131 29.5768 4.57804 29.5264 5.5148C29.476 6.45298 29.4508 7.47671 29.4508 8.58884V13.8044H31.9067V0.232184H29.2058L24.042 11.7313L25.2797 11.7513L20.1356 0.232184H17.3969V13.8059H19.8528L19.8556 13.803ZM11.2754 10.8174L10.6664 8.62591H3.54238L2.66589 10.8174H11.2726H11.2754ZM2.51607 13.803L6.15367 5.48486C6.25588 5.22679 6.36369 4.96159 6.4771 4.68926C6.59191 4.41835 6.70533 4.13319 6.82014 3.83662C6.93495 3.53863 7.04136 3.24491 7.14357 2.95405C7.24579 2.66319 7.3396 2.3823 7.4292 2.10997L6.85794 2.12993C6.93355 2.36234 7.02316 2.62469 7.12397 2.91555C7.22618 3.20642 7.33399 3.50441 7.44741 3.80811C7.56222 4.11181 7.67283 4.40695 7.78064 4.69068C7.88845 4.97442 7.99347 5.22108 8.09428 5.42782L11.7501 13.8044H14.3586L8.43591 0.232184H5.94084L0 13.8059H2.51327L2.51607 13.803Z"
          fill="#1D1D1B"
        ></path>
      </g>
      <mask
        id="mask1_176_129733"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="168"
        height="14"
      >
        <path d="M168 0H0V14H168V0Z" fill="white"></path>
      </mask>
      <g mask="url(#mask1_176_129733)">
        <path
          d="M108.051 11.5175H95.9463V13.8059H108.051V11.5175Z"
          fill="#1D1D1B"
        ></path>
      </g>
    </svg>
  );
}
