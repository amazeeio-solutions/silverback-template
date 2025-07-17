import {
  type AnyOperationId,
  OperationExecutorsProvider,
  type OperationResult,
  type OperationVariables,
} from '@custom/schema';
import { Decorator } from '@storybook/react';
import React from 'react';

export type Executor<T extends AnyOperationId> =
  | OperationResult<T>
  | ((
      id: T,
      vars: OperationVariables<T>,
    ) => Promise<OperationResult<T>> | OperationResult<T>);

declare module '@storybook/react' {
  interface Parameters {
    executors?: Record<AnyOperationId, Executor<AnyOperationId>>;
  }
}

export const ExecutorsDecorator: Decorator = (Story, context) => {
  const executors = context.parameters.executors || {};
  console.log(executors);
  const keys = Object.keys(executors) as Array<keyof typeof executors>;
  return (
    <OperationExecutorsProvider
      executors={keys.map((id) => ({ id, executor: executors[id] }))}
    >
      <Story {...context} />
    </OperationExecutorsProvider>
  );
};
