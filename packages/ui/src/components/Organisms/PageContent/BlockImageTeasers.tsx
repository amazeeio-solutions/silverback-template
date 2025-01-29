import { Image } from '@amazeelabs/image';
import { BlockImageTeasersFragment, Link } from '@custom/schema';
import clsx from 'clsx';
import React from 'react';

import { isTruthy } from '../../../utils/isTruthy';
import { FadeUp } from '../../Molecules/FadeUp';

export function BlockImageTeasers(props: BlockImageTeasersFragment) {
  return (
    <FadeUp yGap={50} className="block-background-image-cards my-10">
      <section>
        <div className="text-center">
          <div
            className={clsx('grid gap-2', {
              'grid-cols-2': props.teasers.filter(isTruthy).length > 1,
            })}
          >
            {props.teasers.filter(isTruthy).map((teaser, index) => (
              <BlockImageTeaser key={index} {...teaser} />
            ))}
          </div>
        </div>
      </section>
    </FadeUp>
  );
}

// This component uses the following Flowbite component:
// https://flowbite.com/blocks/marketing/hero/#background-image-cards
export function BlockImageTeaser(
  props: BlockImageTeasersFragment['teasers'][0],
) {
  return (
    <div className="relative col-span-2 h-72 bg-gray-900 p-8 pl-5 text-left md:pl-14 lg:col-span-1 lg:h-96 lg:pl-20">
      {props.image ? (
        <Image
          className="absolute left-0 top-0 h-72 w-full object-cover lg:h-96"
          src={props.image.url}
          width={1920}
          alt={props.image.alt}
        />
      ) : null}

      <div className={'relative'}>
        {props.title ? (
          <h2 className="mb-6 max-w-xl text-4xl font-bold leading-tight tracking-tight text-white">
            {props.title}
          </h2>
        ) : null}

        {props.ctaUrl && props.ctaText ? (
          <Link
            href={props.ctaUrl}
            type="button"
            className="inline-flex items-center rounded-lg border border-white px-5 py-3 text-center text-base font-medium text-white hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-700"
          >
            {props.ctaText}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
