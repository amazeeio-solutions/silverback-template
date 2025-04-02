import gql from 'noop-tag';
import { expect, test } from 'vitest';

import { fetch } from '../lib.js';

test('Terms', async () => {
  const result = await fetch(gql`
    {
      contentHubTerms {
        label
        depth
        locale
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "contentHubTerms": [
          {
            "depth": 0,
            "label": "Block",
            "locale": "en",
          },
          {
            "depth": 0,
            "label": "Demo",
            "locale": "en",
          },
          {
            "depth": 0,
            "label": "List",
            "locale": "en",
          },
          {
            "depth": 0,
            "label": "Page",
            "locale": "en",
          },
        ],
      },
    }
  `);
});
