import { isValidCharacter } from '@/utils/colorAssignment';
import React, { useEffect, useRef } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation: (isValid: boolean) => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  onValidation,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase();

    // Only allow single character
    if (newValue.length <= 1) {
      onChange(newValue);
      onValidation(newValue.length === 1 && isValidCharacter(newValue));
    }
  };

  return (
    <div className="space-y-4">
      {/* Password Input */}
      <div className="p-6 border-4 border-pixel-border bg-pixel-bgDark">
        <label htmlFor="password-input" className="block text-center mb-4">
          <span className="text-xs font-pixelSmall text-pixel-text/70">
            ENTER YOUR PASSWORD
          </span>
        </label>
        <input
          ref={inputRef}
          id="password-input"
          type="password"
          value={value}
          onChange={handleChange}
          maxLength={1}
          placeholder="•"
          autoComplete="off"
          className="w-full h-24 text-center text-6xl font-data bg-black border-4 border-pixel-border text-pixel-teal focus:border-pixel-teal focus:outline-none focus:ring-2 focus:ring-pixel-teal placeholder:text-pixel-text/20"
        />
      </div>

      {/* Instructions */}
      <div className="p-4 border-2 border-pixel-border bg-pixel-bg/50">
        <p className="text-sm font-pixelSmall text-pixel-text/90 text-center mb-2">
          Type a single character from your keyboard
        </p>
        <p className="text-xs font-pixelSmall text-pixel-text/70 text-center">
          Allowed: Letters (a-z), Numbers (0-9), Special ($, #, !, %)
        </p>
      </div>

      {/* Validation feedback */}
      {value && (
        <div
          className={`p-3 border-2 ${
            isValidCharacter(value)
              ? 'border-pixel-green bg-pixel-green/10'
              : 'border-pixel-accent bg-pixel-accent/10'
          }`}
        >
          <p
            className={`text-xs font-pixelSmall text-center ${
              isValidCharacter(value) ? 'text-pixel-green' : 'text-pixel-accent'
            }`}
          >
            {isValidCharacter(value)
              ? '✓ Valid password character'
              : '✗ Invalid character. Use a-z, 0-9, $, #, !, or %'}
          </p>
        </div>
      )}
    </div>
  );
};

