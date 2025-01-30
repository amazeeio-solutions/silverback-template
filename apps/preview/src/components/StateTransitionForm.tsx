import { useIntl } from '@amazeelabs/react-intl';
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
  const { data, trigger, isMutating } = useMutation(ModerateContentMutation);
  const { ...previewParams } = usePreviewParameters();

  const {
    data: previewData,
    isLoading: previewIsLoading,
    error: previewError,
  } = useOperation(PreviewDrupalPageQuery, previewParams);

  const intl = useIntl();

  const errorMessages =
    !isMutating &&
    data &&
    data.moderateContent?.errors &&
    data.moderateContent.errors.length > 0
      ? data.moderateContent.errors.map((error) => {
          return error?.message || '';
        })
      : null;
  const successMessage =
    !isMutating && data && data.moderateContent?.result === 'success'
      ? intl.formatMessage({
          defaultMessage: 'The moderation state has been updated.',
          id: 'hZBzvI',
        })
      : null;

  if (previewIsLoading) {
    return null;
  }
  if (previewError) {
    return (
      <div>
        <p>
          {intl.formatMessage({
            defaultMessage:
              'The moderation state transition form cannot be displayed because the content failed to load.',
            id: 'mFbroE',
          })}
        </p>
      </div>
    );
  }
  return (
    <div>
      <form
        onSubmit={handleSubmit((values) => {
          trigger({
            contentId: previewParams.id,
            // We only support the node entity type for now.
            entityType: 'node',
            revisionId: previewParams.rid || '',
            submittedData: JSON.stringify(values),
            accessCredentials: {
              previewUserId: previewParams.preview_user_id || '',
              previewAccessToken: previewParams.preview_access_token || '',
            },
          });
        })}
      >
        {/* Error / success messages after the form has been submittd. */}
        {successMessage ? (
          <ul>
            <li>{successMessage}</li>
          </ul>
        ) : null}
        {errorMessages ? (
          <ul>
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        ) : null}
        {/* Errors from the form validation on client side. */}
        {errors && (
          <ul>
            {errors.name && (
              <li>
                {intl.formatMessage(
                  {
                    defaultMessage: '{field} is required.',
                    id: 'pc9YT+',
                  },
                  {
                    field: intl.formatMessage({
                      defaultMessage: 'Name',
                      id: 'HAlOn1',
                    }),
                  },
                )}
              </li>
            )}
            {errors.comment && (
              <li>
                {intl.formatMessage(
                  {
                    defaultMessage: '{field} is required.',
                    id: 'pc9YT+',
                  },
                  {
                    field: intl.formatMessage({
                      defaultMessage: 'Comment',
                      id: 'LgbKvU',
                    }),
                  },
                )}
              </li>
            )}
          </ul>
        )}
        <div>
          <label>
            {intl.formatMessage({
              defaultMessage: 'Current state:',
              id: 'UiUHpE',
            })}{' '}
          </label>
          <span>
            {previewData?.preview?.moderationInfo?.currentState?.label}
          </span>
        </div>
        <div>
          <label>
            {intl.formatMessage({
              defaultMessage: 'Change to:',
              id: 'vcq+xk',
            })}{' '}
          </label>
          <select {...register('new_moderation_state')}>
            {previewData?.preview?.moderationInfo?.availableStates?.map(
              (availableState) => (
                <option
                  key={availableState?.id}
                  value={availableState?.id}
                  selected={
                    availableState?.id ===
                      previewData?.preview?.moderationInfo?.currentState?.id ||
                    undefined
                  }
                >
                  {availableState?.label}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label>
            {intl.formatMessage({
              defaultMessage: 'Name:',
              id: 'WF8jKB',
            })}{' '}
          </label>
          <input {...register('name', { required: true })} />
        </div>
        <div>
          <label>
            {intl.formatMessage({
              defaultMessage: 'Comment:',
              id: '4FQrdH',
            })}{' '}
          </label>
          <textarea {...register('comment', { required: true })} />
        </div>
        <div>
          <button type="submit" disabled={isMutating}>
            {isMutating
              ? intl.formatMessage({
                  defaultMessage: 'Sending...',
                  id: '82Y7Sa',
                })
              : intl.formatMessage({
                  defaultMessage: 'Submit',
                  id: 'wSZR47',
                })}
          </button>
        </div>
      </form>
    </div>
  );
}
