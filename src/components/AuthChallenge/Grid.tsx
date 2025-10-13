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
  // Calculate optimal cell size based on grid dimensions
  const rows = grid.letters.length;
  const cols = grid.letters[0]?.length || 0;

  // For popup (400px width), calculate max cell size
  const maxGridWidth = 360; // Leave margin for padding
  const maxGridHeight = 300; // Leave space for header and instructions

  const cellSize = Math.min(
    Math.floor(maxGridWidth / cols) - 4, // -4 for gaps
    Math.floor(maxGridHeight / rows) - 4,
    40 // Minimum readable size
  );

  return (
    <PixelCard className="overflow-hidden pixel-grid relative h-full flex flex-col">
      <div className="absolute inset-0 bg-pixel-bg/20 pointer-events-none" />

      {/* Compact Header */}
      <PixelCardHeader className="pb-2 border-b-2 border-pixel-border relative z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <PixelCardTitle className="text-sm font-pixel text-pixel-text truncate">
            AUTHENTICATION CHALLENGE
          </PixelCardTitle>
          <div className="flex items-center gap-1 px-2 py-1 border-2 border-pixel-border bg-pixel-bgDark flex-shrink-0">
            <span className="text-xs font-pixelSmall text-pixel-teal">
              {currentRound}/{totalRounds}
            </span>
          </div>
        </div>
      </PixelCardHeader>

      {/* Grid Container - Flexible */}
      <PixelCardContent className="pt-3 pb-2 relative z-10 flex-1 flex flex-col items-center justify-center min-h-0">
        <div
          className="border-3 border-pixel-border bg-pixel-bgDark p-3 shadow-pixel-lg transition-all duration-300"
          role="grid"
          aria-label={`Authentication grid, round ${currentRound}`}
          style={{
            maxWidth: `${maxGridWidth}px`,
            maxHeight: `${maxGridHeight}px`,
          }}
        >
          {grid.letters.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1" role="row">
              {row.map((letter, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={cn(
                    'grid-cell-compact',
                    'bg-pixel-bg border-2 border-pixel-border shadow-pixel hover:shadow-pixel-lg hover:scale-105 hover:border-pixel-teal transition-all duration-200'
                  )}
                  role="gridcell"
                  style={{
                    color: grid.colors[rowIdx][colIdx],
                    textShadow: `0 0 8px ${grid.colors[rowIdx][colIdx]}80, 0 0 16px ${grid.colors[rowIdx][colIdx]}40`,
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    fontSize: `${Math.max(cellSize * 0.6, 12)}px`,
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Compact Instructions */}
        <div className="mt-2 text-center space-y-1 flex-shrink-0">
          <p className="text-xs font-pixelSmall text-pixel-text">FIND YOUR SECRET LETTER</p>
          <p className="text-xs font-pixelSmall text-pixel-text/70">SELECT DIRECTION BY COLOR</p>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
};
