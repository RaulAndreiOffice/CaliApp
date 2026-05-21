import { Link } from 'react-router-dom';
import { Badge } from '../../ui/Badge';
import { formatRelativeTime } from '../../../utils/formatters';
import type { WorkoutSession } from '../../../types/workoutSession.types';

interface SessionCardProps {
  session: WorkoutSession;
  completionRate?: number;
}

export function SessionCard({ session, completionRate }: SessionCardProps) {
  const variantByStatus = {
    started: 'info',
    completed: 'success',
    cancelled: 'danger',
    rest: 'default',
  } as const;

  return (
    <Link
      to={`/workout-sessions/${session.id}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-3.5 bg-muted/20 rounded-xl text-foreground no-underline transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-border/30"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm sm:text-base truncate">
          {session.workoutTableName ?? 'Antrenament liber'}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {formatRelativeTime(session.startedAt)}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Badge variant={variantByStatus[session.status]}>{session.status}</Badge>
        {completionRate !== undefined && (
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {Math.round(completionRate)}%
          </span>
        )}
      </div>
    </Link>
  );
}
