import { BlockPersonTeaserFragment, Image } from '@custom/schema';
import React from 'react';

import { FadeUp } from '../../Molecules/FadeUp';

export function BlockPersonTeaser(props: BlockPersonTeaserFragment) {
  return (
    <FadeUp yGap={50} className="my-10">
      <div className="container-page">
        <div className="container-content">
          <div className="container-text">
            <div className="flex flex-col items-center space-y-4 rounded-lg bg-gray-50 p-6 text-center shadow-sm md:flex-row md:items-start md:space-x-6 md:space-y-0 md:text-left">
              {props.image && (
                <div className="shrink-0">
                  <Image
                    source={props.image.source}
                    alt={props.image.alt}
                    className="size-32 rounded-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  {props.name}
                </h3>
                {props.birthdate && (
                  <p className="text-gray-600">
                    Born: {new Date(props.birthdate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}
