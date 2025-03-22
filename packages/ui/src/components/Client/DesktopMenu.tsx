'use client';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

import { avoidFocusOnClick } from '../../utils/avoidFocusOnClick';

export function DesktopMenu({ children }: PropsWithChildren<{}>) {
  return (
    <PopoverGroup className="hidden lg:flex lg:gap-x-12">
      {children}
    </PopoverGroup>
  );
}

export function DesktopMenuDropDown({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton
            className={clsx(
              'ml-8 flex items-center text-base font-medium hover:text-teal-600',
              open ? 'text-teal-600' : 'text-gray-900',
            )}
            onClick={() => avoidFocusOnClick()}
          >
            {title}
            <ChevronDownIcon
              className={clsx(
                'size-5 flex-none text-teal-600',
                open && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </PopoverButton>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel className="absolute left-8 top-full z-10 mt-3 w-56 rounded bg-white shadow-md ring-1 ring-gray-100">
              {children}
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

export function DesktopMenuDropdownDisclosure({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <Disclosure as="div" className="">
      {({ open }) => (
        <div className={clsx('m-1.5 rounded', open && 'bg-gray-100')}>
          <DisclosureButton
            className={clsx(
              'flex w-full items-center justify-between px-2 py-1 text-sm leading-5 hover:text-teal-600',
              open ? 'font-medium text-teal-600' : 'text-gray-500',
            )}
          >
            {title}
            <ChevronDownIcon
              className={clsx('size-5 flex-none text-teal-600', {
                'rotate-180': open,
              })}
              aria-hidden="true"
            />
          </DisclosureButton>
          <DisclosurePanel className="">{children}</DisclosurePanel>
        </div>
      )}
    </Disclosure>
  );
}
