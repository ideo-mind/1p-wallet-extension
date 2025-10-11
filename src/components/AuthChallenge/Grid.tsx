import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from '@/components/ui/pixel-card';
import { cn } from '@/lib/utils';
import { ColoredGrid } from '@/types/protocol';

interface GridProps {
  grid: ColoredGrid;
  currentRound: number;
  totalRounds: number;
}

export const Grid = ({ grid, currentRound, totalRounds }: GridProps) => {
  return (
    <PixelCard className="overflow-hidden pixel-grid relative">
      <div className="absolute inset-0 bg-pixel-bg/20 pointer-events-none" />
      <PixelCardHeader className="pb-4 border-b-4 border-pixel-border relative z-10">
        <div className="flex items-center justify-between">
          <PixelCardTitle className="text-lg font-pixel text-pixel-text">
            AUTHENTICATION CHALLENGE
          </PixelCardTitle>
          <div className="flex items-center gap-2 px-3 py-1 border-2 border-pixel-border bg-pixel-bgDark">
            <span className="text-xs font-pixelSmall text-pixel-teal">
              ROUND {currentRound}/{totalRounds}
            </span>
          </div>
        </div>
      </PixelCardHeader>
      <PixelCardContent className="pt-6 relative z-10">
        <div
          className="mx-auto w-fit border-4 border-pixel-border bg-pixel-bgDark p-5 shadow-pixel-lg transition-all duration-300"
          role="grid"
          aria-label={`Authentication grid, round ${currentRound}`}
        >
          {grid.letters.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-2.5" role="row">
              {row.map((letter, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={cn(
                    'grid-cell',
                    'bg-pixel-bg border-pixel-border shadow-pixel hover:shadow-pixel-lg hover:scale-110 hover:border-pixel-teal'
                  )}
                  role="gridcell"
                  style={{
                    color: grid.colors[rowIdx][colIdx],
                    textShadow: `0 0 10px ${grid.colors[rowIdx][colIdx]}80, 0 0 20px ${grid.colors[rowIdx][colIdx]}40`,
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center space-y-1">
          <p className="text-sm font-pixelSmall text-pixel-text">FIND YOUR SECRET LETTER</p>
          <p className="text-xs font-pixelSmall text-pixel-text/70">
            SELECT THE DIRECTION MATCHING YOUR LETTER'S COLOR
          </p>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
};
