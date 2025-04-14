import { useIntl } from '@amazeelabs/react-intl';
import {
  BlockContentHubFragment,
  ContentHubQuery,
  ContentHubTermsQuery,
  Locale,
} from '@custom/schema';
import qs from 'query-string';
import React, { useMemo } from 'react';

import { isTruthy } from '../../utils/isTruthy';
import { useOperation } from '../../utils/operation';
import { Alert } from '../Molecules/Alert';
import { Pagination, useCurrentPage } from '../Molecules/Pagination';
import { SearchForm, useSearchParameters } from '../Molecules/SearchForm';
import { Loading } from '../Routes/Loading';
import { CardItem } from './CardItem';

export type ContentHubQueryArgs = {
  title?: string;
  terms?: string;
};

export type ContentHubPaginationArgs = {
  page?: string;
  pageSize?: string;
};

export function ContentHub(props: BlockContentHubFragment) {
  const intl = useIntl();
  const page = useCurrentPage();
  const urlSearch = useSearchParameters();

  const itemsPerPage = props.itemsPerPage || 6;
  const showFilters = props.showFilters ?? true;

  // Combine URL params with default values
  const search = useMemo(() => {
    return {
      ...urlSearch,
      title: urlSearch.title || props.defaultKeyword || undefined,
      terms:
        urlSearch.terms === ''
          ? undefined
          : urlSearch.terms || props.defaultTerm || undefined,
    };
  }, [
    urlSearch.title,
    urlSearch.terms,
    props.defaultKeyword,
    props.defaultTerm,
  ]);

  const { data, isLoading, error } = useOperation(ContentHubQuery, {
    locale: intl.locale as Locale,
    args: qs.stringify(
      {
        title: search.title,
        terms: search.terms,
        page: `${page}`,
        pageSize: `${itemsPerPage}`,
      } satisfies ContentHubQueryArgs & ContentHubPaginationArgs,
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
        <div className={showFilters ? 'block' : 'hidden'}>
          <SearchForm
            termOptions={termsResult?.data?.contentHubTerms
              ?.filter(isTruthy)
              .filter((term) => term.locale === (intl.locale as Locale))}
            defaultKeyword={props.defaultKeyword}
            defaultTerm={props.defaultTerm}
          />
        </div>
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
            <ul className="my-8 grid auto-rows-fr grid-rows-subgrid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {data?.contentHub.items.filter(isTruthy).map((item) => {
                return (
                  <li key={item.path} className="grid grid-rows-subgrid">
                    <CardItem {...item} />
                  </li>
                );
              })}
            </ul>
            <Pagination pageSize={itemsPerPage} total={data.contentHub.total} />
          </>
        ) : null}
      </div>
    </div>
  );
}
