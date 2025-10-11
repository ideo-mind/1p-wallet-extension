import { PixelBackground } from '@/components/effects/PixelBackground';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  return (
    <div className={cn('flex items-center justify-center', className)} role="status">
      <div className="relative">
        <div
          className={cn(
            'animate-spin border-4 border-pixel-border border-t-pixel-teal',
            sizeMap[size]
          )}
        />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const LoadingOverlay = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-pixel-bg z-50">
      <PixelBackground variant="grid" />
      <div className="space-y-6 text-center relative z-10">
        <div className="relative mx-auto">
          <LoadingSpinner size="lg" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-pixel text-pixel-text">{message}</p>
          <div className="flex items-center justify-center gap-1">
            <div
              className="h-1.5 w-1.5 bg-pixel-blue animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="h-1.5 w-1.5 bg-pixel-teal animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="h-1.5 w-1.5 bg-pixel-green animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
