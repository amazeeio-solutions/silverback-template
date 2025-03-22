'use client';
import { useIntl } from '@amazeelabs/react-intl';
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React, { createContext, PropsWithChildren } from 'react';

const MobileMenuContext = createContext({
  isOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsOpen: (isOpen: boolean) => {},
});

export function MobileMenuProvider({ children }: PropsWithChildren<{}>) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <MobileMenuContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function MobileMenuButton(
  props: PropsWithChildren<{ className?: string }>,
) {
  const { isOpen, setIsOpen } = React.useContext(MobileMenuContext);
  const intl = useIntl();
  return (
    <button
      type="button"
      className={props.className}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span className="sr-only">
        {intl.formatMessage({
          defaultMessage: 'Open main navigation',
          id: 'e7yFQY',
        })}
      </span>
      {!isOpen ? <HamburgerLogo /> : <CloseIcon />}
    </button>
  );
}

export function MobileMenu({ children }: PropsWithChildren<{}>) {
  const { isOpen, setIsOpen } = React.useContext(MobileMenuContext);
  return (
    <Dialog as="div" className="lg:hidden" open={isOpen} onClose={setIsOpen}>
      <div className="fixed inset-0 z-10" />
      <DialogPanel className="fixed inset-y-0 right-0 top-[5.75rem] z-20 w-full overflow-y-auto border-t border-t-blue-100 bg-white py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
        {children}
      </DialogPanel>
    </Dialog>
  );
}

export function MobileMenuLink({
  title,
  href,
}: {
  href: string;
  title: string;
}) {
  return (
    <DisclosureButton
      as="a"
      href={href}
      className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
    >
      {title}
    </DisclosureButton>
  );
}

export function MobileMenuDropdown({
  title,
  children,
  nestLevel,
}: PropsWithChildren<{ title: string; nestLevel: number }>) {
  return (
    <Disclosure as="div" className="">
      {({ open }) => (
        <div
          className={clsx(
            '',
            open && nestLevel === 2 && 'mx-8 rounded bg-gray-100',
          )}
        >
          <DisclosureButton
            className={clsx(
              'flex w-full items-center justify-between py-4 leading-5',
              open && 'text-teal-600',
              !open && 'text-gray-900',
              open && nestLevel === 1 && 'bg-teal-100',
              !open && nestLevel === 1 && 'border-b border-b-blue-100',
              nestLevel === 1 && 'px-8 text-lg',
              !open && nestLevel === 2 && 'px-10',
              open && nestLevel === 2 && 'px-2',
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

function HamburgerLogo() {
  return (
    <svg
      width="21"
      height="23"
      viewBox="0 0 21 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.03394 0.00125289H19.8146C21.3951 -0.0663573 21.3951 2.62517 19.8146 2.55756H5.09285C3.54107 2.62517 3.48072 0.00125289 5.0325 0.00125289H5.03394ZM19.8146 10.2233C21.3348 10.2233 21.3348 12.778 19.8146 12.778H11.481C9.92922 12.778 9.92922 10.2233 11.481 10.2233H19.8146ZM19.8146 20.4453C21.3348 20.4453 21.3348 23 19.8146 23H1.14013C-0.380039 23 -0.380039 20.4453 1.14013 20.4453H19.8146Z"
        fill="#1A56DB"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.3493 10.4989L20.612 2.24836C20.859 2.00136 20.9978 1.66636 20.9978 1.31706C20.9978 0.967751 20.859 0.632753 20.612 0.385757C20.3651 0.138761 20.0301 0 19.6808 0C19.3316 0 18.9966 0.138761 18.7496 0.385757L10.5 8.6494L2.25035 0.385757C2.00338 0.138761 1.66842 3.10129e-07 1.31915 3.12731e-07C0.969886 3.15334e-07 0.634924 0.138761 0.387954 0.385757C0.140984 0.632753 0.00223861 0.967751 0.0022386 1.31706C0.0022386 1.66636 0.140984 2.00136 0.387954 2.24836L8.65072 10.4989L0.387954 18.7494C0.265025 18.8713 0.167453 19.0164 0.100868 19.1763C0.0342819 19.3361 0 19.5075 0 19.6807C0 19.8539 0.0342819 20.0253 0.100868 20.1852C0.167453 20.345 0.265025 20.4901 0.387954 20.612C0.50988 20.7349 0.654938 20.8325 0.814763 20.8991C0.974587 20.9657 1.14601 21 1.31915 21C1.49229 21 1.66372 20.9657 1.82355 20.8991C1.98337 20.8325 2.12843 20.7349 2.25035 20.612L10.5 12.3484L18.7496 20.612C18.8716 20.7349 19.0166 20.8325 19.1765 20.8991C19.3363 20.9657 19.5077 21 19.6808 21C19.854 21 20.0254 20.9657 20.1852 20.8991C20.3451 20.8325 20.4901 20.7349 20.612 20.612C20.735 20.4901 20.8325 20.345 20.8991 20.1852C20.9657 20.0253 21 19.8539 21 19.6807C21 19.5075 20.9657 19.3361 20.8991 19.1763C20.8325 19.0164 20.735 18.8713 20.612 18.7494L12.3493 10.4989Z"
        fill="#1A56DB"
      />
    </svg>
  );
}
