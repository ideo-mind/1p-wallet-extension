import { cn } from '@/lib/utils';
import React from 'react';

interface PixelBackgroundProps {
  variant?: 'grid' | 'dots' | 'static';
  className?: string;
}

export const PixelBackground: React.FC<PixelBackgroundProps> = ({
  variant = 'grid',
  className
}) => {
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'grid':
        return 'pixel-grid';
      case 'dots':
        return 'bg-pixel-bg';
      case 'static':
        return 'bg-pixel-bg';
      default:
        return 'pixel-grid';
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 pointer-events-none z-0',
        getBackgroundStyle(),
        className
      )}
    />
  );
};
