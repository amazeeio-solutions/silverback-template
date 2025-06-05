import IframeResizer, { IFrameObject } from 'iframe-resizer-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  IframeCommandOther,
  IframeCommandScroll,
  isIframeCommand,
} from '../types/iframe-command';

type OwnProps = {
  buildMessages: (htmlMessages: Array<string>) => JSX.Element | null;
  redirect: (url: string, htmlMessages?: Array<string>) => void;
  scroll?: (to: string, iframeWrapper: HTMLElement) => void;
  /**
   * Not recommended for using in production.
   * Because injecting CSS takes time and produces flashing.
   */
  cssStylesToInject?: string;
};

type Props = OwnProps & IframeResizer.IframeResizerProps;

export const SilverbackIframe = ({
  buildMessages,
  redirect,
  scroll,
  cssStylesToInject,
  ...iframeResizerProps
}: Props) => {
  const silverbackIframeReference = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<IFrameObject>(null);
  const [iframeSeed, setIframeSeed] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [currentCommand, setCurrentCommand] = useState<
    IframeCommandOther | IframeCommandScroll
  >();
  const encodedCurrentUrl = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return btoa(encodeURIComponent(window.location.href));
  }, []);

  // Update iframe src whenever dependencies change
  useEffect(() => {
    if (iframeResizerProps.src) {
      const newSrc = updateUrlParameters(iframeResizerProps.src, {
        iframe: 'true',
        iframeSeed: iframeSeed,
        ref: encodedCurrentUrl,
      });

      setIframeSrc(newSrc);
    }
  }, [iframeResizerProps.src, iframeSeed, encodedCurrentUrl]);

  return (
    <div className="silverback-iframe" ref={silverbackIframeReference}>
      <div className="silverback-iframe-messages">
        {(currentCommand?.action === 'displayMessages' ||
          currentCommand?.action === 'replaceWithMessages') &&
          buildMessages(currentCommand.messages)}
      </div>
      {currentCommand?.action !== 'replaceWithMessages' && (
        <IframeResizer
          {...iframeResizerProps}
          src={iframeSrc}
          forwardRef={iframeRef}
          onMessage={({ message }) => {
            if (!isIframeCommand(message)) {
              return;
            }
            if (message.action === 'init') {
              iframeRef.current?.sendMessage(
                {
                  silverbackIframe: {
                    type: 'init',
                    baseUrl: window.location.origin,
                    injectStyles: cssStylesToInject,
                  },
                },
                '*',
              );
              return;
            }
            if (message.action === 'redirect') {
              redirect(message.path, message.messages);
              // In case if redirect path is the same with the current path,
              // the redirect() call may do nothing (Gatsby case). Here we
              // change the URL of the iframe (and update the iframe contents)
              // to imitate a redirect to the same page.
              setIframeSeed(Date.now().toString());
            } else {
              setCurrentCommand(message);
            }
            if (
              message.action === 'scroll' &&
              silverbackIframeReference &&
              silverbackIframeReference.current
            ) {
              // If the component received a scroll handler, then just call it.
              // Otherwise we fallback to a very simple scroll implementation.
              if (scroll) {
                scroll(message.scroll, silverbackIframeReference.current);
              } else {
                scrollIframe(message.scroll, silverbackIframeReference.current);
              }
            }
          }}
        />
      )}
    </div>
  );
};

const scrollIframe = (to: string, iframeWrapper: HTMLElement) => {
  // For now, we have only implemented the scroll to top feature.
  switch (to) {
    case 'top':
    default:
      iframeWrapper.scrollIntoView({ behavior: 'smooth' });
  }
};

const updateUrlParameters = (
  uri: string,
  parameters: Record<string, string | null>,
): string => {
  let result = uri;
  Object.entries(parameters).forEach(([key, value]) => {
    result = updateUrlParameter(result, key, value);
  });
  return result;
};

const updateUrlParameter = (
  uri: string,
  key: string,
  value: string | null,
): string => {
  try {
    // Create URL object for easy manipulation
    const url = new URL(uri);

    // Get current search params
    const searchParams = url.searchParams;

    if (value === null) {
      // Remove parameter if value is null
      searchParams.delete(key);
    } else {
      // Set or update parameter
      searchParams.set(key, value);
    }

    // Construct the new URL
    url.search = searchParams.toString();

    return url.toString();
  } catch (e) {
    console.error('Error updating URL parameter:', e);

    // Fallback for relative URLs
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const isAbsolute = /^https?:\/\//i.test(uri);
    const base = isAbsolute ? '' : baseUrl;
    const fullUrl = new URL(uri, base);

    if (value === null) {
      fullUrl.searchParams.delete(key);
    } else {
      fullUrl.searchParams.set(key, value);
    }

    // For relative URLs, remove the base part
    const result = fullUrl.toString();
    return isAbsolute ? result : result.slice(base.length);
  }
};
