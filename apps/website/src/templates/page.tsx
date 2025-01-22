import { graphql } from '@amazeelabs/gatsby-plugin-operations';
import {
  OperationExecutorsProvider,
  useLocation,
  ViewPageQuery,
} from '@custom/schema';
import { Page } from '@custom/ui/routes/Page';
import { HeadProps, PageProps } from 'gatsby';
import React from 'react';

import { Metatags } from '../utils/metatags';

export const query = graphql(ViewPageQuery);

export function Head({ data }: HeadProps<typeof query>) {
  return data.page ? (
    <>
      <Metatags metaTags={data.page.metaTags} defaultTitle={data.page.title} />
    </>
  ) : null;
}

export default function PageTemplate({ data }: PageProps<typeof query>) {
  // Retrieve the current location and prefill the
  // "ViewPageQuery" with these arguments.
  // That makes shure the `useOperation(ViewPageQuery, ...)` with this
  // path immediately returns this data.
  const [location] = useLocation();
  return (
    <OperationExecutorsProvider
      executors={[
        {
          id: ViewPageQuery,
          executor: data,
          variables: { pathname: location.pathname },
        },
      ]}
    >
      <Page />
    </OperationExecutorsProvider>
  );
}
