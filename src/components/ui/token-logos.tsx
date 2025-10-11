import { cn } from '@/lib/utils';
import React from 'react';

interface TokenLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Ethereum Logo - Chain links symbol
export const EthereumLogo: React.FC<TokenLogoProps> = ({
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
      <svg viewBox="0 0 24 24" className="w-full h-full">
        {/* Ethereum diamond shape */}
        <path
          d="M12 2L2 13l10 9 10-9L12 2z"
          fill="currentColor"
          className="text-blue-500"
        />
        <path
          d="M12 5.5L4 13l8 7.5 8-7.5L12 5.5z"
          fill="currentColor"
          className="text-blue-300"
        />
      </svg>
    </div>
  );
};

// 1P Protocol Logo - Lightning bolt
export const OnePProtocolLogo: React.FC<TokenLogoProps> = ({
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
      <svg viewBox="0 0 24 24" className="w-full h-full">
        {/* Lightning bolt shape */}
        <path
          d="M13 2L3 14h7l-3 8 10-12h-7l3-8z"
          fill="currentColor"
          className="text-pixel-teal"
        />
      </svg>
    </div>
  );
};

// USDC Logo - Dollar sign in circle
export const USDCLogo: React.FC<TokenLogoProps> = ({
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
      <svg viewBox="0 0 24 24" className="w-full h-full">
        {/* Circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="currentColor"
          className="text-green-500"
        />
        {/* Dollar sign */}
        <path
          d="M12 2v2m0 16v2M9 6h6m-6 12h6m-3-8v8m0-16v8"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// Generic token logo fallback
export const GenericTokenLogo: React.FC<TokenLogoProps> = ({
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn('flex items-center justify-center', sizeClasses[size], className)}>
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="currentColor"
          className="text-pixel-blue"
        />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="12"
          fill="white"
          fontWeight="bold"
        >
          ?
        </text>
      </svg>
    </div>
  );
};
