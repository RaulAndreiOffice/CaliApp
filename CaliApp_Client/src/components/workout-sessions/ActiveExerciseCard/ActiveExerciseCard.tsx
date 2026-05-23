import { useCreateSet } from '../../../hooks/api/usePerformedSets';
import { SetsList } from '../SetsList/SetsList';
import { ProgressBar } from '../../ui/ProgressBar';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { WorkoutSessionRow } from '../../../types/workoutSession.types';

interface ActiveExerciseCardProps {
  sessionId: string;
  row: WorkoutSessionRow;
}

export function ActiveExerciseCard({ sessionId, row }: Readonly<ActiveExerciseCardProps>) {
  const createSet = useCreateSet(sessionId, row.id);
  const { t } = useLanguage();
  const measurementType = row.measurementTypeSnapshot ?? row.measurementType ?? 'reps';
  const plannedSets = row.plannedSetsSnapshot ?? row.plannedSets ?? 0;
  const plannedTarget = row.plannedTargetValueSnapshot ?? row.plannedTargetValue ?? 0;
  const performedSets = row.performedSets ?? [];

  const totalPerformed = performedSets.reduce(
    (sum, s) => sum + s.actualValue,
    0
  );
  const totalPlanned = plannedSets * plannedTarget;
  const isTime = measurementType === 'time';
  const unit = isTime ? t('common.seconds') : ` ${t('common.reps')}`;

  function handleSetSubmit(setNumber: number, value: number) {
    const existing = performedSets.find((s) => s.setNumber === setNumber);
    if (existing?.actualValue === value) return;
    createSet.mutate({ setNumber, actualValue: value });
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-card border border-border rounded-2xl hairline transition-colors duration-[var(--d-fast,160ms)]">
      <header className="flex items-center justify-between gap-3 pb-3 border-b border-border/30">
        <h3 className="text-lg font-semibold">
          {row.exercise?.name ?? row.exerciseName ?? '—'}
        </h3>
        <span className="text-sm text-muted-foreground">
          {plannedSets} × {plannedTarget}{unit}
        </span>
      </header>
      <SetsList
        plannedSets={plannedSets}
        measurementType={measurementType}
        performedSets={performedSets}
        onSetSubmit={handleSetSubmit}
      />
      <div className="flex items-center gap-3 mt-2">
        <div className="flex-1">
          <ProgressBar value={totalPerformed} max={totalPlanned} showLabel />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {totalPerformed} / {totalPlanned}{unit}
        </span>
      </div>
    </div>
  );
}
