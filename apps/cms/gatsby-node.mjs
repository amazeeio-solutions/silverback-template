import { Locale } from '@custom/schema';
import { resolve } from 'path';

/**
 *
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
export const createPages = async ({ actions }) => {
  // Rewrite file requests to Drupal.
  actions.createRedirect({
    fromPath: '/sites/default/files/*',
    toPath: `${process.env.GATSBY_DRUPAL_URL}/sites/default/files/:splat`,
    statusCode: 200,
  });

  // Proxy Drupal GraphQL queries.
  actions.createRedirect({
    fromPath: '/graphql',
    toPath: `${process.env.GATSBY_DRUPAL_URL}/graphql`,
    statusCode: 200,
  });

  // Create the content hub page in each language.
  Object.values(Locale).forEach((locale) => {
    actions.createPage({
      path: `/${formatLocalePath(locale)}/content-hub`,
      component: resolve(`./src/templates/content-hub.tsx`),
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

  // Proxy Drupal webforms.
  const netlifyUrl = new URL(
    process.env.NETLIFY_URL || 'http://127.0.0.1:8000',
  );
  Object.values(Locale).forEach((locale) => {
    global.netlifyTomlParts.push(`
      [[redirects]]
        from = "/${locale}/form/*"
        to = "${process.env.GATSBY_DRUPAL_URL}/${locale}/form/:splat"
        status = 200
        force = true
        [redirects.headers]
          SLB-Forwarded-Proto = "${netlifyUrl.protocol.slice(0, -1)}"
          SLB-Forwarded-Host = "${netlifyUrl.host}"
          SLB-Forwarded-Port = "${netlifyUrl.port}"
    `);
  });

  // Additionally, proxy themes and modules as they can have additional
  // non-aggregated assets.
  ['themes', 'modules', 'core/assets', 'core/misc'].forEach((path) => {
    actions.createRedirect({
      fromPath: `/${path}/*`,
      toPath: `${process.env.GATSBY_DRUPAL_URL}/${path}/:splat`,
      statusCode: 200,
    });
  });
};

/**
 * Format locale containing the country code,
 * so it's ISO 639-1 compliant in the path.
 * This is needed as GraphQL enums are not supporting dashes (-).
 * @param {string} locale
 */
function formatLocalePath(locale) {
  return locale.replace('_', '-');
}
