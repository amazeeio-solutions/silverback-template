import React from 'react';

export function Loading() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-kls-orange-bright text-white dark:bg-kls-orange-accessible dark:text-white my-8 animate-pulse rounded-full px-3 py-1 text-center text-xs font-medium leading-none">
        loading...
      </div>
    </div>
  );
}
