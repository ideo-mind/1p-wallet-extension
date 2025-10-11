import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PixelCheck, PixelX } from '@/components/ui/pixel-icons';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface SecretInputProps {
  value: string;
  onChange: (value: string) => void;
  confirm?: boolean;
  confirmValue?: string;
  onValidation: (isValid: boolean) => void;
}

export const SecretInput = ({
  value,
  onChange,
  confirm = false,
  confirmValue = '',
  onValidation,
}: SecretInputProps) => {
  const [showSecret, setShowSecret] = useState(false);

  const handleChange = (newValue: string) => {
    // Only allow single character
    if (newValue.length <= 1) {
      onChange(newValue);

      if (!confirm) {
        onValidation(newValue.length === 1);
      } else {
        onValidation(newValue.length === 1 && newValue === value);
      }
    }
  };

  const isValid = !confirm
    ? value.length === 1
    : confirmValue.length === 1 && confirmValue === value;
  const showError = confirm && confirmValue.length === 1 && confirmValue !== value;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <label htmlFor="secret" className="text-sm font-pixel text-pixel-text">
          {confirm ? 'CONFIRM YOUR SECRET CHARACTER' : 'ENTER YOUR SECRET CHARACTER'}
        </label>

        <div className="relative">
          <div className="relative group">
            <Input
              id="secret"
              type={showSecret ? 'text' : 'password'}
              value={confirm ? confirmValue : value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="•"
              maxLength={1}
              pixel={true}
              className={cn(
                'text-center text-4xl font-data h-20 tracking-widest transition-all duration-200',
                isValid && 'border-pixel-green ring-2 ring-pixel-green/20',
                showError && 'border-red-500 ring-2 ring-red-500/20 animate-shake'
              )}
              autoComplete="off"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 border-2 border-pixel-border hover:border-pixel-teal bg-pixel-bgDark text-pixel-text"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {showError && (
          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium animate-slide-down">
            <PixelX className="h-3 w-3" />
            <span>Characters do not match - please try again</span>
          </div>
        )}

        {isValid && (
          <div className="flex items-center gap-2 text-xs text-logo-green font-medium animate-slide-down">
            <PixelCheck className="h-4 w-4 text-pixel-green" />
            <span>{confirm ? 'Perfect! Secret confirmed' : 'Valid character entered'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
