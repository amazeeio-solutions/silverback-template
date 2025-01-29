import type { AnyOperationId, OperationVariables } from '@custom/schema';

export function createDrupalExecutor(host: string, frontendUrl: string) {
  return async function <OperationId extends AnyOperationId>(
    id: OperationId,
    variables?: OperationVariables<OperationId>,
  ) {
    const url = new URL(`${host}/graphql`);
    const isMutation = id.includes('Mutation:');
    const publicUrl =
      typeof window !== 'undefined'
        ? new URL(window.location.href)
        : new URL(frontendUrl);
    const headers = {
      'SLB-Forwarded-Proto': publicUrl.protocol.slice(0, -1),
      'SLB-Forwarded-Host': publicUrl.hostname,
      'SLB-Forwarded-Port': publicUrl.port,
      'X-Forwarded-Proto': publicUrl.protocol.slice(0, -1),
      'X-Forwarded-Host': publicUrl.hostname,
      'X-Forwarded-Port': publicUrl.port,
    };

    const requestInit = (
      isMutation
        ? {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
              queryId: id,
              variables: variables || {},
            }),
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
          }
        : {
            credentials: 'include',
            headers,
          }
    ) satisfies RequestInit;

    if (!isMutation) {
      url.searchParams.set('queryId', id);
      url.searchParams.set('variables', JSON.stringify(variables || {}));
    }

    try {
      const { data, errors } = await (await fetch(url, requestInit)).json();
      if (errors) {
        console.error('GraphQL error:', errors);
        if (!data) {
          throw new Error('GraphQL error: ' + JSON.stringify(errors));
        }
      }
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error(`Fetch error: ${error}`);
    }
  };
}
