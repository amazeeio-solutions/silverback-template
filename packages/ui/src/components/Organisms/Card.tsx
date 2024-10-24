import { useIntl } from '@amazeelabs/react-intl';
import { CardItemFragment, Image, Link } from '@custom/schema';
import React from 'react';

export const CardItem = ({
  id,
  title,
  hero,
  path,
  teaserImage,
  readMoreText,
}: CardItemFragment & { readMoreText?: string }) => {
  const formattedID = 'heading-' + id;
  const intl = useIntl();

  return (
    <article
      aria-labelledby={formattedID}
      className="focus-within:outline focus-within:outline-2 focus-within:outline-indigo-600 relative max-w-sm bg-white rounded-lg hover:shadow grid grid-rows-[auto_1fr]"
    >
      <div className="p-5 grid grid-rows-[auto_1fr_auto] gap-4">
        <h5
          id={formattedID}
          className="mb-2 text-2xl font-bold tracking-tight text-gray-900"
        >
          {title}
        </h5>
        {hero?.headline ? <div>{hero?.headline}</div> : null}
        <Link
          href={path}
          className="row-start-3 justify-self-start inline-flex items-center px-3 py-2 text-sm font-medium text-center text-blue-700 border border-blue-700 rounded-lg hover:bg-blue-800 hover:text-white focus:outline-offset-4 after:content-[''] after:absolute after:inset-0"
        >
          <span className="sr-only size-0 overflow-hidden">{title}</span>
          {readMoreText ||
            intl.formatMessage({
              defaultMessage: 'Read more',
              id: 'S++WdB',
            })}
          <svg
            className="ms-2 size-3.5 rtl:rotate-180"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </Link>
      </div>
      <div className="rounded-t-lg row-start-1">
        {teaserImage ? (
          <Image {...teaserImage} className="w-full" />
        ) : (
          <div className="aspect-[4/3] bg-indigo-200" />
        )}
      </div>
    </article>
  );
};
