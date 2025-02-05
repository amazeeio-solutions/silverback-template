import { useIntl } from '@amazeelabs/react-intl';
import {
  ModerateContentMutation,
  OperationVariables,
  PreviewDrupalPageQuery,
  useLocation,
} from '@custom/schema';
import { useMutation, useOperation } from '@custom/ui/operations';
import { useState } from 'react';
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
  const [showForm, setShowForm] = useState(false);
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
    <div className="container-page my-10">
      <div className="container-content relative">
        <button
          onClick={() => {
            setShowForm(!showForm);
          }}
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium transition-colors duration-200 ${
            showForm
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {intl.formatMessage({
            defaultMessage: 'Moderate content',
            id: '7dfKlm',
          })}
          <svg
            className={`size-4 transition-transform duration-200 ${
              showForm ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {showForm && (
          <div className="absolute left-0 top-12 z-50 max-w-sm rounded-md border bg-white p-3 shadow-lg">
            <form
              className="space-y-4"
              onSubmit={handleSubmit((values) => {
                trigger({
                  contentId: previewParams.id,
                  // We only support the node entity type for now.
                  entityType: 'node',
                  revisionId: previewParams.rid || '',
                  submittedData: JSON.stringify(values),
                  accessCredentials: {
                    previewUserId: previewParams.preview_user_id || '',
                    previewAccessToken:
                      previewParams.preview_access_token || '',
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
              <div className="!mt-0 flex items-center gap-1">
                <label className="font-medium">
                  {intl.formatMessage({
                    defaultMessage: 'Current state:',
                    id: 'UiUHpE',
                  })}
                </label>
                <span>
                  {previewData?.preview?.moderationInfo?.currentState?.label}
                </span>
              </div>
              <div className="space-y-1">
                <label className="block font-medium">
                  {intl.formatMessage({
                    defaultMessage: 'Change to:',
                    id: 'vcq+xk',
                  })}
                </label>
                <select
                  {...register('new_moderation_state')}
                  className="block w-full rounded-md border-gray-300"
                >
                  {previewData?.preview?.moderationInfo?.availableStates?.map(
                    (availableState) => (
                      <option
                        key={availableState?.id}
                        value={availableState?.id}
                        selected={
                          availableState?.id ===
                            previewData?.preview?.moderationInfo?.currentState
                              ?.id || undefined
                        }
                      >
                        {availableState?.label}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block font-medium">
                  {intl.formatMessage({
                    defaultMessage: 'Name:',
                    id: 'WF8jKB',
                  })}
                </label>
                <input
                  {...register('name', { required: true })}
                  className="block w-full rounded-md border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium">
                  {intl.formatMessage({
                    defaultMessage: 'Comment:',
                    id: '4FQrdH',
                  })}
                </label>
                <textarea
                  {...register('comment', { required: true })}
                  className="block min-h-[100px] w-full rounded-md border-gray-300"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="rounded-md border px-4 py-2"
                >
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
        )}
      </div>
    </div>
  );
}
