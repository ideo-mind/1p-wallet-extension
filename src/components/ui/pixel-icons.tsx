import { cn } from '@/lib/utils';
import * as React from 'react';

// Pixel-art style icons using simple shapes and CSS
// These replace the smooth lucide-react icons with chunky pixel equivalents

interface PixelIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

export const PixelCheck: React.FC<PixelIconProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('relative', sizeClasses[size], className)}
    {...props}
  >
    <div className="absolute inset-0 bg-current transform rotate-45 origin-center">
      <div className="absolute top-0 left-0 w-full h-1 bg-current"></div>
      <div className="absolute top-0 left-0 w-1 h-2/3 bg-current"></div>
    </div>
  </div>
);

export const PixelX: React.FC<PixelIconProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('relative', sizeClasses[size], className)}
    {...props}
  >
    <div className="absolute inset-0 bg-current transform rotate-45">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-current transform -translate-y-1/2"></div>
    </div>
    <div className="absolute inset-0 bg-current transform -rotate-45">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-current transform -translate-y-1/2"></div>
    </div>
  </div>
);

export const PixelArrowUp: React.FC<PixelIconProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('relative', sizeClasses[size], className)}
    {...props}
  >
    <div className="absolute top-0 left-1/2 w-1 h-full bg-current transform -translate-x-1/2"></div>
    <div className="absolute top-1/3 left-1/4 w-1/2 h-1 bg-current transform rotate-45 origin-bottom"></div>
    <div className="absolute top-1/3 right-1/4 w-1/2 h-1 bg-current transform -rotate-45 origin-bottom"></div>
  </div>
);

export const PixelArrowDown: React.FC<PixelIconProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('relative', sizeClasses[size], className)}
    {...props}
  >
    <div className="absolute bottom-0 left-1/2 w-1 h-full bg-current transform -translate-x-1/2"></div>
    <div className="absolute bottom-1/3 left-1/4 w-1/2 h-1 bg-current transform rotate-45 origin-top"></div>
    <div className="absolute bottom-1/3 right-1/4 w-1/2 h-1 bg-current transform -rotate-45 origin-top"></div>
  </div>
);

export const PixelArrowLeft: React.FC<PixelIconProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('relative', sizeClasses[size], className)}
    {...props}
  >
    <div className="absolute left-0 top-1/2 h-1 w-full bg-current transform -translate-y-1/2"></div>
    <div className="absolute left-1/3 top-1/4 h-1/2 w-1 bg-current transform rotate-45 origin-right"></div>
    <div className="absolute left-1/3 bottom-1/4 h-1/2 w-1 bg-current transform -rotate-45 origin-right"></div>
  </div>
);

export const PixelArrowRight: React.FC<PixelIconProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('relative', sizeClasses[size], className)}
    {...props}
  >
    <div className="absolute right-0 top-1/2 h-1 w-full bg-current transform -translate-y-1/2"></div>
    <div className="absolute right-1/3 top-1/4 h-1/2 w-1 bg-current transform rotate-45 origin-left"></div>
    <div className="absolute right-1/3 bottom-1/4 h-1/2 w-1 bg-current transform -rotate-45 origin-left"></div>
  </div>
);

export const PixelCoins: React.FC<PixelIconProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('relative', sizeClasses[size], className)}
    {...props}
  >
    <div className="absolute bottom-0 left-0 w-full h-2 border-2 border-current bg-current opacity-80"></div>
    <div className="absolute bottom-1 left-1 w-3/4 h-2 border-2 border-current bg-current opacity-60"></div>
    <div className="absolute bottom-2 left-2 w-1/2 h-2 border-2 border-current bg-current opacity-40"></div>
  </div>
);

export const PixelActivity: React.FC<PixelIconProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('relative', sizeClasses[size], className)}
    {...props}
  >
    <div className="absolute bottom-0 left-0 w-1 h-2 bg-current"></div>
    <div className="absolute bottom-0 left-2 w-1 h-4 bg-current"></div>
    <div className="absolute bottom-0 left-4 w-1 h-3 bg-current"></div>
    <div className="absolute bottom-0 left-6 w-1 h-5 bg-current"></div>
  </div>
);

export const PixelCopy: React.FC<PixelIconProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('relative', sizeClasses[size], className)}
    {...props}
  >
    <div className="absolute top-0 left-0 w-3 h-4 border-2 border-current"></div>
    <div className="absolute top-1 left-1 w-3 h-4 border-2 border-current bg-current opacity-20"></div>
  </div>
);

export const PixelWarning: React.FC<PixelIconProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('relative', sizeClasses[size], className)}
    {...props}
  >
    <div className="absolute top-0 left-1/2 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-current transform -translate-x-1/2"></div>
    <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-current transform -translate-x-1/2"></div>
    <div className="absolute bottom-1 left-1/2 w-1 h-1 bg-current transform -translate-x-1/2"></div>
  </div>
);
