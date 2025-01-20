import gql from 'noop-tag';
import { expect, test } from 'vitest';

import { fetch } from '../lib.js';

test('Terms', async () => {
  const result = await fetch(gql`
    {
      contentHubTerms {
        total
        items {
          label
          depth
        }
      }
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "contentHubTerms": {
          "items": [
            {
              "depth": 0,
              "label": "Block",
            },
            {
              "depth": 0,
              "label": "Demo",
            },
            {
              "depth": 0,
              "label": "List",
            },
            {
              "depth": 0,
              "label": "Page",
            },
          ],
          "total": 4,
        },
      },
    }
  `);
});
