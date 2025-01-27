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
  const [location] = useLocation();

  const nid = location.searchParams.get('nid');

  return (
    <OperationExecutorsProvider
      executors={[{ executor: drupalExecutor(window.GRAPHQL_ENDPOINT, false) }]}
    >
      <Frame>
        <StateTransitionForm contentId={nid || ''} contentType="node" />
        <Preview />
      </Frame>
    </OperationExecutorsProvider>
  );
}

export default App;
