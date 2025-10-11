import { cn } from '@/lib/utils';
import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  pixel?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, pixel = false, ...props }, ref) => {
    if (pixel) {
      return (
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-none border-4 border-pixel-border bg-pixel-bg px-3 py-2 text-sm font-data text-pixel-text ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-pixel-text/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pixel-border focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };

