import { Image } from '@amazeelabs/image';
import { BlockImageWithTextFragment, ImagePosition } from '@custom/schema';
import clsx from 'clsx';
import React from 'react';

import { FadeUp } from '../../Molecules/FadeUp';
import { BlockMarkup } from './BlockMarkup';

export function BlockImageWithText(props: BlockImageWithTextFragment) {
  return (
    <FadeUp yGap={50}>
      <div className="container-page">
        <div className="container-content my-12 lg:my-16">
          <div
            className={clsx(
              'flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16',
              {
                'lg:flex-row-reverse':
                  props.imagePosition === ImagePosition.Left,
              },
            )}
          >
            <div className={'nested-container prose-li:text-base lg:w-1/2'}>
              {props.textContent?.markup && (
                <BlockMarkup {...props.textContent} />
              )}
            </div>
            {!!props.image?.url && (
              <div className={'self-start lg:w-1/2 '}>
                <Image
                  className="w-full object-cover"
                  src={props.image.url}
                  width={608}
                  alt={props.image.alt || ''}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeUp>
  );
}
