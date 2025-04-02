import React from 'react';

import { PageTransition } from '../Molecules/PageTransition';
import { UserProfile as UserProfileOrganism } from '../Organisms/UserProfile';

export function UserProfile() {
  return (
    <PageTransition>
      <UserProfileOrganism />
    </PageTransition>
  );
}
