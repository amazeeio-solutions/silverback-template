import { graphqlQuery } from '@amazeelabs/gatsby-plugin-operations';
import {
  HomePageQuery,
  ListPagesQuery,
  Locale,
  NotFoundPageQuery,
} from '@custom/schema';
import fs from 'fs';
import { resolve } from 'path';

// @ts-expect-error Not typed.
global.netlifyTomlParts ??= [];

/**
 * @type {import('gatsby').GatsbyNode['onCreateWebpackConfig']}
 */
export const onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@amazeelabs/bridge': '@amazeelabs/bridge-gatsby',
      },
    },
  });
};

/**
 * @template T extends any
 * @param {T | undefined | null} val
 * @returns {val is T}
 */
function isDefined(val) {
  return Boolean(val);
}

/**
 *
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
export const createPages = async ({ actions }) => {
  // Grab Home- and 404 pages.
  const homePages =
    (
      await graphqlQuery(HomePageQuery)
    ).data.websiteSettings?.homePage?.translations?.filter(isDefined) || [];
  const notFoundPages =
    (
      await graphqlQuery(NotFoundPageQuery)
    ).data.websiteSettings?.notFoundPage?.translations?.filter(isDefined) || [];

  // Create pages and root-redirects for home-pages.
  homePages.forEach((page) => {
    actions.createPage({
      path: `/${formatLocalePath(page.locale)}`,
      component: resolve('./src/templates/home.tsx'),
    });
    // If a menu link points to the drupal-path of a home page,
    // it should redirect to the root path with the language prefix.
    actions.createRedirect({
      fromPath: page.path,
      toPath: `/${formatLocalePath(page.locale)}`,
      statusCode: 301,
    });
  });

  // Create a list of paths that we don't want to render regularly.
  // 404 and homepages are dealt with differently.
  const skipPaths = [
    ...(homePages.map((page) => page.path) || []),
    ...(notFoundPages.map((page) => page.path) || []),
  ];

  // Run the query that lists all pages, both Decap and Drupal.
  const pages = await graphqlQuery(ListPagesQuery);

  // Create a gatsby page for each of these pages.
  pages.data?.allPages
    ?.filter(isDefined)
    .filter((page) => !skipPaths.includes(page.path))
    .forEach(({ path }) => {
      actions.createPage({
        path: path,
        component: resolve(`./src/templates/page.tsx`),
        context: { pathname: path },
      });
    });

  // Create a inquiry page in each language.
  Object.values(Locale).forEach((locale) => {
    actions.createPage({
      path: `/${formatLocalePath(locale)}/inquiry`,
      component: resolve(`./src/templates/inquiry.tsx`),
    });
  });

  // Broken Gatsby links will attempt to load page-data.json files, which don't exist
  // and also should not be piped into the strangler function. Thats why they
  // are caught right here.
  actions.createRedirect({
    fromPath: '/page-data/*',
    toPath: '/404',
    statusCode: 404,
  });

  // Any unhandled requests are handed to strangler, which will try to pass
  // them to all registered legacy systems and return 404 if none of them
  // respond.
  // We put it into netlify.toml because it should be really the last one.
  // See https://docs.netlify.com/routing/redirects/#rule-processing-order
  // @ts-expect-error Not typed.
  global.netlifyTomlParts.push(`
    [[redirects]]
      from = "/*"
      to = "/.netlify/functions/strangler"
      status = 200
  `);
};

/**
 * @type {import('gatsby').GatsbyNode['onPostBuild']}
 */
export const onPostBuild = async () => {
  prepareNetlifyToml();
};

/**
 * @returns {void}
 */
function prepareNetlifyToml() {
  const netlifyTomlBase = fs
    .readFileSync(resolve('./netlify-base.toml'), 'utf8')
    .trim();
  /** @type {Array<string>} */
  const netlifyTomlParts =
    // @ts-expect-error Not typed.
    global.netlifyTomlParts;
  fs.writeFileSync(
    resolve('./netlify.toml'),
    [netlifyTomlBase]
      .concat(netlifyTomlParts.map(removeIndentation))
      .join('\n\n'),
  );
}

/**
 * @param {string} str
 * @returns {string}
 */
function removeIndentation(str) {
  const lines = str.split('\n');
  const minIndent = Math.min(
    ...lines
      .filter((line) => line.trim().length > 0)
      .map((line) => (line.match(/^\s*/) || [''])[0].length),
  );
  return lines
    .map((line) => line.slice(minIndent))
    .join('\n')
    .trim();
}

/**
 * Format locale containing the country code,
 * so it's ISO 639-1 compliant in the path.
 * This is needed as GraphQL enums are not supporting dashes (-).
 * @param {string} locale
 */
function formatLocalePath(locale) {
  return locale.replace('_', '-');
}
