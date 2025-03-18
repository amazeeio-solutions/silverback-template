import { OperationExecutorsProvider, useLocation } from '@custom/schema';
import { Frame } from '@custom/ui/routes/Frame';
import { Preview, usePreviewRefresh } from '@custom/ui/routes/Preview';
import { useEffect } from 'react';
import { retry } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

import { drupalExecutor } from './drupal-executor';

declare global {
  interface Window {
    GRAPHQL_ENDPOINT: string;
  }
}

type PreviewRefresh = Parameters<ReturnType<typeof usePreviewRefresh>>[0];

const updates$ = webSocket<PreviewRefresh>({
  url: `${window.location.origin.replace('http', 'ws')}/__preview`,
}).pipe(
  retry({
    delay: 3000,
  }),
);

function App() {
  const refresh = usePreviewRefresh();
  useEffect(() => {
    const sub = updates$.subscribe((value) => refresh(value));
    return sub.unsubscribe;
  }, [refresh]);
  const [location] = useLocation();
  const preview_access_token =
    location.searchParams.get('preview_access_token') || undefined;
  return (
    <OperationExecutorsProvider
      executors={[
        {
          executor: drupalExecutor(
            window.GRAPHQL_ENDPOINT,
            false,
            preview_access_token,
          ),
        },
      ]}
    >
      <Frame>
        <Preview />
      </Frame>
    </OperationExecutorsProvider>
  );
}

export default App;
