'use client';
import { Locale } from '@custom/schema';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import React, { PropsWithChildren, ReactNode, useEffect } from 'react';

import { Messages, readMessages } from './Messages';

export function PageTransitionWrapper({ children }: PropsWithChildren) {
  return (
    <main>
      {useReducedMotion() ? (
        <>{children}</>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {children}
        </AnimatePresence>
      )}
    </main>
  );
}

export function PageTransition({ children }: PropsWithChildren) {
  const [messages, setMessages] = React.useState<Array<string>>([]);
  const [messageComponents, setMessageComponents] = React.useState<
    Array<ReactNode>
  >([]);
  useEffect(() => {
    // Standard messages.
    setMessages(readMessages());
    // Language message.
    const languageMessage = getLanguageMessage(window.location.href);
    if (languageMessage) {
      setMessageComponents([languageMessage]);
    }
  }, []);

  return useReducedMotion() ? (
    <main id="main-content">
      <Messages messages={messages} messageComponents={messageComponents} />
      {children}
    </main>
  ) : (
    <motion.main
      id="main-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        type: 'spring',
        mass: 0.35,
        stiffness: 75,
        duration: 0.3,
      }}
    >
      <Messages messages={messages} messageComponents={messageComponents} />
      {children}
    </motion.main>
  );
}

function getLanguageMessage(url: string): ReactNode {
  const urlObject = new URL(url);
  const contentLanguageNotAvailable =
    urlObject.searchParams.get('content_language_not_available') === 'true';
  if (contentLanguageNotAvailable) {
    const requestedLanguage = urlObject.searchParams.get('requested_language');
    if (requestedLanguage) {
      const translations: {
        [language in Locale]: { message: string; goBack: string };
      } = {
        en: {
          message: 'This page is not available in the requested language.',
          goBack: 'Go back',
        },
        de: {
          message:
            'Diese Seite ist nicht in der angeforderten Sprache verfügbar.',
          goBack: 'Zurück',
        },
        gsw_berne: {
          message:
            'Diese Seite ist nicht in der angeforderten Sprache verfügbar.',
          goBack: 'Zurück',
        },
        fr: {
          message: "Cette page n'est pas disponible dans la langue demandée",
          goBack: 'Retour',
        },
      };
      const translation = translations[requestedLanguage as Locale];
      if (translation) {
        return (
          <div>
            {translation.message}{' '}
            <a
              href="#"
              onClick={() => {
                window.history.back();
              }}
            >
              {translation.goBack}
            </a>
          </div>
        );
      } else {
        console.error(
          `Requested language "${requestedLanguage}" not found in messages.`,
        );
      }
    }
  }
}
