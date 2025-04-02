import { CurrentUserQuery } from '@custom/schema';
import React from 'react';
import { useIntl } from '@amazeelabs/react-intl';

import { useOperation } from '../../utils/operation';

export function UserProfile() {
  const intl = useIntl();
  const { data, isLoading, error } = useOperation(CurrentUserQuery);
  return (
    <div className="bg-white py-12 px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <div className="mt-10">
          {!isLoading && !error && data?.currentUser ? (
            <>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                {data?.currentUser?.name}
              </h1>
              <p className="mt-6 text-lg">
                {intl.formatMessage(
                  { defaultMessage: 'Email: {email}', id: 'uPNlBw' },
                  {
                    email: data?.currentUser?.email,
                  },
                )}
              </p>
              <p className="mt-6 text-lg">
                {intl.formatMessage(
                  {
                    defaultMessage: 'Member for {member_for}',
                    id: 'OZlBcy',
                  },
                  {
                    member_for: data?.currentUser?.memberFor,
                  },
                )}
              </p>
            </>
          ) : (
            <p>
              {intl.formatMessage({
                defaultMessage: 'Sign in to view your profile.',
                id: 'K99M9A',
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
