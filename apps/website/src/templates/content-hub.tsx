import { graphql, useStaticQuery } from '@amazeelabs/gatsby-plugin-operations';
import { ContentHubTermsQuery } from '@custom/schema';
import { ContentHub } from '@custom/ui/routes/ContentHub';
import React from 'react';

export function Head() {
  // TODO: Add title once content hub is language aware.
  return null;
}

export default function ContentHubPage() {
  const contentHubTerms = useStaticQuery(graphql(ContentHubTermsQuery));
  return (
    <ContentHub
      pageSize={6}
      termsResults={contentHubTerms?.contentHubTerms ?? []}
    />
  );
}
