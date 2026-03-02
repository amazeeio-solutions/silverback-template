'use client';
import '@custom/seo/style.css';

import { useIntl } from '@amazeelabs/react-intl';
import {
  OperationVariables,
  PreviewDrupalPageQuery,
  useLocation,
} from '@custom/schema';
import { SeoAnalysis } from '@custom/seo';
import React, { useEffect,useRef, useState } from 'react';

import { clear, useOperation } from '../../utils/operation';
import { Loading } from '../Molecules/Loading';
import { Messages } from '../Molecules/Messages';
import { PageDisplay } from '../Organisms/PageDisplay';

interface MetaTag {
  tag: string;
  attributes: {
    name?: string;
    property?: string;
    content?: string;
    rel?: string;
    href?: string;
    hreflang?: string;
  };
}

function usePreviewParameters(): OperationVariables<
  typeof PreviewDrupalPageQuery
> {
  const [location] = useLocation();

  return {
    path: location.pathname || '',
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
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const interfaceLocale = data?.currentUser?.preferredLanguage || 'en';
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

  // Update preview content after render
  useEffect(() => {
    if (previewRef.current) {
      setPreviewContent(previewRef.current.innerHTML);
    }
  }, [data?.preview]);

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
              <div ref={previewRef}>
                {data?.preview ? (
                  <PageDisplay {...data.preview} />
                ) : (
                  <Messages messages={errorMessages} />
                )}
              </div>
              {data?.preview && previewContent && (
                <SeoAnalysis
                  content={previewContent}
                  locale={interfaceLocale}
                  metaTags={(data?.preview?.metaTags as MetaTag[]) || undefined}
                  url={data.preview?.path || ''}
                />
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
