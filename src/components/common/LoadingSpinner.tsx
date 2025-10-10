import { UnifiedBackground } from '@/components/effects/UnifiedBackground';
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
            'animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-transparent',
            sizeMap[size]
          )}
              style={{
                borderTopColor: 'var(--logo-blue)',
              }}
        />
            <div className={cn('absolute inset-0 rounded-full bg-gradient-to-r from-logo-teal to-logo-blue opacity-20 blur-md animate-neon-pulse', sizeMap[size])}></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const LoadingOverlay = ({
  message = 'Loading...',
}: {
  message?: string;
}) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-indigo-950/95 backdrop-blur-md z-50">
      <UnifiedBackground variant="default" color="teal" />
      <div className="space-y-6 text-center relative z-10">
        <div className="relative mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-logo-teal to-logo-blue rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <LoadingSpinner size="lg" />
        </div>
        <div className="space-y-2 scanline">
          <p className="text-base font-semibold text-foreground gradient-text">{message}</p>
          <div className="flex items-center justify-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-logo-blue animate-bounce shadow-neon-blue" style={{ animationDelay: '0ms' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-logo-teal animate-bounce shadow-neon" style={{ animationDelay: '150ms' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-logo-green animate-bounce shadow-neon-green" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

