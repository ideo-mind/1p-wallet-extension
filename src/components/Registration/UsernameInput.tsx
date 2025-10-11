import { Input } from '@/components/ui/input';
import { PixelCheck, PixelX } from '@/components/ui/pixel-icons';
import { cn } from '@/lib/utils';
import { mockBackendService } from '@/services/mock/backend';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation: (isValid: boolean) => void;
}

export const UsernameInput = ({ value, onChange, onValidation }: UsernameInputProps) => {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUsername = async () => {
      // Reset state
      setError(null);
      setAvailable(null);

      // Validate format
      if (value.length === 0) {
        onValidation(false);
        return;
      }

      if (value.length < 3) {
        setError('Username must be at least 3 characters');
        onValidation(false);
        return;
      }

      if (value.length > 20) {
        setError('Username must be at most 20 characters');
        onValidation(false);
        return;
      }

      if (!/^[a-z0-9]+$/.test(value)) {
        setError('Username must be lowercase letters and numbers only');
        onValidation(false);
        return;
      }

      // Check availability
      setChecking(true);
      try {
        const result = await mockBackendService.checkUsername(value);
        if (result.success && result.data) {
          setAvailable(result.data.available);
          onValidation(result.data.available);
        }
      } catch (err) {
        setError('Failed to check username availability');
        onValidation(false);
      } finally {
        setChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounceTimer);
  }, [value, onValidation]);

  return (
    <div className="space-y-3">
      <label htmlFor="username" className="text-sm font-pixelSmall text-pixel-text">
        CHOOSE YOUR USERNAME
      </label>

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              id="username"
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value.toLowerCase())}
              placeholder="vitalik"
              pattern="[a-z0-9]{3,20}"
              pixel={true}
              className={cn(
                'h-12 text-base transition-all duration-200',
                available === true && 'border-pixel-green ring-2 ring-pixel-green/20',
                (available === false || error) && 'border-red-500 ring-2 ring-red-500/20'
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checking && <Loader2 className="h-5 w-5 animate-spin text-pixel-blue" />}
              {!checking && (available === false || error) && (
                <div className="flex h-6 w-6 items-center justify-center border-2 border-pixel-border bg-red-500 shadow-pixel-sm">
                  <PixelX className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center px-4 py-2.5 border-4 border-pixel-border bg-pixel-teal text-white font-pixel text-base shadow-pixel whitespace-nowrap">
            .1p
          </div>
        </div>
      </div>

      {checking && (
        <div className="flex items-center gap-2 text-xs font-pixelSmall text-pixel-text/70 animate-fade-in">
          <div className="h-1 w-1 rounded-full bg-pixel-blue animate-pulse"></div>
          <span>CHECKING AVAILABILITY...</span>
        </div>
      )}

      {!checking && available === true && (
        <div className="flex items-center gap-2 text-xs font-pixelSmall text-pixel-green animate-slide-down">
          <PixelCheck className="h-3 w-3" />
          <span>USERNAME AVAILABLE! LOOKING GOOD</span>
        </div>
      )}

      {!checking && available === false && !error && (
        <div className="flex items-center gap-2 text-xs font-pixelSmall text-red-600 animate-slide-down">
          <PixelX className="h-3 w-3" />
          <span>USERNAME ALREADY TAKEN - TRY ANOTHER</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs font-pixelSmall text-red-600 animate-slide-down">
          <PixelX className="h-3 w-3" />
          <span>{error.toUpperCase()}</span>
        </div>
      )}

      {!error && !checking && !available && value.length === 0 && (
        <p className="text-xs font-pixelSmall text-pixel-text/60">
          3-20 CHARACTERS, LOWERCASE LETTERS AND NUMBERS ONLY
        </p>
      )}
    </div>
  );
};

