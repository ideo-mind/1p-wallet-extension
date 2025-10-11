import { PixelButton } from '@/components/ui/pixel-button';
import {
  PixelArrowDown,
  PixelArrowLeft,
  PixelArrowRight,
  PixelArrowUp,
} from '@/components/ui/pixel-icons';
import { DIRECTION_TO_COLOR } from '@/constants/protocol';
import { cn } from '@/lib/utils';
import { Direction } from '@/types/protocol';
import { SkipForward } from 'lucide-react';
import { useEffect } from 'react';

interface DirectionInputProps {
  onDirection: (direction: Direction) => void;
  disabled?: boolean;
}

export const DirectionInput = ({ onDirection, disabled = false }: DirectionInputProps) => {
  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled) return;

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        w: 'UP',
        W: 'UP',
        ArrowDown: 'DOWN',
        s: 'DOWN',
        S: 'DOWN',
        ArrowLeft: 'LEFT',
        a: 'LEFT',
        A: 'LEFT',
        ArrowRight: 'RIGHT',
        d: 'RIGHT',
        D: 'RIGHT',
        ' ': 'SKIP',
        Enter: 'SKIP',
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        onDirection(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onDirection, disabled]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {/* Empty space */}
        <div />

        {/* Up */}
        <PixelButton
          onClick={() => onDirection('UP')}
          disabled={disabled}
          size="lg"
          className={cn(
            'h-24 font-pixel transition-all duration-200 hover:scale-110 active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.UP,
            color: disabled ? undefined : '#FFFFFF',
            borderColor: disabled ? undefined : DIRECTION_TO_COLOR.UP,
          }}
          aria-label="Up (Red)"
        >
          <div className="flex flex-col items-center gap-1">
            <PixelArrowUp className="h-8 w-8" />
            <span className="text-sm font-pixel tracking-wider">UP</span>
          </div>
        </PixelButton>

        {/* Empty space */}
        <div />

        {/* Left */}
        <PixelButton
          onClick={() => onDirection('LEFT')}
          disabled={disabled}
          size="lg"
          className={cn(
            'h-24 font-pixel transition-all duration-200 hover:scale-110 active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.LEFT,
            color: disabled ? undefined : '#FFFFFF',
            borderColor: disabled ? undefined : DIRECTION_TO_COLOR.LEFT,
          }}
          aria-label="Left (Blue)"
        >
          <div className="flex flex-col items-center gap-1">
            <PixelArrowLeft className="h-8 w-8" />
            <span className="text-sm font-pixel tracking-wider">LEFT</span>
          </div>
        </PixelButton>

        {/* Skip (center) */}
        <PixelButton
          onClick={() => onDirection('SKIP')}
          disabled={disabled}
          variant="default"
          size="lg"
          className={cn(
            'h-24 font-pixel transition-all duration-200 hover:scale-105 active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Skip"
        >
          <div className="flex flex-col items-center gap-1">
            <SkipForward className="h-8 w-8 stroke-[3]" />
            <span className="text-sm font-pixel tracking-wider">SKIP</span>
          </div>
        </PixelButton>

        {/* Right */}
        <PixelButton
          onClick={() => onDirection('RIGHT')}
          disabled={disabled}
          size="lg"
          className={cn(
            'h-24 font-pixel transition-all duration-200 hover:scale-110 active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.RIGHT,
            color: disabled ? undefined : '#000000',
            borderColor: disabled ? undefined : DIRECTION_TO_COLOR.RIGHT,
          }}
          aria-label="Right (Yellow)"
        >
          <div className="flex flex-col items-center gap-1">
            <PixelArrowRight className="h-8 w-8" />
            <span className="text-sm font-pixel tracking-wider">RIGHT</span>
          </div>
        </PixelButton>

        {/* Empty space */}
        <div />

        {/* Down */}
        <PixelButton
          onClick={() => onDirection('DOWN')}
          disabled={disabled}
          size="lg"
          className={cn(
            'h-24 font-pixel transition-all duration-200 hover:scale-110 active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.DOWN,
            color: disabled ? undefined : '#FFFFFF',
            borderColor: disabled ? undefined : DIRECTION_TO_COLOR.DOWN,
          }}
          aria-label="Down (Green)"
        >
          <div className="flex flex-col items-center gap-1">
            <PixelArrowDown className="h-8 w-8" />
            <span className="text-sm font-pixel tracking-wider">DOWN</span>
          </div>
        </PixelButton>

        {/* Empty space */}
        <div />
      </div>

      <div className="border-4 border-pixel-border bg-pixel-bgDark p-4">
        <p className="text-center text-xs font-pixelSmall text-pixel-text/80">
          KEYBOARD: ARROW KEYS OR WASD • SPACE/ENTER TO SKIP
        </p>
      </div>
    </div>
  );
};
