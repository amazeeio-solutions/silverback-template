import gql from 'noop-tag';
import { expect, test } from 'vitest';

import { fetch } from '../lib.js';

test('Meta', async () => {
  const result = await fetch(gql`
    {
      metaNavigations {
        locale
        items {
          title
          target
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "metaNavigations": [
          {
            "items": [
              {
                "target": "/en",
                "title": "Meta item 1",
              },
              {
                "target": "/en",
                "title": "Meta item 2",
              },
            ],
            "locale": "en",
          },
          {
            "items": [
              {
                "target": "/de",
                "title": "Meta item 1 DE",
              },
              {
                "target": "/de",
                "title": "Meta item 2 DE",
              },
            ],
            "locale": "de",
          },
          {
            "items": [],
            "locale": "de_CH",
          },
          {
            "items": [],
            "locale": "french",
          },
        ],
      },
    }
  `);
});
