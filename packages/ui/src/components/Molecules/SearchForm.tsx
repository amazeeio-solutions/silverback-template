import { useIntl } from '@amazeelabs/react-intl';
import { useLocation } from '@custom/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formValueSchema = z.object({
  keyword: z.string().optional(),
});

export function useSearchParameters() {
  const [location] = useLocation();
  return formValueSchema.parse(
    Object.fromEntries(location.searchParams.entries() ?? []),
  );
}

export function SearchForm() {
  const intl = useIntl();
  type FormValues = z.infer<typeof formValueSchema>;
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formValueSchema),
    values: useSearchParameters(),
  });
  const [location, navigate] = useLocation();
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <form
          className="mt-5 sm:flex sm:items-center"
          onSubmit={handleSubmit((values) => {
            navigate(location, { ...values, page: 1 });
          })}
        >
          <div className="mb-2 mr-2 w-full sm:max-w-xs">
            <label htmlFor="keyword" className="sr-only">
              {intl.formatMessage({
                defaultMessage: 'Keyword',
                id: 'fe0rMF',
              })}
            </label>
            <input
              {...register('keyword')}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 shadow-sm focus-within:border-gray-300 focus:ring-0"
              placeholder={intl.formatMessage({
                defaultMessage: 'Keyword',
                id: 'fe0rMF',
              })}
            />
          </div>
          <button
            type="submit"
            className="mb-2 rounded-lg bg-teal-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:w-fit dark:bg-teal-600 dark:hover:bg-teal-600 dark:focus:ring-teal-600"
          >
            {intl.formatMessage({ defaultMessage: 'Search', id: 'xmcVZ0' })}
          </button>
        </form>
      </div>
    </div>
  );
}
