'use client';
import { useIntl } from '@amazeelabs/react-intl';
import type { OperationVariables } from '@custom/schema';
import { PreviewDrupalPageQuery, useLocation } from '@custom/schema';
import React from 'react';

import { clear, useOperation } from '../../utils/operation';
import { Loading } from '../Molecules/Loading';
import { Messages } from '../Molecules/Messages';
import { PageDisplay } from '../Organisms/PageDisplay';

export function usePreviewParameters(): OperationVariables<
  typeof PreviewDrupalPageQuery
> {
  const [location] = useLocation();

  const nid = location.searchParams.get('nid');
  const rid = location.searchParams.get('rid');
  const lang = location.searchParams.get('lang');
  const previewUserId = location.searchParams.get('preview_user_id');
  const previewAccessToken = location.searchParams.get('preview_access_token');
  return {
    id: nid || '',
    rid: rid || '',
    locale: lang || 'en',
    preview_user_id: previewUserId || '',
    preview_access_token: previewAccessToken || '',
  };
}

export function usePreviewRefresh() {
  const params = usePreviewParameters();
  return (input: {
    entity_type_id?: string;
    entity_id?: string;
    langcode?: string;
    preview_user_id?: string;
    preview_access_token?: string;
  }) => {
    if (
      // TODO: Extend for non-node entities?
      input.entity_type_id === 'node' &&
      input.entity_id === params.id &&
      input.langcode === params.locale
    ) {
      clear(PreviewDrupalPageQuery, params);
    }
  };
}

export function Preview() {
  const { data, isLoading, error } = useOperation(
    PreviewDrupalPageQuery,
    usePreviewParameters(),
  );
  const intl = useIntl();
  // @todo forward error from the backend.
  // @todo 403 status code.
  const errorMessages = [
    intl.formatMessage({
      defaultMessage:
        'You do not have access to this page. Your access token might have expired.',
      id: 'iAZszQ',
    }),
  ];
  return (
    <>
      {error ? (
        <div className="flex items-center justify-center">
          <div className="my-8 rounded-full bg-red-100 px-3 py-1 text-center text-xs font-medium leading-none text-red-500">
            {error}
          </div>
        </div>
      ) : (
        <>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {data?.preview ? (
                <PageDisplay {...data.preview} />
              ) : (
                <Messages messages={errorMessages} />
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
