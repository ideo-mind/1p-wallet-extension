import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Progress value={percentage} className="h-2" />
        <div className="absolute inset-0 bg-gradient-to-r from-logo-teal to-logo-blue rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute inset-0 shadow-neon rounded-full opacity-50"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-logo-teal to-logo-blue text-white text-xs font-bold shadow-neon animate-neon-pulse">
            {current}
          </div>
          <span className="text-sm font-semibold text-foreground">of {total} rounds</span>
        </div>
        <span className="text-sm font-bold text-logo-teal animate-glow-pulse">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

