import {
  ModerateContentMutation,
  OperationExecutorsProvider,
  useLocation,
} from '@custom/schema';
import { useMutation } from '@custom/ui/operations';
import { Frame } from '@custom/ui/routes/Frame';
import { Preview, usePreviewRefresh } from '@custom/ui/routes/Preview';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

function StateTransitionForm({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { data, trigger } = useMutation(ModerateContentMutation);
  return (
    <div>
      <form
        onSubmit={handleSubmit((values) => {
          trigger({
            contentId: contentId,
            contentType: contentType,
            submittedData: JSON.stringify(values),
          });
        })}
      >
        <div>
          <label>Name</label>
          <input {...register('name', { required: true })} />
        </div>
        <div>
          <label>Comment</label>
          <textarea {...register('comment', { required: true })} />
        </div>
        {errors.name && <p>Name is required.</p>}
        {errors.comment && <p>Comment is required.</p>}
        <div>
          <input type="submit" />
        </div>
      </form>
    </div>
  );
}

function App() {
  const refresh = usePreviewRefresh();
  useEffect(() => {
    const sub = updates$.subscribe((value) => refresh(value));
    return sub.unsubscribe;
  }, [refresh]);
  const preview_access_token = usePreviewAccessToken();
  const [location] = useLocation();

  const nid = location.searchParams.get('nid');

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
        <StateTransitionForm contentId={nid || ''} contentType="node" />
        <Preview />
      </Frame>
    </OperationExecutorsProvider>
  );
}

export default App;
