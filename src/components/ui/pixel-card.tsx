import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const pixelCardVariants = cva(
  'card-pixel',
  {
    variants: {
      variant: {
        default: 'bg-pixel-bgDark',
        teal: 'bg-pixel-teal text-white',
        blue: 'bg-pixel-blue text-white',
        green: 'bg-pixel-green text-pixel-text',
        light: 'bg-pixel-bg text-pixel-text',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface PixelCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pixelCardVariants> {}

const PixelCard = React.forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(pixelCardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);
PixelCard.displayName = 'PixelCard';

const PixelCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
PixelCardHeader.displayName = 'PixelCardHeader';

const PixelCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-pixel leading-none tracking-tight', className)}
    {...props}
  />
));
PixelCardTitle.displayName = 'PixelCardTitle';

const PixelCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm font-pixelSmall text-pixel-text/80', className)}
    {...props}
  />
));
PixelCardDescription.displayName = 'PixelCardDescription';

const PixelCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
PixelCardContent.displayName = 'PixelCardContent';

const PixelCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
PixelCardFooter.displayName = 'PixelCardFooter';

export {
    PixelCard, PixelCardContent, PixelCardDescription, PixelCardFooter, PixelCardHeader, PixelCardTitle
};

