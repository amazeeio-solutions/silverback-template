import { useIntl } from '@amazeelabs/react-intl';
import { TermContentHub, useLocation } from '@custom/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z, ZodType } from 'zod';

import { ContentHubQueryArgs } from '../Organisms/ContentHub';

const formValueSchema = z.object({
  title: z.string().optional(),
  terms: z.string().optional(),
}) satisfies ZodType<ContentHubQueryArgs>;

export function useSearchParameters() {
  const [location] = useLocation();
  return formValueSchema.parse(
    Object.fromEntries(location.searchParams.entries() ?? []),
  );
}

export function SearchForm(props: {
  termOptions?: TermContentHub[];
  defaultKeyword?: string;
  defaultTerm?: string;
}) {
  const intl = useIntl();
  type FormValues = z.infer<typeof formValueSchema>;

  const [isUsingDefaultKeyword, setIsUsingDefaultKeyword] = useState(false);
  const [isUsingDefaultTerm, setIsUsingDefaultTerm] = useState(false);

  const { register, handleSubmit, setValue } = useForm<FormValues>({
    resolver: zodResolver(formValueSchema),
    defaultValues: {
      title: props.defaultKeyword || '',
      terms: props.defaultTerm || '',
    },
  });
  const params = useSearchParameters();
  const stringifiedParams = JSON.stringify(params);

  useEffect(() => {
    const keys = Object.keys(params) as (keyof FormValues)[];
    for (const key of keys) {
      setValue(key, params[key]);
    }

    // Set default keyword if no title is in URL params
    if (!params.title && props.defaultKeyword) {
      setValue('title', props.defaultKeyword);
      setIsUsingDefaultKeyword(true);
    } else {
      setIsUsingDefaultKeyword(false);
    }

    // Set default term if no terms is in URL params
    if (!params.terms && props.defaultTerm) {
      setValue('terms', props.defaultTerm);
      setIsUsingDefaultTerm(true);
    } else {
      setIsUsingDefaultTerm(false);
    }
  }, [
    params,
    props.defaultKeyword,
    props.defaultTerm,
    setValue,
    stringifiedParams,
  ]);

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
          {props.termOptions && props.termOptions.length > 0 ? (
            <div className="mb-2 mr-2 w-full sm:max-w-xs">
              <label htmlFor="terms" className="sr-only">
                {intl.formatMessage({
                  defaultMessage: 'Filter by terms',
                  id: 'EqfeAF',
                })}
              </label>
              <select
                id="terms"
                {...register('terms')}
                disabled={isUsingDefaultTerm}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-80"
              >
                <option key="default" value="">
                  {intl.formatMessage({
                    defaultMessage: 'Filter by terms',
                    id: 'EqfeAF',
                  })}
                </option>
                {props.termOptions.map((term) => (
                  <option key={term.termId} value={term.termId}>
                    {term.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="mb-2 mr-2 w-full sm:max-w-xs">
            <label htmlFor="keyword" className="sr-only">
              {intl.formatMessage({
                defaultMessage: 'Keyword',
                id: 'fe0rMF',
              })}
            </label>
            <input
              {...register('title')}
              disabled={isUsingDefaultKeyword}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 shadow-sm focus-within:border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-80"
              placeholder={intl.formatMessage({
                defaultMessage: 'Keyword',
                id: 'fe0rMF',
              })}
            />
          </div>
          <button
            type="submit"
            className="mb-2 rounded-lg bg-indigo-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-fit dark:bg-indigo-600 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
          >
            {intl.formatMessage({ defaultMessage: 'Search', id: 'xmcVZ0' })}
          </button>
        </form>
      </div>
    </div>
  );
}
