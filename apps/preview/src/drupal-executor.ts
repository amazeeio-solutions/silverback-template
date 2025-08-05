import { AnyOperationId, OperationVariables } from '@custom/schema';

/**
 * Create an executor that operates against a Drupal endpoint.
 */
export function drupalExecutor(
  endpoint: string,
  forward: boolean = true,
  preview_access_token?: string,
) {
  return async function <OperationId extends AnyOperationId>(
    id: OperationId,
    variables?: OperationVariables<OperationId>,
  ) {
    const url = new URL(endpoint, window.location.origin);
    const isMutation = id.includes('Mutation:');
    if (isMutation) {
      const { data, errors } = await (
        await fetch(url, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            queryId: id,
            variables: variables || {},
          }),
          headers: forward
            ? {
                'SLB-Forwarded-Proto': window.location.protocol.slice(0, -1),
                'SLB-Forwarded-Host': window.location.hostname,
                'SLB-Forwarded-Port': window.location.port,
                'Content-Type': 'application/json',
              }
            : {
                'Content-Type': 'application/json',
              },
        })
      ).json();
      if (errors) {
        throw errors;
      }
      return data;
    } else {
      url.searchParams.set('queryId', id);
      url.searchParams.set('variables', JSON.stringify(variables || {}));
      if (preview_access_token) {
        url.searchParams.set('preview_access_token', preview_access_token);
      }
      const { data, errors } = await (
        await fetch(url, {
          credentials: 'include',
          headers: forward
            ? {
                'SLB-Forwarded-Proto': window.location.protocol.slice(0, -1),
                'SLB-Forwarded-Host': window.location.hostname,
                'SLB-Forwarded-Port': window.location.port,
              }
            : {},
        })
      ).json();
      if (errors) {
        throw errors;
      }
      return data;
    }
  };
}
