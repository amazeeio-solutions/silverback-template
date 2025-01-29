import { FrameQuery } from '@custom/schema';
import { expect, test } from 'vitest';
import { z } from 'zod';

import { createExecutor } from '../graphql';
import { translatableResolvers } from './translatables';

const exec = createExecutor([translatableResolvers('./')]);

test('retrieve all translatables', async () => {
  const result = await exec(FrameQuery, undefined);
  const parsed = z
    .object({
      stringTranslations: z.array(
        z.object({
          language: z.string(),
          source: z.string(),
          translation: z.string().nullable(),
        }),
      ),
    })
    .safeParse(result);

  if (!parsed.success) {
    console.error(parsed.error);
  }
  expect(parsed.success).toBe(true);
});
