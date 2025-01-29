'use client';
import { useIntl } from '@amazeelabs/react-intl';
import { PageFragment } from '@custom/schema';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';

import { UnreachableCaseError } from '../../utils/unreachable-case-error';

type Props = Required<PageFragment>['editLink'];

export function ContentEditLink({ url, type }: Props) {
  const intl = useIntl();
  const [shouldDisplay, setShouldDisplay] = useState(false);
  useEffect(() => {
    if (isLoggedIn(type)) {
      setShouldDisplay(true);
    }
  }, [type]);
  return shouldDisplay ? (
    <div className="container-content relative">
      <a
        href={url}
        target="_blank"
        className="absolute right-0 z-50 bg-orange-400 px-5 py-2 text-white hover:bg-orange-500"
        rel="noreferrer"
      >
        {intl.formatMessage({ defaultMessage: 'Edit', id: 'wEQDC6' })}
      </a>
    </div>
  ) : null;
}

function isLoggedIn(type: Props['type']): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  if ('IS_STORYBOOK' in window && window.IS_STORYBOOK) {
    return true;
  }

  /* eslint-disable no-case-declarations */
  switch (type) {
    case 'drupal':
      const sessionExpire = localStorage.getItem('drupalSessionExpire');
      if (!sessionExpire) {
        return false;
      }
      let isLoggedInDrupal = false;
      try {
        isLoggedInDrupal = Date.now() < new Date(sessionExpire).getTime();
      } catch (error) {
        console.error(error);
      }
      return isLoggedInDrupal;

    case 'decap':
      const isLoggedInDecap = !!Cookies.get('decap-cms-logged-in');
      return isLoggedInDecap;

    default:
      throw new UnreachableCaseError(type);
  }
  /* eslint-enable no-case-declarations */
}
