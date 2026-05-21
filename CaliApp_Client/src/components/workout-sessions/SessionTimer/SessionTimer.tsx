import { Timer } from 'lucide-react';
import { useWorkoutStore } from '../../../stores/workout.store';
import { formatTime } from '../../../utils/formatters';

export function SessionTimer() {
  const elapsed = useWorkoutStore((s) => s.elapsedSeconds);
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-card border border-border rounded-xl text-foreground tabular-nums hairline">
      <Timer size={18} className="text-primary drop-shadow-[0_0_6px_rgba(132,255,0,0.3)]" />
      <span className="text-lg font-bold tracking-tight">{formatTime(elapsed)}</span>
    </div>
  );
}
