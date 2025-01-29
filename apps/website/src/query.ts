import {
  AnyOperationId,
  OperationResult,
  OperationVariables,
} from '@custom/schema';

import { drupalUrl } from './utils.js';

export async function query<TOperation extends AnyOperationId>(
  operation: TOperation,
  variables: OperationVariables<TOperation>,
) {
  const url = new URL(`${drupalUrl}/graphql`);
  url.searchParams.set('queryId', operation);
  url.searchParams.set('variables', JSON.stringify(variables || {}));
  const { data, errors } = await (await fetch(url)).json();
  if (errors) {
    throw errors;
  }
  return data as OperationResult<TOperation>;
}
