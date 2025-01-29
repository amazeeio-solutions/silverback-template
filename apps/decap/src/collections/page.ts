import { Markup } from '@custom/schema';
import {
  SourceBlockMarkup,
  SourceBlockMedia,
  SourceLocale,
  SourceMediaImage,
  SourceResolvers,
  SourceResolversTypes,
} from '@custom/schema/source';
import type { CmsCollection, CmsField } from 'decap-cms-core';
import fs from 'fs';
import yaml from 'yaml';
import { z } from 'zod';

import { transformMarkdown } from '../helpers/markdown';

export const imagePath = (source: string) => {
  // The Decap "media" directory is symlinked to "public/media" in Waku,
  // thats why this works. The "Image" component in "@amazeelabs/image" will
  // handle relative paths by prepending the `public` path to the URL.
  return source.substring(`/apps/decap/`.length);
};

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

// TODO: generalize this, maybe based on `Image` scalar.
// function decapImageSource(path: string) {
//   return JSON.stringify({ src: path.replace('apps/decap', '') });
// }

// =============================================================================
// Transformation schema definitions.
// =============================================================================

const BlockMarkupSchema = z
  .object({
    type: z.literal('text'),
    text: transformMarkdown,
  })
  .transform(({ text }): SourceBlockMarkup => {
    return {
      __typename: 'BlockMarkup',
      markup: text as Markup,
    };
  });

const BlockMediaImageSchema = z
  .object({
    type: z.literal('image'),
    alt: z.string(),
    image: z.string(),
    caption: transformMarkdown,
  })
  .transform(({ image, alt, caption }): SourceBlockMedia => {
    return {
      __typename: 'BlockMedia',
      media: {
        __typename: 'MediaImage',
        url: imagePath(image),
        alt,
        id: '',
      },
      caption: caption,
    };
  });

type ResolvedPage = Exclude<SourceResolversTypes['Page'], Promise<unknown>>;

export const pageSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    locale: z.string().transform((l) => l as SourceLocale),
    path: z.string(),
    hero: z.object({
      __typename: z.literal('Hero').optional().default('Hero'),
      headline: z.string(),
      lead: z.string().optional(),
      image: z
        .string()
        .optional()
        .transform((source): SourceMediaImage | undefined =>
          source
            ? {
                id: imagePath(source),
                __typename: 'MediaImage',
                url: imagePath(source),
                alt: '',
              }
            : undefined,
        ),
    }),
    content: z.array(z.union([BlockMarkupSchema, BlockMediaImageSchema])),
  })
  .transform((data): ResolvedPage => ({ __typename: 'Page', ...data }));

const fileSchema = z.record(z.union([pageSchema, z.any()]));

function isNotEmpty<T extends object>(value: T | {}): value is T {
  return Object.keys(value).length > 0;
}

const pages: Array<ResolvedPage> = [];

const getPages = (path: string) => {
  const dir = `${path}/data/page`;
  if (pages.length === 0) {
    fs.readdirSync(dir)
      .filter((file) => file.endsWith('.yml'))
      .forEach((file) => {
        const raw = fs.readFileSync(`${dir}/${file}`, 'utf-8');
        const content = fileSchema.parse(yaml.parse(raw));
        const id = Object.values(content)
          .filter(isNotEmpty)
          .map((page) => page.id)
          .pop();
        const translations: Array<ResolvedPage> = [];
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
            translations.push({
              ...page.data,
              editLink: {
                __typename: 'EditLink',
                url: editUrl,
                type: 'decap',
              },
            });
          } else {
            console.warn(`Error parsing ${file} (${lang}):`);
            console.warn(page.error.message);
            console.warn('Input:', content[lang]);
          }
        });
        const original = { ...translations[0] };
        original.translations = translations;
        pages.push(original);
      });
  }
  return pages;
};

export const pageResolvers = (path: string) =>
  ({
    SSGPagesResult: {
      rows: () => getPages(path),
      total: () => 0,
    },
    Query: {
      ssgPages: () => {
        return {
          __typename: 'SSGPagesResult',
          total: 0,
          rows: [],
        };
      },
      viewPage: async (_, { path }) => {
        const pages = getPages(path);
        let result: ResolvedPage | undefined;
        for (const page of pages) {
          if (page.translations) {
            for (const promise of page.translations) {
              const translation = await promise;
              if (translation?.path === path) {
                result = { ...translation };
                result.translations = page.translations;
              }
            }
          }
        }
        return result;
      },
    },
  }) satisfies SourceResolvers;
