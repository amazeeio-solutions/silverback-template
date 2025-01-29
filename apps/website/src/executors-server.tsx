import { createDrupalExecutor } from '@custom/cms';
import { createDecapExecutor } from '@custom/decap';
import { OperationExecutorsProvider } from '@custom/schema';
import React, { PropsWithChildren } from 'react';

import { drupalUrl, frontendUrl } from './utils.js';

export const serverExecutors = [
  {
    executor: createDecapExecutor('./node_modules/@custom/decap'),
  },
  {
    executor: createDrupalExecutor(drupalUrl, frontendUrl),
  },
];

export function ServerExecutors({ children }: PropsWithChildren) {
  return (
    <OperationExecutorsProvider executors={serverExecutors}>
      {children}
    </OperationExecutorsProvider>
  );
}
