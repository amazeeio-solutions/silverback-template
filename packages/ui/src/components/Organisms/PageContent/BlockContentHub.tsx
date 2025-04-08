import { BlockContentHubFragment } from '@custom/schema';
import React from 'react';

import { ContentHub } from '../ContentHub';

export function BlockContentHub(props: BlockContentHubFragment) {
  return <ContentHub {...props} />;
}
