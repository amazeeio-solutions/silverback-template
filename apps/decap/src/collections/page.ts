import { SilverbackSource } from '@amazeelabs/gatsby-source-silverback';
import {
  BlockMarkupSource,
  BlockMediaSource,
  DecapPageSource,
  LocaleSource,
  MediaImageSource,
} from '@custom/schema/source';
import type { CmsCollection, CmsField } from 'decap-cms-core';
import fs from 'fs';
import yaml from 'yaml';
import { z } from 'zod';

import { transformMarkdown } from '../helpers/markdown';
import { path } from '../helpers/path';

// =============================================================================
// Decap CMS collection definition.
// =============================================================================
export const PageCollection: CmsCollection = {
  label: 'Page',
  description: 'Content pages',
  name: 'page',
  i18n: true,
  create: true,
  folder: 'apps/decap/data/page',
  format: 'yml',
  identifier_field: 'title',
  summary: '{{title}}',
  fields: [
    {
      label: 'ID',
      name: 'id',
      widget: 'uuid',
    } as CmsField,
    {
      label: 'Path',
      name: 'path',
      widget: 'string',
      comment: 'The path of the page. Must be unique.',
      required: true,
      i18n: true,
    },
    {
      label: 'Title',
      name: 'title',
      widget: 'string',
      required: true,
      i18n: true,
    },
    {
      label: 'Teaser image',
      name: 'teaserImage',
      widget: 'image',
      required: false,
      i18n: true,
    },
    {
      label: 'Hero',
      name: 'hero',
      widget: 'object',
      collapsed: false,
      i18n: true,
      fields: [
        {
          label: 'Headline',
          name: 'headline',
          widget: 'string',
          required: true,
          i18n: true,
        },
        {
          label: 'Lead',
          name: 'lead',
          widget: 'string',
          required: true,
          i18n: true,
        },

        {
          label: 'Hero image',
          name: 'image',
          widget: 'image',
          required: true,
          i18n: true,
        },
      ],
    },
    {
      label: 'Content',
      name: 'content',
      widget: 'list',
      i18n: true,
      types: [
        {
          label: 'Text',
          name: 'text',
          widget: 'object',
          fields: [
            {
              label: 'Text',
              name: 'text',
              widget: 'markdown',
            },
          ],
        },
        {
          label: 'Image',
          name: 'image',
          widget: 'object',
          fields: [
            {
              label: 'Image',
              name: 'image',
              widget: 'image',
            },
            {
              label: 'Alt text',
              name: 'alt',
              widget: 'string',
            },
            {
              label: 'Caption',
              name: 'caption',
              widget: 'markdown',
            },
          ],
        },
      ],
    },
  ],
};

// =============================================================================
// Transformation schema definitions.
// =============================================================================

const BlockMarkupSchema = z
  .object({
    type: z.literal('text'),
    text: transformMarkdown,
  })
  .transform(({ text }): BlockMarkupSource => {
    return {
      __typename: 'BlockMarkup',
      markup: text,
    };
  });

const BlockMediaImageSchema = z
  .object({
    type: z.literal('image'),
    alt: z.string(),
    image: z.string(),
    caption: transformMarkdown,
  })
  .transform(({ image, alt, caption }): BlockMediaSource => {
    return {
      __typename: 'BlockMedia',
      media: {
        __typename: 'MediaImage',
        source: image,
        alt,
        id: '',
      },
      caption: caption,
    };
  });

export const pageSchema = z.object({
  __typename: z.literal('DecapPage').optional().default('DecapPage'),
  id: z.string(),
  title: z.string(),
  locale: z.string().transform((l) => l as LocaleSource),
  path: z.string(),
  hero: z.object({
    __typename: z.literal('Hero').optional().default('Hero'),
    headline: z.string(),
    lead: z.string().optional(),
    image: z
      .string()
      .optional()
      .transform((source): MediaImageSource | undefined =>
        source
          ? {
              __typename: 'MediaImage',
              source,
              alt: '',
              id: '',
            }
          : undefined,
      ),
  }),
  content: z.array(z.union([BlockMarkupSchema, BlockMediaImageSchema])),
});

export const getPages: SilverbackSource<DecapPageSource> = () => {
  const dir = `${path}/data/page`;
  const pages: Array<[string, DecapPageSource & { _decap_id: string }]> = [];
  fs.readdirSync(dir)
    .filter((file) => file.endsWith('.yml'))
    .forEach((file) => {
      const content = yaml.parse(fs.readFileSync(`${dir}/${file}`, 'utf-8'));
      const id = Object.values(content)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((page: any) => page.id)
        .filter((id) => !!id)
        .pop();
      Object.keys(content).forEach((lang) => {
        if (Object.keys(content[lang]).length < 2) {
          return;
        }
        const input = {
          ...content[lang],
          id,
          locale: lang,
        };
        const page = pageSchema.safeParse(input);
        if (page.success) {
          const editUrl = `${process.env.NETLIFY_URL || 'http://127.0.0.1:8000'}/admin/#/collections/page/entries/${file.replace(/\.yml$/, '')}`;
          pages.push([
            `${page.data.id}:${lang}`,
            {
              ...page.data,
              _decap_id: id,
              editLink: {
                __typename: 'EditLink',
                url: editUrl,
                type: 'decap',
              },
            },
          ]);
        } else {
          console.warn(`Error parsing ${file} (${lang}):`);
          console.warn(page.error.message);
          console.warn('Input:', content[lang]);
        }
      });
    });
  return pages;
};
