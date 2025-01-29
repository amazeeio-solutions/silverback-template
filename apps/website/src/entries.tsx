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
import React from 'react';
import { createPages } from 'waku';

import { BrokenLinkHandler } from './broken-link-handler.js';
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

export default createPages(async ({ createPage, createLayout }) => {
  createLayout({
    render: 'static',
    path: '/',
    component: ({ children, path }) => (
      <BrokenLinkHandler>
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
              <Frame alterSrc={(src) => src.replace(frontendUrl, drupalUrl)}>
                {children}
              </Frame>
            </ClientExecutors>
          </ServerExecutors>
        </LocationProvider>
      </BrokenLinkHandler>
    ),
  });

  Object.values(Locale).forEach((lang) => {
    createPage({
      render: 'static',
      path: `/${lang}`,
      component: () => <HomePage />,
    });

    createPage({
      render: 'static',
      path: `/${lang}/content-hub`,
      component: () => <ContentHub pageSize={6} />,
    });

    createPage({
      render: 'static',
      path: `/${lang}/inquiry`,
      component: () => <Inquiry />,
    });
  });

  createPage({
    render: 'static',
    path: '/404',
    component: () => <NotFoundPage />,
  });

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

  createPage({
    render: 'static',
    path: '/[...path]',
    staticPaths: [...pagePaths].map((path) => path.substring(1).split('/')),
    component: Page,
  });
});
