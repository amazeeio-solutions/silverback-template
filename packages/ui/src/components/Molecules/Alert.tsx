import { useIntl } from '@amazeelabs/react-intl';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

export function Alert({
  id = 0,
  status = 'info',
  withIcon = true,
  handleClose,
  children,
}: PropsWithChildren<{
  id?: number;
  status?: 'info' | 'warning' | 'danger' | 'success';
  withIcon?: boolean;
  handleClose?: (id: number) => void;
}>) {
  const intl = useIntl();

  // Default colors are the ones for info messages
  const colors = {
    main: 'border-blue-300 bg-blue-50 p-4 text-blue-800',
    button:
      'bg-blue-50 p-1.5 text-blue-500 hover:bg-blue-200 focus:ring-blue-400',
  };
  let srText = intl.formatMessage({
    defaultMessage: 'Info message',
    id: 'JItDH6',
  });

  switch (status) {
    case 'warning':
      colors.main =
        'border-kls-orange-accent bg-kls-orange-bright-alt p-4 text-kls-orange-accessible';
      colors.button =
        'bg-kls-orange-bright-alt p-1.5 text-kls-orange-accent hover:bg-kls-orange-bright focus:ring-kls-orange-primary';
      srText = intl.formatMessage({
        defaultMessage: 'Warning message',
        id: 'qB0/gQ',
      });
      break;
    case 'danger':
      colors.main =
        'border-kls-orange-accessible bg-gray-lightest p-4 text-kls-orange-accessible';
      colors.button =
        'bg-gray-lightest p-1.5 text-kls-orange-accessible hover:bg-gray-lighter focus:ring-kls-orange-accessible';
      srText = intl.formatMessage({
        defaultMessage: 'Danger message',
        id: 'xMJFTH',
      });
      break;
    case 'success':
      colors.main = 'border-green-300 bg-green-50 p-4 text-green-800';
      colors.button =
        'bg-green-50 p-1.5 text-green-500 hover:bg-green-200 focus:ring-green-400';
      srText = intl.formatMessage({
        defaultMessage: 'Success message',
        id: '390DRQ',
      });
      break;
  }

  return (
    <div
      className={clsx('my-4 flex items-center border-t-4', colors.main)}
      role="alert"
      aria-live="polite"
    >
      {withIcon ? (
        <svg
          className="mr-3 size-4 shrink-0"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
        </svg>
      ) : null}
      <span className="sr-only">{srText}</span>
      <div className="copy-small prose-a:font-semibold prose-a:underline">
        {children}
      </div>
      {handleClose ? (
        <button
          type="button"
          className={clsx(
            '-m-1.5 ms-auto inline-flex size-8 items-center justify-center rounded-lg  focus:ring-2 ',
            colors.button,
          )}
          data-dismiss-target={`#alert-${id}`}
          onClick={() => handleClose(id)}
          aria-label={intl.formatMessage({
            defaultMessage: 'Close message',
            id: '5Z8xEQ',
          })}
        >
          <span className="sr-only">
            {intl.formatMessage({
              defaultMessage: 'close',
              id: 'BSij1a',
            })}
          </span>
          <svg
            className="size-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
