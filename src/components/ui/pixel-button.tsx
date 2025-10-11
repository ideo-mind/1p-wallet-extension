import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const pixelButtonVariants = cva(
  'btn-pixel font-pixel uppercase text-xs inline-flex items-center justify-center transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pixel-border focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        teal: 'bg-pixel-teal text-white border-cyan-700',
        blue: 'bg-pixel-blue text-white border-blue-800',
        green: 'bg-pixel-green text-pixel-text border-green-600',
        default: 'bg-pixel-bgDark text-white border-pixel-border',
      },
      size: {
        sm: 'px-3 py-1.5 text-[10px]',
        default: 'px-4 py-2 text-xs',
        lg: 'px-6 py-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pixelButtonVariants> {
  asChild?: boolean;
}

const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(pixelButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
PixelButton.displayName = 'PixelButton';

export { PixelButton, pixelButtonVariants };
