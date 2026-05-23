import { ProgressBar } from '../../ui/ProgressBar';
import { formatDate, formatTime } from '../../../utils/formatters';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { WorkoutSession } from '../../../types/workoutSession.types';

interface SessionSummaryProps {
  session: WorkoutSession;
}

function calcRowCompletion(plannedSets: number, plannedTarget: number, actual: number) {
  const total = plannedSets * plannedTarget;
  if (total === 0) return 0;
  return Math.min(100, (actual / total) * 100);
}

export function SessionSummary({ session }: Readonly<SessionSummaryProps>) {
  const { t } = useLanguage();
  const rows = session.rows ?? [];
  const totalDuration =
    session.completedAt && session.startedAt
      ? Math.floor(
          (new Date(session.completedAt).getTime() -
            new Date(session.startedAt).getTime()) /
            1000
        )
      : 0;

  const overallPct =
    rows.length === 0
      ? 0
      : rows.reduce((acc, row) => {
          const plannedSets = row.plannedSetsSnapshot ?? 0;
          const plannedTarget = row.plannedTargetValueSnapshot ?? 0;
          const actual =
            row.performedSets?.reduce((s, p) => s + p.actualValue, 0) ?? 0;
          return acc + calcRowCompletion(plannedSets, plannedTarget, actual);
        }, 0) / rows.length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold">{t('workout.summary.completed')}</h2>
        <p className="text-sm text-muted-foreground">
          {session.workoutTableName ?? t('workout.summary.freeWorkout')} —{' '}
          {formatDate(session.startedAt)} — {t('workout.summary.duration', { time: formatTime(totalDuration) })}
        </p>
        <div className="mt-3">
          <ProgressBar value={overallPct} variant="success" showLabel />
        </div>
      </header>
      <ul className="flex flex-col gap-4">
        {rows.map((row) => {
          const plannedSets = row.plannedSetsSnapshot ?? 0;
          const plannedTarget = row.plannedTargetValueSnapshot ?? 0;
          const actual =
            row.performedSets?.reduce((s, p) => s + p.actualValue, 0) ?? 0;
          const setsDone = row.performedSets?.length ?? 0;
          const pct = calcRowCompletion(plannedSets, plannedTarget, actual);
          const unit = row.measurementTypeSnapshot === 'time' ? t('common.seconds') : ` ${t('common.reps')}`;

          return (
            <li key={row.id} className="flex flex-col gap-2.5 p-4 bg-muted/15 rounded-xl border border-border/20">
              <div className="flex items-center justify-between gap-2 text-sm">
                <strong className="font-semibold">{row.exercise?.name ?? row.exerciseName ?? '—'}</strong>
                <span className="text-muted-foreground/70 text-xs">
                  {t('workout.summary.setsLine', {
                    done: setsDone,
                    planned: plannedSets,
                    actual,
                    target: plannedSets * plannedTarget,
                    unit,
                  })}
                </span>
              </div>
              <ProgressBar value={pct} variant="primary" />
              <div className="flex flex-wrap gap-1.5">
                {row.performedSets?.map((s) => (
                  <span key={s.id} className="inline-block px-2.5 py-1 bg-card/80 border border-border/30 rounded-lg text-xs text-muted-foreground font-medium tabular-nums">
                    {t('sessions.card.set')} {s.setNumber}: {s.actualValue}{unit}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
