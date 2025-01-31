import '@custom/ui/styles.css';

import {
  AnyOperationId,
  findExecutors,
  HomePageQuery,
  ListPagesQuery,
  Locale,
  LocationProvider,
  OperationVariables,
  Url,
} from '@custom/schema';
import { ContentHub } from '@custom/ui/routes/ContentHub';
import { Frame } from '@custom/ui/routes/Frame';
import { HomePage } from '@custom/ui/routes/HomePage';
import { Inquiry } from '@custom/ui/routes/Inquiry';
import { NotFoundPage } from '@custom/ui/routes/NotFoundPage';
import { Page } from '@custom/ui/routes/Page';
import { Providers } from '@custom/ui/routes/Providers';
import React, { PropsWithChildren } from 'react';
import { createPages } from 'waku';

import { ClientExecutors } from './executors-client.js';
import { ServerExecutors, serverExecutors } from './executors-server.js';
import { query } from './query.js';
import { drupalUrl, frontendUrl } from './utils.js';

async function queryAll<TOperation extends AnyOperationId>(
  operation: TOperation,
  variables: OperationVariables<TOperation>,
) {
  return Promise.all(
    findExecutors(serverExecutors, operation, variables).map((exec) =>
      exec instanceof Function ? exec(operation, variables) : exec,
    ),
  );
}

function Layout({ children }: PropsWithChildren) {
  return (
    <ServerExecutors>
      <ClientExecutors>
        <Providers alterSrc={(src) => src.replace(frontendUrl, drupalUrl)}>
          {children}
        </Providers>
      </ClientExecutors>
    </ServerExecutors>
  );
}

function withPageWrapper(Component: React.FC) {
  return function PageWrapper({ path }: { path: string }) {
    return (
      <LocationProvider
        currentLocation={{
          pathname: path,
          searchParams: new URLSearchParams(),
          search: '',
          hash: '',
        }}
      >
        <ServerExecutors>
          <ClientExecutors>
            <Providers alterSrc={(src) => src.replace(frontendUrl, drupalUrl)}>
              <Frame>
                <Component />
              </Frame>
            </Providers>
          </ClientExecutors>
        </ServerExecutors>
      </LocationProvider>
    );
  };
}

export default createPages(async ({ createPage, createLayout }) => {
  // Initialise a map for the homepages, since we want to exclude them from
  // creating a page for their internal path.
  const homePages = await query(HomePageQuery, {});
  const homePageTranslations: Array<Url> = [];
  homePages.websiteSettings?.homePage?.translations?.forEach(
    (homePageTranslation) => {
      if (homePageTranslation?.locale) {
        homePageTranslations.push(homePageTranslation?.path);
      }
    },
  );

  // TODO: Paginate properly to not load all nodes in Drupal
  const pagePaths = new Set<string>();
  const pageSources = await queryAll(ListPagesQuery, {
    args: 'pageSize=0&page=1',
  });

  for (const source of pageSources) {
    source.ssgPages?.rows.forEach((page) => {
      page?.translations?.forEach((translation) => {
        if (
          translation?.path &&
          !homePageTranslations.includes(translation.path)
        ) {
          pagePaths.add(translation.path);
        }
      });
    });
  }

  return [
    createLayout({
      render: 'static',
      path: '/',
      component: Layout,
    }),

    ...Object.values(Locale)
      .map((lang) => [
        createPage({
          render: 'static',
          path: `/${lang}`,
          component: withPageWrapper(HomePage),
        }),

        createPage({
          render: 'static',
          path: `/${lang}/content-hub`,
          component: withPageWrapper(() => <ContentHub pageSize={6} />),
        }),

        createPage({
          render: 'static',
          path: `/${lang}/inquiry`,
          component: withPageWrapper(Inquiry),
        }),
      ])
      .reduce((acc, val) => [...acc, ...val]),

    createPage({
      render: 'static',
      path: '/404',
      component: withPageWrapper(NotFoundPage),
    }),

    createPage({
      render: 'static',
      path: '/[...path]',
      staticPaths: [...pagePaths].map((path) => path.substring(1).split('/')),
      component: withPageWrapper(Page),
    }),
  ];
});
