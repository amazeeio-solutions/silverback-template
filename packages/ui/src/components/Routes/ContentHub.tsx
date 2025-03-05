'use client';
import { Locale, TermContentHub } from '@custom/schema';
import React from 'react';

import { Translations } from '../../utils/translations';
import { PageTransition } from '../Molecules/PageTransition';
import { ContentHub as ContentHubOrganism } from '../Organisms/ContentHub';

export function ContentHub(props: {
  pageSize: number;
  termsResults: TermContentHub[];
}) {
  return (
    <PageTransition>
      <Translations
        translations={Object.fromEntries(
          Object.values(Locale).map((locale) => [
            locale,
            `/${locale}/content-hub`,
          ]),
        )}
      >
        <ContentHubOrganism
          pageSize={props.pageSize}
          termsResults={props.termsResults}
        />
      </Translations>
    </PageTransition>
  );
}
