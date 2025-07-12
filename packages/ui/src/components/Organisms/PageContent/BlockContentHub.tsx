import { BlockContentHubFragment } from '@custom/schema';
import React from 'react';

import { ContentHub } from '../ContentHub';

type BlockContentHubProps = BlockContentHubFragment & {
  blockId?: string;
};

export function BlockContentHub(props: BlockContentHubProps) {
  const { blockId, ...rest } = props;
  return <ContentHub {...rest} {...(blockId ? { blockId } : {})} />;
}
