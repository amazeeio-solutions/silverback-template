import React from 'react';

type MetaTag = {
  tag: string;
  attributes: {
    name?: string;
    content?: string;
    property?: string;
    rel?: string;
    href?: string;
  };
};

export function Metatags({
  metaTags,
  defaultTitle,
}: {
  metaTags?: Array<MetaTag | undefined>;
  defaultTitle?: string;
}) {
  let pageTitle = defaultTitle;
  return (
    <>
      {metaTags?.map((metaTag, index) => {
        if (metaTag?.tag === 'meta' && metaTag.attributes.name === 'title') {
          pageTitle = metaTag.attributes.content;
        }
        if (metaTag?.tag === 'meta') {
          return (
            <meta
              key={`meta-${index}`}
              name={metaTag.attributes?.name}
              property={metaTag.attributes?.property}
              content={metaTag.attributes?.content}
            />
          );
        } else if (metaTag?.tag === 'link') {
          return (
            <link
              key={`link-${index}`}
              rel={metaTag.attributes?.rel}
              href={metaTag.attributes?.href}
              type={
                metaTag.attributes?.rel === 'image_src' ? 'image' : undefined
              }
            />
          );
        }
        return null;
      }) || null}
      {pageTitle && <title>{pageTitle}</title>}
    </>
  );
}
