import { useIntl } from '@amazeelabs/react-intl';
import { TermContentHub, useLocation } from '@custom/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
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

export function SearchForm(props: { termOptions?: TermContentHub[] }) {
  const intl = useIntl();
  type FormValues = z.infer<typeof formValueSchema>;
  const { register, handleSubmit, setValue } = useForm<FormValues>({
    resolver: zodResolver(formValueSchema),
  });
  const params = useSearchParameters();
  const stringifiedParams = JSON.stringify(params);

  useEffect(() => {
    const keys = Object.keys(params) as (keyof FormValues)[];
    for (const key of keys) {
      setValue(key, params[key]);
    }
  }, [stringifiedParams]);

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
                defaultValue={'default'}
                className="border-gray-light bg-gray-lightest text-gray-dark focus:border-kls-orange-primary focus:ring-kls-orange-primary copy-small block w-full rounded-lg border p-3"
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
              className="border-gray-light bg-gray-lightest text-gray-dark focus-within:border-gray-light focus:border-kls-orange-primary focus:ring-kls-orange-primary copy-small block w-full rounded-lg border p-3 shadow-sm"
              placeholder={intl.formatMessage({
                defaultMessage: 'Keyword',
                id: 'fe0rMF',
              })}
            />
          </div>
          <button
            type="submit"
            className="bg-kls-orange-primary hover:bg-kls-orange-accessible focus-visible:outline-kls-orange-primary dark:bg-kls-orange-primary dark:hover:bg-kls-orange-accessible dark:focus:ring-kls-orange-primary copy-small mb-2 rounded-lg px-5 py-3 text-center font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-fit"
          >
            {intl.formatMessage({ defaultMessage: 'Search', id: 'xmcVZ0' })}
          </button>
        </form>
      </div>
    </div>
  );
}
