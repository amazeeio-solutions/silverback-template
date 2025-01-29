import { Locale } from '@custom/schema';
import {
  SourceResolvers,
  SourceTranslatableString,
} from '@custom/schema/source';
import { CmsCollection } from 'decap-cms-core';
import fs from 'fs';
import yaml from 'yaml';
import { z } from 'zod';

import rawTranslatables from '../../node_modules/@custom/ui/build/translatables.json';

// Validate that translatables.json contains what we expect.
const translationSources = z
  .record(
    z.object({
      defaultMessage: z.string(),
    }),
  )
  .transform((data) =>
    Object.fromEntries(
      Object.keys(data).map((key) => [key, data[key].defaultMessage]),
    ),
  )
  .parse(rawTranslatables);

export const Translatables: CmsCollection = {
  label: 'Translations',
  name: 'translations',
  i18n: true,
  files: [
    {
      label: 'Translatables',
      name: 'Translatables',
      description: 'Translate user interface texts',
      file: 'apps/decap/data/translatables.yml',
      i18n: true,
      fields: Object.keys(translationSources).map((key) => ({
        name: key,
        label: translationSources[key],
        widget: 'string',
        i18n: true,
        required: false,
      })),
    },
  ],
};

export const translatableResolvers = (path: string) =>
  ({
    Query: {
      stringTranslations: () => {
        const dir = `${path}/data`;
        const rawTranslations = yaml.parse(
          fs.readFileSync(`${dir}/translatables.yml`, 'utf-8'),
        );

        return z
          .record(z.record(z.string()))
          .transform((data) => {
            const translations: Array<SourceTranslatableString> = [];

            Object.keys(data).forEach((langcode) => {
              Object.keys(data[langcode]).forEach((key) => {
                Object.keys(data).forEach((locale) => {
                  if (translationSources[key]) {
                    translations.push({
                      __typename: 'TranslatableString',
                      source: translationSources[key],
                      language: locale as Locale,
                      translation: data[locale][key],
                    });
                  }
                });
              });
            });
            return translations;
          })
          .parse(rawTranslations);
      },
    },
  }) satisfies SourceResolvers;
