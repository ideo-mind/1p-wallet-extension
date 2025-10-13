import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { UnifiedBackground } from '@/components/effects/UnifiedBackground';
import { Button } from '@/components/ui/button';
import { AuthenticationChallenge, Direction } from '@/types/protocol';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DirectionInput } from './DirectionInput';
import { Grid } from './Grid';
import { ProgressBar } from './ProgressBar';

interface ChallengeContainerProps {
  challenge: AuthenticationChallenge;
  onSubmit: (directions: Direction[]) => Promise<void>;
  onCancel?: () => void;
}

export const ChallengeContainer = ({ challenge, onSubmit, onCancel }: ChallengeContainerProps) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setCurrentRound(0);
    setDirections([]);
    setError(null);
    setSuccess(false);
  }, [challenge]);

  const handleDirectionSelect = async (direction: Direction) => {
    const newDirections = [...directions, direction];
    setDirections(newDirections);

    // Move to next round
    if (currentRound + 1 < challenge.rounds) {
      setCurrentRound(currentRound + 1);
    } else {
      // All rounds complete, submit
      await handleSubmit(newDirections);
    }
  };

  const handleSubmit = async (finalDirections: Direction[]) => {
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(finalDirections);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setSubmitting(false);
    }
  };

  if (submitting && !error) {
    return <LoadingOverlay message="Verifying authentication..." />;
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-scale-in relative">
        <UnifiedBackground variant="dense" color="green" />
        <div className="relative z-10">
          <div className="absolute inset-0 bg-logo-green rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-logo-green to-emerald-600 shadow-neon-green animate-neon-pulse">
            <CheckCircle className="h-14 w-14 text-white animate-scale-in" />
          </div>
        </div>
        <div className="text-center space-y-2 relative z-10">
          <h2 className="text-2xl font-bold gradient-text animate-slide-up">Authentication Successful!</h2>
          <p className="text-sm text-muted-foreground animate-fade-in">Your transaction will proceed shortly</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 animate-slide-down">
        <ErrorMessage message={error} onRetry={() => {
          setError(null);
          setCurrentRound(0);
          setDirections([]);
        }} />
        {onCancel && (
          <Button onClick={onCancel} variant="outline" className="w-full h-11">
            Cancel
          </Button>
        )}
      </div>
    );
  }

  const currentGrid = challenge.grids[currentRound];

  return (
    <div className="h-full flex flex-col space-y-3 animate-fade-in relative">
      <UnifiedBackground variant="subtle" color="blue" />

      {/* Compact Progress */}
      <div className="relative z-10 flex-shrink-0">
        <ProgressBar current={currentRound + 1} total={challenge.rounds} />
      </div>

      {/* Grid - Takes most space */}
      <div className="relative z-10 flex-1 min-h-0">
        <Grid grid={currentGrid} currentRound={currentRound + 1} totalRounds={challenge.rounds} />
      </div>

      {/* Direction Input - Compact */}
      <div className="relative z-10 flex-shrink-0">
        <DirectionInput onDirection={handleDirectionSelect} disabled={submitting} />
      </div>

      {/* Cancel Button - Compact */}
      {onCancel && (
        <Button
          onClick={onCancel}
          variant="ghost"
          className="w-full relative z-10 hover:scale-105 transition-all duration-200"
          size="sm"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

