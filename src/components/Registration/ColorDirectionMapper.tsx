import { PROTOCOL_COLORS } from '@/constants/protocol';
import { Direction } from '@/types/protocol';
import { ColorDirectionMapping } from '@/types/storage';
import { Check, RotateCcw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ColorDirectionMapperProps {
  value: ColorDirectionMapping | null;
  onChange: (mapping: ColorDirectionMapping) => void;
  onValidation: (isValid: boolean) => void;
}

type ColorKey = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
type DirectionType = Exclude<Direction, 'SKIP'>;

const COLORS: ColorKey[] = ['RED', 'GREEN', 'BLUE', 'YELLOW'];

export const ColorDirectionMapper: React.FC<ColorDirectionMapperProps> = ({
  value,
  onChange,
  onValidation,
}) => {
  const [mapping, setMapping] = useState<Partial<ColorDirectionMapping>>(value || {});
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [usedDirections, setUsedDirections] = useState<Set<DirectionType>>(new Set());

  const currentColor = COLORS[currentColorIndex];
  const isComplete = COLORS.every((color) => mapping[color] !== undefined);

  useEffect(() => {
    // Auto-focus for keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;

      let direction: DirectionType | null = null;

      // Map keyboard keys to directions
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

      if (direction && !usedDirections.has(direction)) {
        e.preventDefault();
        handleDirectionAssign(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentColorIndex, usedDirections, isComplete]);

  const handleDirectionAssign = (direction: DirectionType) => {
    const newMapping = { ...mapping, [currentColor]: direction };
    const newUsedDirections = new Set(usedDirections);
    newUsedDirections.add(direction);

    setMapping(newMapping);
    setUsedDirections(newUsedDirections);

    // Move to next color
    if (currentColorIndex < COLORS.length - 1) {
      setCurrentColorIndex(currentColorIndex + 1);
    }

    // Check if complete
    const complete = COLORS.every((color) => newMapping[color] !== undefined);
    onValidation(complete);

    if (complete) {
      console.log('=== COLOR DIRECTION MAPPER DEBUG ===');
      console.log('Complete mapping:', JSON.stringify(newMapping, null, 2));
      console.log('Type of newMapping:', typeof newMapping);
      console.log('Keys:', Object.keys(newMapping));
      console.log('=====================================');
      onChange(newMapping as ColorDirectionMapping);
    }
  };

  const handleReset = () => {
    setMapping({});
    setUsedDirections(new Set());
    setCurrentColorIndex(0);
    onValidation(false);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="p-4 border-2 border-pixel-border bg-pixel-bg/50">
        <p className="text-sm font-pixelSmall text-pixel-text/90 text-center mb-2">
          {isComplete
            ? 'All colors assigned! Click continue to proceed.'
            : 'Press arrow keys (↑ ↓ ← →) to assign direction'}
        </p>
        <p className="text-xs font-pixelSmall text-pixel-text/70 text-center">
          {!isComplete && 'Keyboard: Arrow keys or WASD'}
        </p>
      </div>

      {/* Color Boxes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-pixelSmall text-pixel-text/70">
            ASSIGN DIRECTIONS ({Object.keys(mapping).length}/{COLORS.length})
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-pixelSmall text-pixel-text/70 hover:text-pixel-teal transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            RESET
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {COLORS.map((color, index) => {
            const isAssigned = mapping[color] !== undefined;
            const isCurrent = index === currentColorIndex && !isComplete;

            return (
              <div
                key={color}
                className={`
                  relative p-6 border-4 transition-all duration-200
                  ${
                    isCurrent
                      ? 'border-pixel-teal bg-pixel-bgDark shadow-pixel-lg scale-105 animate-pulse'
                      : isAssigned
                        ? 'border-pixel-green bg-pixel-bg'
                        : 'border-pixel-border bg-pixel-bg/50 opacity-50'
                  }
                `}
              >
                {/* Color block */}
                <div
                  className="h-16 w-full border-2 border-pixel-border shadow-pixel mb-3"
                  style={{ backgroundColor: PROTOCOL_COLORS[color] }}
                />

                {/* Color name */}
                <p className="text-center font-pixel text-sm text-pixel-text">{color}</p>

                {/* Assigned indicator (don't show the direction) */}
                {isAssigned && (
                  <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center border-2 border-white bg-pixel-green shadow-pixel">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}

                {/* Current indicator */}
                {isCurrent && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="px-2 py-1 border-2 border-pixel-teal bg-pixel-teal text-white">
                      <span className="text-xs font-pixelSmall">ACTIVE</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Used directions hint (don't show which color they're assigned to) */}
      {usedDirections.size > 0 && !isComplete && (
        <div className="p-3 border-2 border-pixel-border bg-pixel-bgDark">
          <p className="text-xs font-pixelSmall text-pixel-text/70 text-center">
            Used directions: {Array.from(usedDirections).join(', ')}
          </p>
        </div>
      )}

      {/* Completion Status */}
      {isComplete && (
        <div className="p-4 border-2 border-pixel-green bg-pixel-green/10 animate-fade-in">
          <p className="text-sm font-pixelSmall text-pixel-green text-center">
            ✓ All colors assigned! Your mapping is saved securely.
          </p>
        </div>
      )}
    </div>
  );
};

