import { graphql } from '@amazeelabs/gatsby-plugin-operations';
import { HomePageQuery, OperationExecutorsProvider } from '@custom/schema';
import { HomePage } from '@custom/ui/routes/HomePage';
import { HeadProps, PageProps } from 'gatsby';
import React from 'react';

import { useLocalized } from '../utils/locale';

export const query = graphql(HomePageQuery);

export function Head({ data }: HeadProps<typeof query>) {
  const page = useLocalized(data.websiteSettings?.homePage?.translations);
  return page ? (
    <>
      <title>{page.title}</title>
      {page.metaTags?.map((metaTag, index) => {
        if (metaTag?.tag === 'meta') {
          return (
            <meta
              key={`meta-${index}`}
              name={metaTag.attributes?.name || metaTag.attributes?.property}
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

export default function Index({ data }: PageProps<typeof query>) {
  return (
    <OperationExecutorsProvider
      executors={[{ executor: data, id: HomePageQuery }]}
    >
      <HomePage />
    </OperationExecutorsProvider>
  );
}
