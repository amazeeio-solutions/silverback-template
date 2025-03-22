import React from 'react';

export function Loading() {
  return (
    <div className="flex items-center justify-center">
      <div className="my-8 animate-pulse rounded-full bg-teal-200 px-3 py-1 text-center text-xs font-medium leading-none text-teal-800 dark:bg-teal-900 dark:text-teal-200">
        loading...
      </div>
    </div>
  );
}
