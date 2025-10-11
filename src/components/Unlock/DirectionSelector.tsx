import { Direction } from '@/types/protocol';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import React, { useEffect } from 'react';

interface DirectionSelectorProps {
  onSelect: (direction: Direction) => void;
  disabled?: boolean;
}

type DirectionType = Exclude<Direction, 'SKIP'>;

const DIRECTION_ICONS = {
  UP: ArrowUp,
  DOWN: ArrowDown,
  LEFT: ArrowLeft,
  RIGHT: ArrowRight,
};

export const DirectionSelector: React.FC<DirectionSelectorProps> = ({
  onSelect,
  disabled = false,
}) => {
  const directions: DirectionType[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      let direction: DirectionType | null = null;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'RIGHT';
          break;
      }

      if (direction) {
        e.preventDefault();
        onSelect(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onSelect]);

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-center">
        <h3 className="text-lg font-pixel text-pixel-text mb-1">SELECT DIRECTION</h3>
        <p className="text-xs font-pixelSmall text-pixel-text/70 mb-2">
          Find your password character and click the direction you assigned to its color
        </p>
        <p className="text-xs font-pixelSmall text-pixel-text/50">
          Use arrow keys or WASD for keyboard input
        </p>
      </div>

      {/* Direction Grid */}
      <div className="grid grid-cols-2 gap-3">
        {directions.map((direction) => {
          const Icon = DIRECTION_ICONS[direction];

          return (
            <button
              key={direction}
              onClick={() => onSelect(direction)}
              disabled={disabled}
              className={`
                relative p-6 border-4 transition-all duration-200
                ${
                  disabled
                    ? 'border-pixel-border bg-pixel-bg/50 cursor-not-allowed opacity-50'
                    : 'border-pixel-border bg-pixel-bg hover:scale-105 hover:shadow-pixel-lg hover:border-pixel-teal'
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className="h-8 w-8 text-pixel-text filter drop-shadow-lg" />
                <span className="font-pixel text-sm text-pixel-text drop-shadow-lg">{direction}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="p-3 border-2 border-pixel-border bg-pixel-bg/50">
        <p className="text-xs font-pixelSmall text-pixel-text/70 text-center">
          Look at the character grid above to find your password character's color
        </p>
      </div>
    </div>
  );
};

