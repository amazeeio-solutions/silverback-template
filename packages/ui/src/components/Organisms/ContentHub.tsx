import { useIntl } from '@amazeelabs/react-intl';
import { ContentHubQuery, ContentHubTermsQuery, Locale } from '@custom/schema';
import qs from 'query-string';
import React from 'react';

import { isTruthy } from '../../utils/isTruthy';
import { useOperation } from '../../utils/operation';
import { Alert } from '../Molecules/Alert';
import { Pagination, useCurrentPage } from '../Molecules/Pagination';
import { SearchForm, useSearchParameters } from '../Molecules/SearchForm';
import { Loading } from '../Routes/Loading';
import { CardItem } from './Card';

export type ContentHubQueryArgs = {
  title: string | undefined;
  terms: string | undefined;
  page: string | undefined;
  pageSize: string | undefined;
};

export function ContentHub({ pageSize = 10 }: { pageSize: number }) {
  const intl = useIntl();
  const page = useCurrentPage();
  const search = useSearchParameters();
  const { data, isLoading, error } = useOperation(ContentHubQuery, {
    locale: intl.locale as Locale,
    args: qs.stringify(
      {
        title: search.keyword,
        terms: search.terms === '' ? undefined : search.terms,
        page: `${page}`,
        pageSize: `${pageSize}`,
      } satisfies ContentHubQueryArgs,
      { arrayFormat: 'bracket' },
    ),
  });

  const termsResult = useOperation(ContentHubTermsQuery, {});

  if (error) {
    console.error(error);
  }
  return (
    <div className="bg-white px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SearchForm
          termOptions={termsResult?.data?.contentHubTerms.items?.filter(
            isTruthy,
          )}
        />
        {error ? (
          <div className="my-8">
            <Alert status="danger" withIcon={false}>
              {typeof error === 'string' || error instanceof String
                ? error
                : intl.formatMessage({
                    defaultMessage: 'Something has gone wrong',
                    id: 'wREPik',
                  })}
            </Alert>
          </div>
        ) : null}
        {isLoading ? <Loading /> : null}
        {data?.contentHub.total === 0 ? (
          <div className="my-8">
            <Alert status="info" withIcon>
              {intl.formatMessage({
                defaultMessage: 'No results',
                id: 'jHJmjf',
              })}
            </Alert>
          </div>
        ) : null}
        {data?.contentHub.total ? (
          <>
            <ul className="my-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {data?.contentHub.items.filter(isTruthy).map((item) => {
                return (
                  <li key={item.path}>
                    <CardItem {...item} />
                  </li>
                );
              })}
            </ul>
            <Pagination pageSize={pageSize} total={data.contentHub.total} />
          </>
        ) : null}
      </div>
    </div>
  );
}
