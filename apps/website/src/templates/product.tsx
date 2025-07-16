import { graphql } from '@amazeelabs/gatsby-plugin-operations';
import {
  OperationExecutorsProvider,
  useLocation,
  ViewProductQuery,
} from '@custom/schema';
import { Product } from '@custom/ui/routes/Product';
import { HeadProps, PageProps } from 'gatsby';
import React from 'react';

import { Metatags } from '../utils/metatags';

export const query = graphql(ViewProductQuery);

export function Head({ data }: HeadProps<typeof query>) {
  return data.product ? (
    <>
      <Metatags
        metaTags={data.product.metaTags}
        defaultTitle={data.product.title}
      />
    </>
  ) : null;
}

export default function ProductTemplate({ data }: PageProps<typeof query>) {
  // Retrieve the current location and prefill the
  // "ViewProductQuery" with these arguments.
  // That makes sure the `useOperation(ViewProductQuery, ...)` with this
  // path immediately returns this data.
  const [location] = useLocation();
  return (
    <OperationExecutorsProvider
      executors={[
        {
          id: ViewProductQuery,
          executor: data,
          variables: { pathname: location.pathname },
        },
      ]}
    >
      <Product />
    </OperationExecutorsProvider>
  );
}
