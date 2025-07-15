import clsx from 'clsx';
import { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import React, { ReactNode, useEffect } from 'react';

import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from './CarouselArrowButtons';
import { DotButton, useDotButton } from './CarouselDotButton';

export function Carousel({
  children,
  options,
  visibleSlides = 2,
}: {
  children: ReactNode;
  options: EmblaOptionsType;
  visibleSlides?: number;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  useEffect(() => {
    if (emblaApi) {
      // Do we want to use emblaApi for anything?
      // console.log(emblaApi.slideNodes());
    }
  }, [emblaApi]);

  return (
    <div className="embla m-auto max-w-full">
      <div className="embla__viewport overflow-hidden" ref={emblaRef}>
        <ul
          className={clsx(
            'embla__container grid touch-pan-y touch-pinch-zoom grid-flow-col gap-4',
            {
              'auto-cols-[100%]': visibleSlides === 1,
              'auto-cols-[50%]': visibleSlides === 2,
              'auto-cols-[33%]': visibleSlides === 3,
              'auto-cols-[25%]': visibleSlides === 4,
            },
          )}
        >
          {React.Children.map(children, (child, index) => (
            <li
              key={index}
              className="embla__slide grid min-w-0 grid-cols-subgrid p-2"
            >
              {child}
            </li>
          ))}
        </ul>
      </div>

      <div className="embla__controls mt-4 grid grid-cols-[auto_1fr] justify-between gap-4">
        <div className="embla__buttons grid grid-cols-[repeat(2,1fr)] gap-2">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="embla__dots align-center flex flex-wrap justify-end gap-2">
          {scrollSnaps.map((_: unknown, index: number) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={clsx(
                'embla__dot inline-flex size-6 cursor-pointer touch-manipulation items-center justify-center rounded-[50%] text-gray-400',
                {
                  'embla__dot--selected bg-gray-800': index === selectedIndex,
                  'bg-gray-200': index !== selectedIndex,
                },
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
