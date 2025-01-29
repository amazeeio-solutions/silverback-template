import { createStrangler } from '@amazeelabs/strangler-netlify';
import fs from 'fs';

const drupalUrl =
  process.env.DRUPAL_INTERNAL_URL ||
  process.env.DRUPAL_EXTERNAL_URL ||
  'http://127.0.0.1:8888';

function encodeRSCUrl(inputUrl: string) {
  const url = new URL(inputUrl, 'http://localhost');
  url.pathname = `/RSC${url.pathname}.txt`;
  return url;
}

function decodeRSCUrl(inputUrl: string) {
  const url = new URL(inputUrl, 'http://localhost');
  url.pathname = url.pathname.replace(/^\/RSC/, '').replace(/\.txt$/, '');
  return url;
}

const notFoundRSC = fs.readFileSync('dist/public/RSC/404.txt').toString();

export const handler = createStrangler(
  [
    {
      url: drupalUrl,
      applies: (url) => url.pathname.startsWith('/RSC/'),
      preprocess: (event) => {
        // Before handling, turn the RSC url into the corresponding Drupal url.
        event.rawUrl = decodeRSCUrl(event.rawUrl).toString();
        event.path = decodeRSCUrl(event.path).pathname;
        return event;
      },
      process: (response) => {
        if ([301, 302].includes(response.status)) {
          const location = response.headers.get('Location');
          if (location) {
            return new Response(response.body, {
              status: response.status,
              headers: {
                ...response.headers,
                // After handling, turn the resulting redirect target
                // into the corresponding RSC url.
                Location: encodeRSCUrl(location).toString(),
              },
            });
          }
        }
        return new Response(notFoundRSC, {
          status: 404,
        });
      },
    },
    {
      // For Standard drupal redirects, we are interested in any
      // url (therefore no urlFilter) and only in redirects (301, 302).
      url: drupalUrl,
      process: (response) =>
        [301, 302].includes(response.status) ? response : undefined,
    },
  ],
  fs.readFileSync('dist/public/404.html').toString(),
);
