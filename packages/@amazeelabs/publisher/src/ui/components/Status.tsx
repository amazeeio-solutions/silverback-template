import '../tailwind.css';

import clsx from 'clsx';
import React, { useEffect } from 'react';

import { ApplicationState } from '../../shared/exports';
import { sameOriginDestination } from '../utils/destination';
import Logo from './Logo';

export default function Status({
  status,
}: {
  status: ApplicationState | null;
}) {
  useEffect(() => {
    if (status !== ApplicationState.Ready) {
      return;
    }
    const destination = sameOriginDestination(
      new URLSearchParams(window.location.search).get('dest'),
    );
    if (destination) {
      window.location.href = destination;
    }
  }, [status]);

  let inProgress: boolean | undefined;
  if (
    status === ApplicationState.Updating ||
    status === ApplicationState.Starting
  ) {
    inProgress = true;
  }

  return (
    <div className={'flex h-screen items-center justify-center bg-surface p-4'}>
      <div
        className={
          'w-full max-w-[90%] overflow-hidden rounded-lg border border-line bg-card text-ink shadow-sm md:max-w-lg'
        }
      >
        <div className={'flex justify-center px-6 pt-8'}>
          <Logo className={'w-40 text-ink'} />
        </div>
        <div className={'px-6 pb-10 pt-6 text-center'}>
          {/* A fixed-height slot, so swapping the state icon never shifts the
              label below it. */}
          <div
            data-status-icon
            className={'mx-auto mb-4 flex h-20 items-center justify-center'}
          >
            {inProgress ? (
              <svg
                version="1.1"
                id="L9"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="18 48 27 38"
                enableBackground="new 0 0 0 0"
                className={'h-14 w-auto'}
                aria-hidden="true"
              >
                <rect
                  x="20"
                  y="50"
                  width="3"
                  height="14"
                  className="fill-accent"
                >
                  <animateTransform
                    attributeType="xml"
                    attributeName="transform"
                    type="translate"
                    values="0 0; 0 20; 0 0"
                    begin="0"
                    dur="0.8s"
                    repeatCount="indefinite"
                  ></animateTransform>
                </rect>
                <rect
                  x="30"
                  y="50"
                  width="3"
                  height="14"
                  className="fill-accent"
                >
                  <animateTransform
                    attributeType="xml"
                    attributeName="transform"
                    type="translate"
                    values="0 0; 0 20; 0 0"
                    begin="0.2s"
                    dur="0.8s"
                    repeatCount="indefinite"
                  ></animateTransform>
                </rect>
                <rect
                  x="40"
                  y="50"
                  width="3"
                  height="14"
                  className="fill-accent"
                >
                  <animateTransform
                    attributeType="xml"
                    attributeName="transform"
                    type="translate"
                    values="0 0; 0 20; 0 0"
                    begin="0.4s"
                    dur="0.8s"
                    repeatCount="indefinite"
                  ></animateTransform>
                </rect>
              </svg>
            ) : null}
            {status === ApplicationState.Ready ? (
              <svg
                version="1.1"
                className="h-14 w-auto"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 37 37"
                xmlSpace="preserve"
                aria-hidden="true"
              >
                <path
                  className="tick-circle stroke-success"
                  style={{
                    fill: 'none',
                    strokeWidth: '1',
                    strokeLinejoin: 'round',
                    strokeMiterlimit: '10',
                  }}
                  d="M30.5,6.5L30.5,6.5c6.6,6.6,6.6,17.4,0,24l0,0c-6.6,6.6-17.4,6.6-24,0l0,0c-6.6-6.6-6.6-17.4,0-24l0,0C13.1-0.2,23.9-0.2,30.5,6.5z"
                />
                <polyline
                  className="tick-path stroke-success"
                  style={{
                    fill: 'none',
                    strokeWidth: '1',
                    strokeLinejoin: 'round',
                    strokeMiterlimit: '10',
                  }}
                  points="11.6,20 15.9,24.2 26.4,13.8 "
                />
              </svg>
            ) : null}
            {status === ApplicationState.Error ? (
              <svg
                className="h-14 w-auto -rotate-90 stroke-[1.5]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
                aria-hidden="true"
              >
                <circle
                  className="cross-circle stroke-error"
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                />
                <path
                  className="cross-path stroke-error"
                  fill="none"
                  d="M16,16 l20,20"
                />
                <path
                  className="cross-path stroke-error"
                  fill="none"
                  d="M16,36 l20,-20"
                />
              </svg>
            ) : null}
          </div>
          <div className={'text-lg font-medium tracking-tight md:text-2xl'}>
            {status === ApplicationState.Starting ? (
              <span>Starting...</span>
            ) : null}
            {status === ApplicationState.Error ? <span>Error!</span> : null}
            {status === ApplicationState.Ready ? <span>Ready!</span> : null}
          </div>
        </div>
        <div
          className={clsx('h-[3px] w-full overflow-hidden', {
            // The brand palette has no yellow, and Mermaid Blue is its active
            // colour, so it carries the in-progress state.
            'bg-accent': inProgress,
            'bg-success': status === ApplicationState.Ready,
            'bg-error': status === ApplicationState.Error,
          })}
        >
          {inProgress ? (
            <div className="h-[3px] animate-bounce bg-marine"></div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
