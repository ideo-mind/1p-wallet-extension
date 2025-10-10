import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ColoredGrid } from '@/types/protocol';

interface GridProps {
  grid: ColoredGrid;
  currentRound: number;
  totalRounds: number;
}

export const Grid = ({ grid, currentRound, totalRounds }: GridProps) => {
  return (
    <Card className="border-none shadow-xl overflow-hidden cyber-grid relative">
      <div className="absolute inset-0 bg-gradient-to-br from-logo-teal/5 via-transparent to-logo-blue/5 pointer-events-none" />
          <CardHeader className="pb-4 bg-gradient-to-r from-logo-teal/10 to-logo-blue/10 border-b scanline relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold gradient-text">Authentication Challenge</CardTitle>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm animate-glow-pulse">
            <span className="text-xs font-semibold text-logo-teal">
              Round {currentRound}/{totalRounds}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 relative z-10">
        <div
              className="mx-auto w-fit rounded-2xl bg-black p-5 shadow-2xl ring-4 ring-logo-blue/20 hover:ring-logo-blue/40 transition-all duration-300"
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
                    'bg-black border-gray-800 shadow-lg hover:shadow-neon hover:scale-110 hover:border-logo-teal/50'
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
          <p className="text-sm font-medium text-foreground">
            Find your secret letter
          </p>
          <p className="text-xs text-muted-foreground">
            Select the direction matching your letter's color
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

