import { BlockMarkupFragment, Html } from '@custom/schema';
import clsx from 'clsx';
import type { Element } from 'hast';
import { selectAll } from 'hast-util-select';
import React, { PropsWithChildren } from 'react';
import { Plugin } from 'unified';

import { FadeUp } from '../../Molecules/FadeUp';

export const unorderedItems: Plugin<[], Element> = () => (tree) => {
  selectAll('ul > li', tree).forEach((node) => {
    node.properties!.unordered = true;
  });
};

export function BlockMarkup(props: BlockMarkupFragment) {
  return (
    <FadeUp yGap={50} className="container-page my-10">
      <div className="container-content">
        <div className="container-text">
          <div
            className={clsx([
              'prose lg:prose-xl',
              'marker:text-[#111928]',
              'marker:font-bold',
            ])}
          >
            <Html
              plugins={[unorderedItems]}
              components={{
                blockquote: ({ children }: PropsWithChildren<{}>) => {
                  return (
                    <blockquote className="relative border-l-0 pb-8 pl-0 pt-16">
                      <svg
                        width="32"
                        height="24"
                        viewBox="0 0 32 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-labelledby="quote-svg-title"
                      >
                        <title id="quote-svg-title">Quote Symbol</title>
                        <path
                          d="M18.6893 24V14.1453C18.6893 6.54 23.664 1.38533 30.6667 0L31.9933 2.868C28.7507 4.09066 26.6667 7.71867 26.6667 10.6667H32V24H18.6893ZM0 24V14.1453C0 6.54 4.99733 1.384 12 0L13.328 2.868C10.084 4.09066 8 7.71867 8 10.6667L13.3107 10.6667V24H0Z"
                          fill="#e65000"
                        />
                      </svg>
                      <span className="text-kls-orange-primary">{children}</span>
                    </blockquote>
                  );
                },
              }}
              markup={props.markup}
            />
          </div>
        </div>
      </div>
    </FadeUp>
  );
}
