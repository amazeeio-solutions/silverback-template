'use client';
import { Locale, MetaTag } from '@custom/schema';
import React, { useEffect } from 'react';

type PageMetaType = {
  meta?: Array<MetaTag | undefined>;
  locale?: Locale;
};

export function PageMeta({ meta, locale }: PageMetaType) {
  // Hack to set the lang attribute on the html tag, as this is not possibles
  // right now with waku.
  useEffect(() => {
    document.documentElement.lang = locale || 'en';
  }, [locale]);

  return meta ? (
    <>
      {meta.map((metaTag, index) => {
        if (metaTag?.tag === 'meta') {
          return (
            <React.Fragment key={`meta-${index}`}>
              <meta
                name={metaTag.attributes?.name}
                property={metaTag.attributes?.property}
                content={metaTag.attributes?.content}
              />
              {metaTag.attributes?.name === 'title' ? (
                <title>{metaTag.attributes?.content}</title>
              ) : null}
            </React.Fragment>
          );
        } else if (metaTag?.tag === 'link') {
          return (
            <link
              key={`link-${index}`}
              rel={metaTag.attributes?.rel}
              href={metaTag.attributes?.href}
            />
          );
        }
        return null;
      }) || null}
    </>
  ) : null;
}
