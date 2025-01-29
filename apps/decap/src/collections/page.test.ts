import { ListPagesQuery, ViewPageQuery } from '@custom/schema';
import { expect, test } from 'vitest';
import { z } from 'zod';

import { createExecutor } from '../graphql';
import { pageResolvers } from './page';

const exec = createExecutor([pageResolvers('./')]);

const listPagesSchema = z.object({
  ssgPages: z.object({
    rows: z.array(
      z.object({ translations: z.array(z.object({ path: z.string() })) }),
    ),
    total: z.number(),
  }),
});

test('retrieve all pages', async () => {
  const result = await exec(ListPagesQuery, { args: '' });
  const parsed = listPagesSchema.safeParse(result);

  expect(parsed.success).toBe(true);
});

test('load a page by path', async () => {
  const list = listPagesSchema.parse(await exec(ListPagesQuery, { args: '' }));

  const path = list.ssgPages.rows[0].translations[0].path;

  const result = await exec(ViewPageQuery, { pathname: path });

  const parsed = z
    .object({
      page: z.object({
        path: z.string(),
        title: z.string(),
        locale: z.string(),
        translations: z.array(
          z.object({
            locale: z.string(),
            path: z.string(),
          }),
        ),
      }),
    })
    .safeParse(result);

  if (!parsed.success) {
    console.error(parsed.error);
  }
  expect(parsed.success).toBe(true);
  expect(parsed.data?.page.path).toEqual(path);
});
