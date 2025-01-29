import { Operation, useLocation, ViewPageQuery } from '@custom/schema';
import React from 'react';

import { isTruthy } from '../../utils/isTruthy';
import { Translations } from '../../utils/translations';
import { PageDisplay } from '../Organisms/PageDisplay';

export function Page() {
  // Retrieve the current location and attemt to load
  // that page from all systems.
  const [loc] = useLocation();
  return (
    <Operation
      id={ViewPageQuery}
      variables={{ pathname: loc.pathname }}
      all={true}
    >
      {(result) => {
        if (result.state === 'success') {
          const page = result.data.filter((res) => !!res.page).pop()?.page;
          if (page) {
            const translations = Object.fromEntries(
              page.translations
                ?.filter(isTruthy)
                .map((translation) => [translation.locale, translation.path]) ||
                [],
            );
            return (
              <Translations translations={translations}>
                <PageDisplay {...page} />
              </Translations>
            );
          }
        }
      }}
    </Operation>
  );
}
