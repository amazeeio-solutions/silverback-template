import { BlockQuoteFragment, Html, Image } from '@custom/schema';
import React from 'react';

import { FadeUp } from '../../Molecules/FadeUp';

export function BlockQuote(props: BlockQuoteFragment) {
  return (
    <FadeUp yGap={50} className="container-page mb-8 mt-16">
      <div className="container-page">
        <div className="container-content">
          <div className="container-text">
            <div className="prose lg:prose-xl prose-p:text-xl prose-p:font-bold prose-p:leading-8">
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
                <p style={{ color: '#e65000' }}>{props.quote && <Html markup={props.quote} />}</p>
                <div className="not-prose flex flex-wrap items-center">
                  {props.image && (
                    <Image
                      className="mr-3.5 size-6 rounded-full object-contain "
                      source={props.image.source}
                      alt={props.image.alt || 'Author image'}
                    />
                  )}
                  {(props.author || props.role) && (
                    <div className="not-prose flex items-center text-base not-italic">
                      {props.author && <span className="font-bold text-gray-dark">{props.author}</span>}
                      {props.role && (
                        <span className={props.author ? "ml-3 font-normal text-gray-dark" : "font-normal text-gray-dark"}>{props.role}</span>
                      )}
                    </div>
                  )}
                </div>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}
