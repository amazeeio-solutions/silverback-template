import {
  BlockCtaFragment,
  CtaIconPosition,
  CtaIconType,
  Link,
  Url,
} from '@custom/schema';
import clsx from 'clsx';
import React from 'react';

import { FadeUp } from '../../Molecules/FadeUp';

export function BlockCta(props: BlockCtaFragment) {
  return (
    <FadeUp yGap={50}>
      <div className="container-page">
        <div className="container-content">
          <div className="container-text my-2 lg:my-3">
            <Link
              className={clsx(
                {
                  'flex-row-reverse':
                    props.iconPosition === CtaIconPosition.Before,
                },
                'border-kls-orange-primary text-kls-orange-primary hover:bg-kls-orange-primary focus:ring-kls-orange-accent group flex w-fit flex-row items-center  gap-2 rounded-lg border px-3 py-2 text-center text-xs font-medium leading-[1.125rem] transition-all duration-200 ease-in-out hover:text-white focus:outline-none focus:ring-4',
              )}
              href={props.url ?? ('/' as Url)}
              target={props.openInNewTab ? '_blank' : '_self'}
              rel="noreferrer"
            >
              {props.text}
              {!!props.icon && props.icon === CtaIconType.Arrow && (
                <ArrowRightIcon />
              )}
            </Link>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 15"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.83401 4.23435C9.98403 4.08437 10.1875 4.00012 10.3996 4.00012C10.6117 4.00012 10.8152 4.08437 10.9652 4.23435L14.1652 7.43435C14.3152 7.58437 14.3994 7.78782 14.3994 7.99995C14.3994 8.21208 14.3152 8.41553 14.1652 8.56555L10.9652 11.7656C10.8143 11.9113 10.6122 11.9919 10.4025 11.9901C10.1927 11.9883 9.99208 11.9041 9.84375 11.7558C9.69543 11.6075 9.61129 11.4068 9.60947 11.1971C9.60765 10.9873 9.68828 10.7852 9.83401 10.6344L11.6684 8.79995H2.39961C2.18744 8.79995 1.98395 8.71567 1.83392 8.56564C1.68389 8.41561 1.59961 8.21212 1.59961 7.99995C1.59961 7.78778 1.68389 7.5843 1.83392 7.43427C1.98395 7.28424 2.18744 7.19995 2.39961 7.19995H11.6684L9.83401 5.36555C9.68403 5.21553 9.59978 5.01208 9.59978 4.79995C9.59978 4.58782 9.68403 4.38437 9.83401 4.23435Z"
      className=" fill-kls-orange-primary transition-all duration-200 ease-in-out group-hover:fill-white"
    />
  </svg>
);
