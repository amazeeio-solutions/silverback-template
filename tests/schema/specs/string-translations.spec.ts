import gql from 'noop-tag';
import { expect, test } from 'vitest';

import { fetch } from '../lib.js';

test('string translations', async () => {
  const result = await fetch(gql`
    {
      stringTranslations {
        source
        translation
        language
      }
    }
  `);
  expect(result.data).toMatchInlineSnapshot(`
    {
      "stringTranslations": [
        {
          "language": "de",
          "source": "Edit",
          "translation": "Bearbeiten",
        },
        {
          "language": "de",
          "source": "Company name",
          "translation": "Drupal Company",
        },
      ],
    }
  `);
});
