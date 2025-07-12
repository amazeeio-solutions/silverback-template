import {
  ContentHubTermsQuery,
  FrameQuery,
  OperationExecutorsProvider,
} from '@custom/schema';
import { Frame } from '@custom/ui/routes/Frame';
import React, { PropsWithChildren } from 'react';

import { useContentHubTermsQuery } from '../hooks/use-content-hub-terms-query';
import { useFrameQuery } from '../hooks/use-frame-query';
import { drupalExecutor } from '../utils/drupal-executor';

export default function Layout({
  children,
}: PropsWithChildren<{
  locale: string;
}>) {
  const frameQuery = useFrameQuery();
  const contentHubTerms = useContentHubTermsQuery();

  return (
    <OperationExecutorsProvider
      executors={[
        { executor: drupalExecutor(`/graphql`) },
        { executor: frameQuery, id: FrameQuery },
        { executor: contentHubTerms, id: ContentHubTermsQuery },
      ]}
    >
      <Frame>{children}</Frame>
    </OperationExecutorsProvider>
  );
}
