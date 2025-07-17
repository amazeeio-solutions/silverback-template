import React from 'react';

export function Loading() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-kls-orange-bright dark:bg-kls-orange-accessible my-8 animate-pulse rounded-full px-3 py-1 text-center text-xs font-medium leading-none text-white dark:text-white">
        loading...
      </div>
    </div>
  );
}
