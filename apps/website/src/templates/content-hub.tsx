import { graphql, useStaticQuery } from '@amazeelabs/gatsby-plugin-operations';
import {
  ContentHubTermsQuery,
  OperationExecutorsProvider,
} from '@custom/schema';
import { ContentHub } from '@custom/ui/routes/ContentHub';
import React from 'react';

export function Head() {
  // TODO: Add title once content hub is language aware.
  return null;
}

export default function ContentHubPage() {
  const contentHubTerms = useStaticQuery(graphql(ContentHubTermsQuery));
  return (
    <OperationExecutorsProvider
      executors={[{ executor: contentHubTerms, id: ContentHubTermsQuery }]}
    >
      <ContentHub pageSize={6} />
    </OperationExecutorsProvider>
  );
}
