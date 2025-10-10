import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, Eye, EyeOff, X } from 'lucide-react';
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
  onValidation
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

  const isValid = !confirm ? value.length === 1 : confirmValue.length === 1 && confirmValue === value;
  const showError = confirm && confirmValue.length === 1 && confirmValue !== value;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <label htmlFor="secret" className="text-sm font-semibold">
          {confirm ? 'Confirm your secret character' : 'Enter your secret character'}
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
              className={cn(
                'text-center text-4xl font-bold h-20 tracking-widest transition-all duration-200',
                isValid && 'border-logo-green ring-2 ring-logo-green/20 shadow-neon-green',
                showError && 'border-red-500 ring-2 ring-red-500/20 animate-shake'
              )}
              autoComplete="off"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-white/50 dark:hover:bg-black/20"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {showError && (
          <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium animate-slide-down">
            <X className="h-3 w-3" />
            <span>Characters do not match - please try again</span>
          </div>
        )}

        {isValid && (
          <div className="flex items-center gap-2 text-xs text-logo-green font-medium animate-slide-down">
            <Check className="h-4 w-4 text-logo-green" />
            <span>{confirm ? 'Perfect! Secret confirmed' : 'Valid character entered'}</span>
          </div>
        )}
      </div>

      {!confirm && (
        <Card className="border-none shadow-soft bg-gradient-to-br from-amber-950/50 to-orange-950/50 neon-border">
          <CardContent className="flex gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex-shrink-0 shadow-neon animate-neon-pulse">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Critical: Never store your secret anywhere
              </p>
              <p className="text-xs text-amber-200 leading-relaxed">
                Your single-letter secret is the <span className="font-semibold">only key</span> to your wallet.
                It must exist <span className="font-semibold">only in your memory</span>.
                Never write it down, save it digitally, or share it with anyone.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

