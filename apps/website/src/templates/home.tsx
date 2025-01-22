import { graphql } from '@amazeelabs/gatsby-plugin-operations';
import { HomePageQuery, OperationExecutorsProvider } from '@custom/schema';
import { HomePage } from '@custom/ui/routes/HomePage';
import { HeadProps, PageProps } from 'gatsby';
import React from 'react';

import { useLocalized } from '../utils/locale';
import { Metatags } from '../utils/metatags';

export const query = graphql(HomePageQuery);

export function Head({ data }: HeadProps<typeof query>) {
  const page = useLocalized(data.websiteSettings?.homePage?.translations);
  return page ? (
    <>
      <Metatags metaTags={page.metaTags} defaultTitle={page.title} />
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
