'use client';
import { BlockConditionalFragment } from '@custom/schema';
import React, { useEffect, useState } from 'react';

import { isTruthy } from '../../../utils/isTruthy';
import { CommonContent } from '../PageDisplay';

export function BlockConditional(props: BlockConditionalFragment) {
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    const active = {
      scheduledDisplay: [
        props.displayFrom
          ? new Date(props.displayFrom).getTime() <= new Date().getTime()
          : true,
        props.displayTo
          ? new Date(props.displayTo).getTime() > new Date().getTime()
          : true,
      ].every(Boolean),
    };
    setIsActive(Object.values(active).every(Boolean));
  }, [props.displayTo, props.displayFrom]);

  return isActive ? (
    <>
      {props.content?.filter(isTruthy).map((block, index) => {
        return <CommonContent key={index} {...block} />;
      })}
    </>
  ) : null;
}
