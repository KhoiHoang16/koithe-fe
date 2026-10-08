import * as React from 'react';
import { cn } from '@/shared/libs/utils';

/** Skeleton loading placeholder */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
