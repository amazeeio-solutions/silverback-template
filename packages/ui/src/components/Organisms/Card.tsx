import { Image } from '@amazeelabs/image';
import { useIntl } from '@amazeelabs/react-intl';
import { CardItemFragment, Link } from '@custom/schema';
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
      className="relative flex max-w-sm flex-col-reverse overflow-hidden rounded-lg bg-white focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 hover:shadow"
    >
      <div className="p-5">
        <h5
          id={formattedID}
          className="mb-2 text-2xl font-bold tracking-tight text-gray-900"
        >
          {title}
        </h5>
        {hero?.headline ? <div>{hero?.headline}</div> : null}
        <Link
          href={path}
          className="inline-flex items-center rounded-lg border border-blue-700 px-3 py-2 text-center text-sm font-medium text-blue-700 after:absolute after:inset-0 after:content-[''] hover:bg-blue-800 hover:text-white focus:outline-offset-4"
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
      <div className="rounded-t-lg">
        {teaserImage ? (
          <Image
            {...teaserImage}
            src={teaserImage.url}
            width={400}
            height={300}
            className="w-full"
          />
        ) : (
          <div className="aspect-[4/3] bg-indigo-200" />
        )}
      </div>
    </article>
  );
};
