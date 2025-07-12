import { graphql, useStaticQuery } from '@amazeelabs/gatsby-plugin-operations';
import { ContentHubTermsQuery } from '@custom/schema';

export const useContentHubTermsQuery = () => {
  return useStaticQuery(graphql(ContentHubTermsQuery));
};
