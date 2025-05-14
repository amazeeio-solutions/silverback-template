'use client';
import { useIntl } from '@amazeelabs/react-intl';
import {
  OperationVariables,
  PreviewDrupalPageQuery,
  useLocation,
} from '@custom/schema';
import React from 'react';

import { clear, useOperation } from '../../utils/operation';
import { Loading } from '../Molecules/Loading';
import { Messages } from '../Molecules/Messages';
import { PageDisplay } from '../Organisms/PageDisplay';

function usePreviewParameters(): OperationVariables<
  typeof PreviewDrupalPageQuery
> {
  const [location] = useLocation();

  // @todo: the homepage in preview mode is an edge case because in the CMS
  // there is a separate settings (in the Website settings) where the homepage
  // is set. We'd have a few options here:
  // 1. Make the CMS fetchEntity data producer check for the homepage settings
  // in the Website settings.
  // 2. Update the PreviewDrupalPageQuery so that it inlcudes the website
  // settings (right now, if we run the try to get the websiteSetting field it
  // will just return null).
  // This would need a follow-up, and until then we just have this hardcoded
  // mapping for the homepage paths.
  const hompagePaths = new Map<string, string>();
  hompagePaths.set('/', '/en/architecture');
  hompagePaths.set('', '/en/architecture');
  hompagePaths.set('/en', '/en/architecture');
  hompagePaths.set('/de', '/de/architektur');

  const pathName = hompagePaths.has(location.pathname)
    ? hompagePaths.get(location.pathname)
    : location.pathname;

  return {
    path: pathName || '',
    rid: location.searchParams.get('rid') || '',
  };
}

export function usePreviewRefresh() {
  const params = usePreviewParameters();
  return (input: { entity_type_id?: string; entity_id?: string }) => {
    if (
      // TODO: Extend for non-node entities?
      input.entity_type_id === 'node'
    ) {
      clear(PreviewDrupalPageQuery, params);
    }
  };
}

function PreviewContent({
  data,
  isLoading,
  error,
}: {
  data?: PreviewDrupalPageQuery;
  isLoading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}) {
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

export function Preview() {
  const { data, isLoading, error } = useOperation(
    PreviewDrupalPageQuery,
    usePreviewParameters(),
  );

  return <PreviewContent data={data} isLoading={isLoading} error={error} />;
}
