import { createDrupalExecutor } from '@custom/cms';
import { OperationExecutorsProvider } from '@custom/schema';
import { Frame } from '@custom/ui/routes/Frame';
import { Preview, usePreviewRefresh } from '@custom/ui/routes/Preview';
import { Providers } from '@custom/ui/routes/Providers';
import { useEffect } from 'react';
import { retry } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

declare global {
  interface Window {
    DRUPAL_URL: string;
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
  return (
    <Providers>
      <OperationExecutorsProvider
        executors={[
          {
            executor: createDrupalExecutor(
              window.DRUPAL_URL,
              window.location.pathname,
            ),
          },
        ]}
      >
        <Frame>
          <Preview />
        </Frame>
      </OperationExecutorsProvider>
    </Providers>
  );
}

export default App;
