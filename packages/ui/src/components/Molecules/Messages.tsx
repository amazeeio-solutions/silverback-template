import { Html, Markup } from '@custom/schema';
import clsx from 'clsx';
import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import { unorderedItems } from '../Organisms/PageContent/BlockMarkup';

export function Messages(props: {
  messages: Array<string>;
  messageComponents?: Array<ReactNode>;
}) {
  const [displayMessages, setDisplayMessages] = useState<string[]>([]);
  const [messageComponents, setMessageComponents] = React.useState<
    Array<ReactNode>
  >([]);

  useEffect(() => {
    setDisplayMessages(props.messages);
    if (props.messageComponents) {
      setMessageComponents(props.messageComponents);
    }
  }, [props.messages]);

  const handleRemoveMessage = (index: number) => {
    const newMessages = displayMessages.filter((_, i) => i !== index);
    setDisplayMessages(newMessages);
    storeMessages(newMessages);
  };

  return (
    <div className="container-page">
      <div className="container-content">
        {buildMessages(displayMessages, handleRemoveMessage)}
        {buildMessages(messageComponents)}
      </div>
    </div>
  );
}

export const buildMessages = (
  messages: Array<string> | Array<ReactNode>,
  handleRemoveMessage?: (index: number) => void,
) => {
  return (
    <>
      {messages.map((message, index) => (
        <div
          key={index}
          className="my-4 flex items-center border-t-4 border-teal-300 bg-teal-50 p-4 text-teal-800"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="mr-3 size-4 shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div className="prose-a:font-semibold prose-a:underline text-sm font-medium">
            {typeof message === 'string' ? (
              <Html
                key={index}
                markup={message as Markup}
                plugins={[unorderedItems]}
                components={{
                  li: ({
                    unordered,
                    children,
                    className,
                    ...props
                  }: PropsWithChildren<{
                    unordered?: boolean;
                    className?: string;
                  }>) => {
                    return (
                      <li
                        {...props}
                        className={clsx(className, {
                          '!text-teal-800 ml-5 mt-1 mb-1 list-disc messages text-sm font-medium':
                            unordered,
                        })}
                      >
                        {children}
                      </li>
                    );
                  },
                }}
              />
            ) : (
              message
            )}
          </div>
          {handleRemoveMessage && (
            <button
              type="button"
              className="-m-1.5 ms-auto inline-flex size-8 items-center justify-center rounded-lg bg-teal-50 p-1.5 text-teal-500 hover:bg-teal-200 focus:ring-2 focus:ring-teal-400"
              data-dismiss-target={`#alert-${index + 1}`}
              onClick={() => handleRemoveMessage(index)}
              aria-label={`Close message ${index + 1}`}
            >
              <span className="sr-only">Close</span>
              <svg
                className="size-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </>
  );
};

export const storeMessages = (messages: Array<string>): void => {
  localStorage.setItem('messages', JSON.stringify(messages));
};

export const readMessages = (): Array<string> => {
  const serialized = localStorage.getItem('messages');
  localStorage.removeItem('messages');
  if (serialized) {
    try {
      const messages = JSON.parse(serialized);
      if (
        Array.isArray(messages) &&
        messages.every((message) => typeof message === 'string')
      ) {
        return messages;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return [];
    }
  }
  return [];
};
