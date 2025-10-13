interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="h-3 bg-pixel-bg border-2 border-pixel-border shadow-pixel-sm">
          <div
            className="h-full bg-pixel-teal transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <div className="flex h-5 w-5 items-center justify-center border-2 border-pixel-border bg-pixel-teal text-white text-xs font-pixel shadow-pixel-sm">
            {current}
          </div>
          <span className="text-xs font-pixelSmall text-pixel-text">OF {total}</span>
        </div>
        <span className="text-xs font-pixel text-pixel-teal">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
};
