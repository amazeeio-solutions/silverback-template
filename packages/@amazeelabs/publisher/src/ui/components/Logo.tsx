import React from 'react';

import { logoLockupPath } from '../../shared/brand';

/**
 * The amazee.io primary horizontal lockup.
 *
 * The brand guidelines allow the lockup in black or white only, so the artwork
 * takes `currentColor` and the call site picks the colour with a text utility
 * based on its background. The viewBox already carries the mandated clear space,
 * so it needs no extra padding.
 */
export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 461"
      fill="currentColor"
      role="img"
      aria-label="amazee.io"
      className={className}
    >
      <path d={logoLockupPath} />
    </svg>
  );
}
