import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { PixelWarning } from '@/components/ui/pixel-icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <PixelCard className="border-4 border-red-500 bg-red-50 animate-slide-down">
      <PixelCardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="flex h-14 w-14 items-center justify-center border-4 border-pixel-border bg-red-500 shadow-pixel">
          <PixelWarning className="h-7 w-7 text-white" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-pixelSmall text-sm text-pixel-text">{message}</p>
          <p className="text-xs font-pixelSmall text-pixel-text/70">PLEASE TRY AGAIN</p>
        </div>
        {onRetry && (
          <PixelButton
            onClick={onRetry}
            variant="default"
            size="sm"
            className="border-red-500 bg-red-500 text-white"
          >
            TRY AGAIN
          </PixelButton>
        )}
      </PixelCardContent>
    </PixelCard>
  );
};
