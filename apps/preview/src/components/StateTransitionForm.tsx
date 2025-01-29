import {
  ModerateContentMutation,
  OperationVariables,
  PreviewDrupalPageQuery,
  useLocation,
} from '@custom/schema';
import { useMutation, useOperation } from '@custom/ui/operations';
import { useForm } from 'react-hook-form';

// @todo Duplicated function, the same exits in the ui package, in the Preview
// route.
function usePreviewParameters(): OperationVariables<
  typeof PreviewDrupalPageQuery
> {
  const [location] = useLocation();

  const nid = location.searchParams.get('nid');
  const rid = location.searchParams.get('rid');
  const lang = location.searchParams.get('lang');
  const previewUserId = location.searchParams.get('preview_user_id');
  const previewAccessToken = location.searchParams.get('preview_access_token');
  return {
    id: nid || '',
    rid: rid || '',
    locale: lang || 'en',
    preview_user_id: previewUserId || '',
    preview_access_token: previewAccessToken || '',
  };
}

export default function StateTransitionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { data, trigger } = useMutation(ModerateContentMutation);
  const { ...previewParams } = usePreviewParameters();

  const {
    data: previewData,
    isLoading: previewIsLoading,
    error: previewError,
  } = useOperation(PreviewDrupalPageQuery, previewParams);
  console.log('Preview data: ', previewData);
  //const transitions

  return (
    <div>
      <form
        onSubmit={handleSubmit((values) => {
          trigger({
            contentId: previewParams.id,
            // We only support the node entity type for now.
            entityType: 'node',
            submittedData: JSON.stringify(values),
          });
        })}
      >
        {errors.name && <p>Name is required.</p>}
        {errors.comment && <p>Comment is required.</p>}
        <div>
          <label>Current state: </label>
          <span>
            {previewData?.preview?.moderationInfo?.currentState?.label}
          </span>
        </div>
        <div>
          <label>Change to: </label>
          <select {...register('new_moderation_state')}>
            {previewData?.preview?.moderationInfo?.availableStates?.map(
              (availableState) => (
                <option key={availableState?.id} value={availableState?.id}>
                  {availableState?.label}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label>Name: </label>
          <input {...register('name', { required: true })} />
        </div>
        <div>
          <label>Comment: </label>
          <textarea {...register('comment', { required: true })} />
        </div>
        <div>
          <input type="submit" />
        </div>
      </form>
    </div>
  );
}
