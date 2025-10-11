interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="h-4 bg-pixel-bg border-4 border-pixel-border shadow-pixel-sm">
          <div
            className="h-full bg-pixel-teal transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center border-2 border-pixel-border bg-pixel-teal text-white text-xs font-pixel shadow-pixel-sm">
            {current}
          </div>
          <span className="text-sm font-pixelSmall text-pixel-text">OF {total} ROUNDS</span>
        </div>
        <span className="text-sm font-pixel text-pixel-teal">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
};
