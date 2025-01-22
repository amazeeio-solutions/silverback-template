import React, {
  ReactComponentElement,
  ReactElement,
  ReactNode,
  useEffect,
} from 'react';
import { DotButton, useDotButton } from './CarouselDotButton';
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from './CarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';
import clsx from 'clsx';

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
        <div
          className={clsx(
            'embla__container grid grid-flow-col gap-4 touch-pan-y touch-pinch-zoom',
            {
              'auto-cols-[100%]': visibleSlides === 1,
              'auto-cols-[50%]': visibleSlides === 2,
              'auto-cols-[33%]': visibleSlides === 3,
              'auto-cols-[25%]': visibleSlides === 4,
            },
          )}
        >
          {React.Children.map(children, (child, index) => (
            <div key={index} className="embla__slide min-w-0 p-2">
              {child}
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls grid grid-cols-[auto_1fr] justify-between gap-4 mt-4">
        <div className="embla__buttons grid grid-cols-[repeat(2,1fr)] gap-2">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="embla__dots flex flex-wrap gap-2 justify-end align-center">
          {scrollSnaps.map((_: unknown, index: number) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={clsx(
                'embla__dot touch-manipulation cursor-pointer w-6 h-6 inline-flex items-center justify-center rounded-[50%] text-gray-400',
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
