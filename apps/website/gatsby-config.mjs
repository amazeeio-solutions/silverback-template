// Please keep this file as JavaScript.
// Gatsby supports both JS and TS config files, but the TS support is poor and
// can lead to crazy errors.
// If it's really needed to use TS (e.g. to import code from other TS files),
// use rollup to compile it to JS first. Please keep in mind that the original
// TS file name should be different from gastby-config.ts, otherwise Gatsby will
// pick it up instead of the JS file.

process.env.NETLIFY_URL = process.env.NETLIFY_URL || 'http://127.0.0.1:8000';

process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test';
process.env.CLOUDINARY_CLOUDNAME = process.env.CLOUDINARY_CLOUDNAME || 'demo';

process.env.NOINDEX = process.env.NOINDEX || 'false';

/**
 *
 * @type {import('gatsby').GatsbyConfig['plugins']}
 */
const plugins = [
  'gatsby-plugin-uninline-styles',
  'gatsby-plugin-pnpm',
  'gatsby-plugin-layout',
  'gatsby-plugin-sharp',
  {
    resolve: '@amazeelabs/gatsby-plugin-static-dirs',
    options: {
      directories: {
        'node_modules/@custom/ui/build/styles.css': '/styles.css',
        'node_modules/@custom/ui/build/iframe.css': '/iframe.css',
        'node_modules/@custom/ui/static/public': '/',
      },
    },
  },
  {
    resolve: '@amazeelabs/gatsby-plugin-operations',
    options: {
      operations: './node_modules/@custom/schema/build/operations.json',
    },
  },
  {
    resolve: 'gatsby-plugin-netlify',
    options: {
      // To avoid "X-Frame-Options: DENY" in Drupal iframes.
      mergeSecurityHeaders: false,
      headers:
        process.env.NOINDEX === 'true'
          ? {
              '/*': ['X-Robots-Tag: noindex, nofollow'],
            }
          : {},
    },
  },
  {
    resolve: 'gatsby-plugin-sitemap',
  },
  {
    resolve: 'gatsby-plugin-robots-txt',
    options: {
      policy:
        process.env.NOINDEX === 'true'
          ? [{ userAgent: '*', disallow: '/' }]
          : [{ userAgent: '*', allow: '/', disallow: [] }],
    },
  },
  {
    resolve: '@amazeelabs/gatsby-source-silverback',
    options: {
      schema_configuration: './graphqlrc.yml',
    },
  },
  '@custom/cms',
  '@custom/decap',
];

/**
 * @type {import('gatsby').GatsbyConfig}
 */
export default {
  trailingSlash: 'ignore',
  flags: {
    PARTIAL_HYDRATION: false,
  },
  siteMetadata: {
    // For gatsby-plugin-sitemap and gatsby-plugin-robots-txt.
    siteUrl: process.env.NETLIFY_URL,
  },
  plugins,
};
