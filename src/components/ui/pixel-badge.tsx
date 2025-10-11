import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const pixelBadgeVariants = cva(
  'inline-flex items-center rounded-none border-2 font-pixel text-xs uppercase tracking-wider',
  {
    variants: {
      variant: {
        default: 'border-pixel-border bg-pixel-bgDark text-white',
        teal: 'border-cyan-700 bg-pixel-teal text-white',
        blue: 'border-blue-800 bg-pixel-blue text-white',
        green: 'border-green-600 bg-pixel-green text-pixel-text',
        outline: 'border-pixel-border text-pixel-text',
        success: 'border-green-600 bg-green-600 text-white',
        warning: 'border-yellow-600 bg-yellow-500 text-black',
        error: 'border-red-600 bg-red-600 text-white',
      },
      size: {
        default: 'px-2 py-1 text-xs',
        sm: 'px-1.5 py-0.5 text-[10px]',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface PixelBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pixelBadgeVariants> {}

function PixelBadge({ className, variant, size, ...props }: PixelBadgeProps) {
  return (
    <div
      className={cn(pixelBadgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { PixelBadge, pixelBadgeVariants };
