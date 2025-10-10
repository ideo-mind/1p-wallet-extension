import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <Card className="border-none shadow-soft bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 animate-slide-down">
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
          <AlertCircle className="h-7 w-7 text-white" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-semibold text-sm text-red-900 dark:text-red-100">{message}</p>
          <p className="text-xs text-red-700 dark:text-red-300">Please try again</p>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

