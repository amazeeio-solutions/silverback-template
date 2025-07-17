import { useIntl } from '@amazeelabs/react-intl';
import { CardItemFragment, Image, Link } from '@custom/schema';
import React from 'react';

import { Price } from '../Molecules/Price';

export const CardItem = ({
  id,
  title,
  hero,
  path,
  teaserImage,
  readMoreText,
  terms,
  ...productFields
}: CardItemFragment & { readMoreText?: string }) => {
  const formattedID = 'heading-' + id;
  const intl = useIntl();

  // Check if this is a product by presence of price field
  const isProduct =
    'price' in productFields && productFields.price !== undefined;

  return (
    <article
      aria-labelledby={formattedID}
      className="focus-within:outline-kls-orange-primary relative grid max-w-sm grid-rows-[auto_1fr] rounded-lg bg-white focus-within:outline focus-within:outline-2 hover:shadow"
    >
      <div className="grid grid-rows-[auto_1fr_auto] gap-4 p-5">
        <h5 id={formattedID} className="headline-3 text-gray-dark mb-2">
          {title}
        </h5>
        {hero?.headline ? (
          <div className="copy-regular mb-2">{hero?.headline}</div>
        ) : null}
        {isProduct && productFields.price ? (
          <div className="text-gray-dark copy-large mb-2 font-semibold">
            <Price amount={productFields.price} />
            {productFields.stock !== undefined && (
              <span className="copy-small text-gray-medium ml-2">
                {productFields.stock > 0
                  ? `${productFields.stock} in stock`
                  : 'Out of stock'}
              </span>
            )}
          </div>
        ) : null}
        {terms?.length ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {terms.map((term) => (
              <span
                key={term.termId}
                className="bg-[#fff3e6] text-kls-orange-accessible h-6 flex items-center justify-center rounded-full px-3 text-xs font-semibold whitespace-nowrap"
                style={{ minWidth: '2.5rem' }}
              >
                {term.label}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto">
          <Link
            href={path}
            className="copy-small border-kls-orange-primary text-kls-orange-primary hover:bg-kls-orange-primary inline-flex items-center rounded-full border px-3 py-2 text-center after:absolute after:inset-0 after:content-[''] hover:text-white focus:outline-offset-4"
          >
            <span className="sr-only size-0 overflow-hidden">{title}</span>
            {readMoreText ||
              (isProduct
                ? intl.formatMessage({
                    defaultMessage: 'View product',
                    id: 'gfMPP3',
                  })
                : intl.formatMessage({
                    defaultMessage: 'Read more',
                    id: 'S++WdB',
                  }))}
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
      </div>
      <div className="row-start-1">
        {teaserImage ? (
          <Image
            {...teaserImage}
            className="aspect-[16/9] w-full rounded-t-lg"
          />
        ) : (
          <div className="bg-kls-orange-bright aspect-[16/9] rounded-t-lg" />
        )}
      </div>
    </article>
  );
};
