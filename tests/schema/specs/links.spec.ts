import gql from 'noop-tag';
import { expect, test } from 'vitest';

import { fetch } from '../lib.js';

test('Links', async () => {
  const result = await fetch(gql`
    {
      page: viewPage(path: "/en/page-links") {
        content {
          __typename
          ... on BlockMarkup {
            markup
          }
        }
      }
    }
  `);
  result.data.page.content[0].markup =
    result.data.page.content[0].markup.replaceAll(
      /data-id="[^"]*"/g,
      'data-id="[id]"',
    );
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "page": {
          "content": [
            {
              "__typename": "BlockMarkup",
              "markup": "
    <p><a href="/sites/default/files/2023-04/document_docx.docx" data-type="Media: Document" data-id="[id]" data-entity-type="media">link to file</a></p>

    <p><a href="/en/privacy" data-type="Content: Basic page" data-id="[id]" data-entity-type="node">link to page</a></p>
    ",
            },
          ],
        },
      },
    }
  `);
});
