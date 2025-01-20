import { graphql } from '@amazeelabs/gatsby-plugin-operations';
import {
  OperationExecutorsProvider,
  useLocation,
  ViewPageQuery,
} from '@custom/schema';
import { Page } from '@custom/ui/routes/Page';
import { HeadProps, PageProps } from 'gatsby';
import React from 'react';

export const query = graphql(ViewPageQuery);

export function Head({ data }: HeadProps<typeof query>) {
  return data.page ? (
    <>
      <title>{data.page.title}</title>
      {data.page.metaTags?.map((metaTag, index) => {
        if (metaTag?.tag === 'meta') {
          return (
            <meta
              key={`meta-${index}`}
              name={metaTag.attributes?.name}
              property={metaTag.attributes?.property}
              content={metaTag.attributes?.content}
            />
          );
        } else if (metaTag?.tag === 'link') {
          return (
            <link
              key={`link-${index}`}
              rel={metaTag.attributes?.rel}
              href={metaTag.attributes?.href}
              type={
                metaTag.attributes?.rel === 'image_src' ? 'image' : undefined
              }
            />
          );
        }
        return null;
      }) || null}
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
