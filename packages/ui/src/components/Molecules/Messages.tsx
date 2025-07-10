import { Html, Markup } from '@custom/schema';
import clsx from 'clsx';
import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import { unorderedItems } from '../Organisms/PageContent/BlockMarkup';
import { Alert } from './Alert';

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
        <Alert key={index} id={index} handleClose={handleRemoveMessage}>
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
                        '!text-kls-orange-primary font-open-sans ml-5 mt-1 mb-1 list-disc messages text-sm font-medium':
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
        </Alert>
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
