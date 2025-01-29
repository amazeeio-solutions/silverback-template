import { Image } from '@amazeelabs/image';
import { BlockMediaFragment, Html } from '@custom/schema';
import React from 'react';

import { UnreachableCaseError } from '../../../utils/unreachable-case-error';
import { FadeUp } from '../../Molecules/FadeUp';

export function BlockMedia(props: BlockMediaFragment) {
  if (!props.media) {
    return null;
  }
  return (
    <FadeUp yGap={50} className="container-page my-10">
      <div className="container-content">
        <figure className="container-text">
          <Media {...props.media} />
          {props.caption ? (
            <figcaption className="mt-3 flex justify-center gap-x-2 text-sm leading-6 text-gray-500">
              <Html markup={props.caption} />
            </figcaption>
          ) : null}
        </figure>
      </div>
    </FadeUp>
  );
}

function Media(props: Required<BlockMediaFragment>['media']) {
  switch (props.__typename) {
    case 'MediaImage':
      return (
        <Image
          className="mx-auto max-w-full"
          src={props.url}
          width={768}
          alt={props.alt}
        />
      );
    case 'MediaVideo':
      return <video src={props.url} controls />;
    default:
      throw new UnreachableCaseError(props);
  }
}
