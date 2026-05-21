import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'primary' | 'success' | 'warning';
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  variant = 'primary',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative flex-1 overflow-hidden bg-muted/50 rounded-full h-2">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-[var(--d-slow,560ms)] ease-[var(--e-out,cubic-bezier(0.16,1,0.3,1))]',
            {
              'bg-primary shadow-[0_0_8px_rgba(132,255,0,0.3)]': variant === 'primary',
              'bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.3)]': variant === 'success',
              'bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.3)]': variant === 'warning',
            }
          )}
          style={{ transform: `translateX(-${100 - pct}%)` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-muted-foreground min-w-[36px] text-right tabular-nums">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
