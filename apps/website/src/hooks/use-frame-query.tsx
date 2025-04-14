import { graphql, useStaticQuery } from '@amazeelabs/gatsby-plugin-operations';
import { FrameQuery } from '@custom/schema';

export const useFrameQuery = () => {
  return useStaticQuery(graphql(FrameQuery));
};
