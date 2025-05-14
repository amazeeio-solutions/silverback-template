import gql from 'noop-tag';
import { expect, test } from 'vitest';

import { fetch } from '../lib.js';

test('Page', async () => {
  const result = await fetch(gql`
    fragment Page on Page {
      locale
      path
      title
      translations {
        locale
        path
        title
      }
    }
    {
      loadFromEnglishPath: viewPage(path: "/en/privacy") {
        ...Page
      }
      loadFromGermanPath: viewPage(path: "/de/privatsphaere") {
        ...Page
      }
      loadFromSwissGermanPath: viewPage(path: "/de-CH/privacy") {
        ...Page
      }
      loadFromFrenchPath: viewPage(path: "/french/privacy") {
        ...Page
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "loadFromEnglishPath": {
          "locale": "en",
          "path": "/en/privacy",
          "title": "Privacy",
          "translations": [
            {
              "locale": "en",
              "path": "/en/privacy",
              "title": "Privacy",
            },
            {
              "locale": "de",
              "path": "/de/privatsphaere",
              "title": "Privatsphäre",
            },
            {
              "locale": "de_CH",
              "path": "/de-CH/privacy",
              "title": "Privatsphäre",
            },
            {
              "locale": "french",
              "path": "/french/privacy",
              "title": "Vie privée",
            },
          ],
        },
        "loadFromFrenchPath": {
          "locale": "french",
          "path": "/french/privacy",
          "title": "Vie privée",
          "translations": [
            {
              "locale": "en",
              "path": "/en/privacy",
              "title": "Privacy",
            },
            {
              "locale": "de",
              "path": "/de/privatsphaere",
              "title": "Privatsphäre",
            },
            {
              "locale": "de_CH",
              "path": "/de-CH/privacy",
              "title": "Privatsphäre",
            },
            {
              "locale": "french",
              "path": "/french/privacy",
              "title": "Vie privée",
            },
          ],
        },
        "loadFromGermanPath": {
          "locale": "de",
          "path": "/de/privatsphaere",
          "title": "Privatsphäre",
          "translations": [
            {
              "locale": "en",
              "path": "/en/privacy",
              "title": "Privacy",
            },
            {
              "locale": "de",
              "path": "/de/privatsphaere",
              "title": "Privatsphäre",
            },
            {
              "locale": "de_CH",
              "path": "/de-CH/privacy",
              "title": "Privatsphäre",
            },
            {
              "locale": "french",
              "path": "/french/privacy",
              "title": "Vie privée",
            },
          ],
        },
        "loadFromSwissGermanPath": {
          "locale": "de_CH",
          "path": "/de-CH/privacy",
          "title": "Privatsphäre",
          "translations": [
            {
              "locale": "en",
              "path": "/en/privacy",
              "title": "Privacy",
            },
            {
              "locale": "de",
              "path": "/de/privatsphaere",
              "title": "Privatsphäre",
            },
            {
              "locale": "de_CH",
              "path": "/de-CH/privacy",
              "title": "Privatsphäre",
            },
            {
              "locale": "french",
              "path": "/french/privacy",
              "title": "Vie privée",
            },
          ],
        },
      },
    }
  `);
});
