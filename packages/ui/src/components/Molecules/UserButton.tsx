import { Link, Url } from '@custom/schema';
import { signIn, signOut, useSession } from 'next-auth/react';
import React from 'react';
import { useIntl } from '@amazeelabs/react-intl';

export function UserButton() {
  const session = useSession();
  const intl = useIntl();
  return (
    <>
      {!session && <></>}
      {session?.status !== 'authenticated' && (
        <Link
          href={'/api/auth/signin' as Url}
          className="text-gray-500 underline"
          onClick={(e) => {
            e.preventDefault();
            signIn();
          }}
        >
          {intl.formatMessage({
            defaultMessage: 'Sign in',
            id: 'SQJto2',
          })}
        </Link>
      )}
      {session?.status === 'authenticated' && session.data.user && (
        <>
          <Link
            href={`/${intl.locale}/profile` as Url}
            className="text-gray-700 mr-2"
          >
            {session.data.user.name
              ? session.data.user.name
              : session.data.user.email}
          </Link>
          <Link
            href={'/api/auth/signout' as Url}
            className="text-gray-500"
            onClick={(e) => {
              e.preventDefault();
              signOut();
            }}
          >
            {intl.formatMessage({
              defaultMessage: 'Sign out',
              id: 'xXbJso',
            })}
          </Link>
        </>
      )}
    </>
  );
}
