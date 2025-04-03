import got from 'got';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetch = (query: string): Promise<any> =>
  got
    .post(`${process.env.TEST_URI}/graphql`, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': 'cfdb0555111c0f8924cecab028b53474',
        // Pass the same headers as @amazeelabs/gatsby-source-silverback does.
        // See getForwardedHeaders function in the mentioned package.
        'X-Forwarded-Proto': 'http',
        'X-Forwarded-Host': '127.0.0.1',
        'X-Forwarded-Port': '8000',
        'SLB-Forwarded-Proto': 'http',
        'SLB-Forwarded-Host': '127.0.0.1',
        'SLB-Forwarded-Port': '8000',
      },
      body: JSON.stringify({
        query,
      }),
    })
    .json();
