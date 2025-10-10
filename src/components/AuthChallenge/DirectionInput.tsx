import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DIRECTION_TO_COLOR } from '@/constants/protocol';
import { cn } from '@/lib/utils';
import { Direction } from '@/types/protocol';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, SkipForward } from 'lucide-react';
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
        <Button
          onClick={() => onDirection('UP')}
          disabled={disabled}
          variant="outline"
          size="lg"
          className={cn(
            'h-24 border-2 font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg hover:shadow-neon animate-fade-in neon-border',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.UP,
            color: disabled ? undefined : '#FFFFFF',
            borderColor: DIRECTION_TO_COLOR.UP,
            boxShadow: disabled ? undefined : `0 8px 20px ${DIRECTION_TO_COLOR.UP}40`,
          }}
          aria-label="Up (Red)"
        >
          <div className="flex flex-col items-center gap-1">
            <ArrowUp className="h-8 w-8 stroke-[3]" />
            <span className="text-sm font-black tracking-wider">UP</span>
          </div>
        </Button>

        {/* Empty space */}
        <div />

        {/* Left */}
        <Button
          onClick={() => onDirection('LEFT')}
          disabled={disabled}
          variant="outline"
          size="lg"
          className={cn(
            'h-24 border-2 font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg hover:shadow-neon animate-fade-in neon-border',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.LEFT,
            color: disabled ? undefined : '#FFFFFF',
            borderColor: DIRECTION_TO_COLOR.LEFT,
            boxShadow: disabled ? undefined : `0 8px 20px ${DIRECTION_TO_COLOR.LEFT}40`,
          }}
          aria-label="Left (Blue)"
        >
          <div className="flex flex-col items-center gap-1">
            <ArrowLeft className="h-8 w-8 stroke-[3]" />
            <span className="text-sm font-black tracking-wider">LEFT</span>
          </div>
        </Button>

        {/* Skip (center) */}
        <Button
          onClick={() => onDirection('SKIP')}
          disabled={disabled}
          variant="secondary"
          size="lg"
          className={cn(
            'h-24 border-2 font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Skip"
        >
          <div className="flex flex-col items-center gap-1">
            <SkipForward className="h-8 w-8 stroke-[3]" />
            <span className="text-sm font-black tracking-wider">SKIP</span>
          </div>
        </Button>

        {/* Right */}
        <Button
          onClick={() => onDirection('RIGHT')}
          disabled={disabled}
          variant="outline"
          size="lg"
          className={cn(
            'h-24 border-2 font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg hover:shadow-neon animate-fade-in neon-border',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.RIGHT,
            color: disabled ? undefined : '#000000',
            borderColor: DIRECTION_TO_COLOR.RIGHT,
            boxShadow: disabled ? undefined : `0 8px 20px ${DIRECTION_TO_COLOR.RIGHT}40`,
          }}
          aria-label="Right (Yellow)"
        >
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="h-8 w-8 stroke-[3]" />
            <span className="text-sm font-black tracking-wider">RIGHT</span>
          </div>
        </Button>

        {/* Empty space */}
        <div />

        {/* Down */}
        <Button
          onClick={() => onDirection('DOWN')}
          disabled={disabled}
          variant="outline"
          size="lg"
          className={cn(
            'h-24 border-2 font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg hover:shadow-neon animate-fade-in neon-border',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            backgroundColor: disabled ? undefined : DIRECTION_TO_COLOR.DOWN,
            color: disabled ? undefined : '#FFFFFF',
            borderColor: DIRECTION_TO_COLOR.DOWN,
            boxShadow: disabled ? undefined : `0 8px 20px ${DIRECTION_TO_COLOR.DOWN}40`,
          }}
          aria-label="Down (Green)"
        >
          <div className="flex flex-col items-center gap-1">
            <ArrowDown className="h-8 w-8 stroke-[3]" />
            <span className="text-sm font-black tracking-wider">DOWN</span>
          </div>
        </Button>

        {/* Empty space */}
        <div />
      </div>

          <Card className="border-none bg-gradient-to-r from-logo-dark/50 to-logo-blue/20">
        <CardContent className="pt-4 pb-4">
          <p className="text-center text-xs font-medium text-muted-foreground animate-pulse-subtle">
            Keyboard: Arrow keys or WASD • Space/Enter to skip
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

