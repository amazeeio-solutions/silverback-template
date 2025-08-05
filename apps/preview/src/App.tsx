import { OperationExecutorsProvider, useLocation } from '@custom/schema';
import { Frame } from '@custom/ui/routes/Frame';
import { Preview, usePreviewRefresh } from '@custom/ui/routes/Preview';
import { useEffect } from 'react';
import { retry } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { getCookie, setCookie } from 'typescript-cookie';

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

export function usePreviewAccessToken() {
  const [location] = useLocation();
  const preview_access_token =
    location.searchParams.get('preview_access_token') || undefined;
  // If the current location contains a preview token, then persist it in a
  // cookie.
  if (typeof preview_access_token !== 'undefined') {
    setCookie('preview_access_token', preview_access_token, {
      expires: 1,
      sameSite: 'Strict',
      secure: true,
      path: '/',
    });
  }

  return preview_access_token || getCookie('preview_access_token') || undefined;
}

function App() {
  const refresh = usePreviewRefresh();
  useEffect(() => {
    const sub = updates$.subscribe((value) => refresh(value));
    return sub.unsubscribe;
  }, [refresh]);
  const preview_access_token = usePreviewAccessToken();
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
