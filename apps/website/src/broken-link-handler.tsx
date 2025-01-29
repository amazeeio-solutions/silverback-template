'use client';
import React, { PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export function BrokenLinkHandler({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      onError={(error) => {
        if ('statusCode' in error && error.statusCode === 404) {
          window.location.reload();
        } else {
          console.error(error);
        }
      }}
      fallback={<h1>Something went wrong.</h1>}
    >
      {children}
    </ErrorBoundary>
  );
}
