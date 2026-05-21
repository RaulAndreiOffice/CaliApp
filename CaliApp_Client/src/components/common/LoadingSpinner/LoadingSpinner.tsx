import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
}

export function LoadingSpinner({ size = 24, label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <div className="relative">
        <Loader2 size={size} className="animate-spin text-primary drop-shadow-[0_0_8px_rgba(132,255,0,0.3)]" />
      </div>
      {label && <span className="text-sm text-muted-foreground/80 animate-pulse">{label}</span>}
    </div>
  );
}
