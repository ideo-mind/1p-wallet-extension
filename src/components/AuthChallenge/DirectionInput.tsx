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
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {/* Empty space */}
        <div />

        {/* Up */}
        <PixelButton
          onClick={() => onDirection('UP')}
          disabled={disabled}
          size="sm"
          className={cn(
            'h-16 font-pixel transition-all duration-200 hover:scale-110 active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.UP,
            color: disabled ? undefined : '#FFFFFF',
            borderColor: disabled ? undefined : DIRECTION_TO_COLOR.UP,
          }}
          aria-label="Up (Red)"
        >
          <div className="flex flex-col items-center gap-0.5">
            <PixelArrowUp className="h-5 w-5" />
            <span className="text-xs font-pixel tracking-wider">UP</span>
          </div>
        </PixelButton>

        {/* Empty space */}
        <div />

        {/* Left */}
        <PixelButton
          onClick={() => onDirection('LEFT')}
          disabled={disabled}
          size="sm"
          className={cn(
            'h-16 font-pixel transition-all duration-200 hover:scale-110 active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.LEFT,
            color: disabled ? undefined : '#FFFFFF',
            borderColor: disabled ? undefined : DIRECTION_TO_COLOR.LEFT,
          }}
          aria-label="Left (Blue)"
        >
          <div className="flex flex-col items-center gap-0.5">
            <PixelArrowLeft className="h-5 w-5" />
            <span className="text-xs font-pixel tracking-wider">LEFT</span>
          </div>
        </PixelButton>

        {/* Skip (center) */}
        <PixelButton
          onClick={() => onDirection('SKIP')}
          disabled={disabled}
          variant="default"
          size="sm"
          className={cn(
            'h-16 font-pixel transition-all duration-200 hover:scale-105 active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Skip"
        >
          <div className="flex flex-col items-center gap-0.5">
            <SkipForward className="h-5 w-5 stroke-[3]" />
            <span className="text-xs font-pixel tracking-wider">SKIP</span>
          </div>
        </PixelButton>

        {/* Right */}
        <PixelButton
          onClick={() => onDirection('RIGHT')}
          disabled={disabled}
          size="sm"
          className={cn(
            'h-16 font-pixel transition-all duration-200 hover:scale-110 active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.RIGHT,
            color: disabled ? undefined : '#000000',
            borderColor: disabled ? undefined : DIRECTION_TO_COLOR.RIGHT,
          }}
          aria-label="Right (Yellow)"
        >
          <div className="flex flex-col items-center gap-0.5">
            <PixelArrowRight className="h-5 w-5" />
            <span className="text-xs font-pixel tracking-wider">RIGHT</span>
          </div>
        </PixelButton>

        {/* Empty space */}
        <div />

        {/* Down */}
        <PixelButton
          onClick={() => onDirection('DOWN')}
          disabled={disabled}
          size="sm"
          className={cn(
            'h-16 font-pixel transition-all duration-200 hover:scale-110 active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.DOWN,
            color: disabled ? undefined : '#FFFFFF',
            borderColor: disabled ? undefined : DIRECTION_TO_COLOR.DOWN,
          }}
          aria-label="Down (Green)"
        >
          <div className="flex flex-col items-center gap-0.5">
            <PixelArrowDown className="h-5 w-5" />
            <span className="text-xs font-pixel tracking-wider">DOWN</span>
          </div>
        </PixelButton>

        {/* Empty space */}
        <div />
      </div>

      <div className="border-2 border-pixel-border bg-pixel-bgDark p-2">
        <p className="text-center text-xs font-pixelSmall text-pixel-text/80">
          ARROW KEYS OR WASD • SPACE/ENTER TO SKIP
        </p>
      </div>
    </div>
  );
};
