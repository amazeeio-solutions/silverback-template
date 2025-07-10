import { useIntl } from '@amazeelabs/react-intl';
import { Link, useLocation } from '@custom/schema';
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React from 'react';
import { z } from 'zod';

export const paginationParamsSchema = z.object({
  page: z.coerce.number().default(1),
});

export function useCurrentPage(): number {
  const [location] = useLocation();
  return paginationParamsSchema.parse(
    Object.fromEntries(new URLSearchParams(location.search).entries()),
  ).page;
}

export function Pagination(props: { total: number; pageSize: number }) {
  const currentPage = useCurrentPage();
  const intl = useIntl();
  const totalPages = Math.ceil(props.total / props.pageSize);
  const [location] = useLocation();
  const arrowCls =
    'copy-small inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-gray';

  return (
    <nav className="border-gray-light flex items-center justify-between border-t px-4 sm:px-0">
      <div className="-mt-px flex w-0 flex-1">
        {currentPage === 1 ? (
          <span className={clsx('opacity-50', arrowCls)} aria-hidden={true}>
            <ArrowLongLeftIcon
              className="text-gray mr-3 h-5 w-5"
              aria-hidden="true"
            />
            {intl.formatMessage({ defaultMessage: 'Previous', id: 'JJNc3c' })}
          </span>
        ) : (
          <Link
            href={location}
            search={{ page: Math.max(currentPage - 1, 1) }}
            className={clsx(
              'hover:border-gray-light hover:text-gray-dark',
              arrowCls,
            )}
          >
            <ArrowLongLeftIcon
              className="text-gray mr-3 h-5 w-5"
              aria-hidden="true"
            />
            {intl.formatMessage({ defaultMessage: 'Previous', id: 'JJNc3c' })}
          </Link>
        )}
      </div>
      <div className="hidden md:-mt-px md:flex">
        <span className="copy-small border-kls-orange-primary text-kls-orange-primary inline-flex items-center border-t-2 px-4 pt-4">
          {intl.formatMessage(
            { defaultMessage: '{current} of {total}', id: 'stJYEY' },
            {
              current: currentPage,
              total: totalPages,
            },
          )}
        </span>
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        {currentPage === totalPages ? (
          <span className={clsx('opacity-50', arrowCls)} aria-hidden={true}>
            {intl.formatMessage({ defaultMessage: 'Next', id: '9+Ddtu' })}
            <ArrowLongRightIcon
              className="text-gray ml-3 h-5 w-5"
              aria-hidden="true"
            />
          </span>
        ) : (
          <Link
            href={location}
            search={{
              page: Math.min(currentPage + 1, totalPages),
            }}
            className={clsx(
              'hover:border-gray-light hover:text-gray-dark',
              arrowCls,
            )}
          >
            {intl.formatMessage({ defaultMessage: 'Next', id: '9+Ddtu' })}
            <ArrowLongRightIcon
              className="text-gray ml-3 h-5 w-5"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </nav>
  );
}
