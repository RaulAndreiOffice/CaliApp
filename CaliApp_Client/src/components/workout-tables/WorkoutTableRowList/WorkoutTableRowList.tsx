import { Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { WorkoutTableRow } from '../../../types/workoutTable.types';

interface WorkoutTableRowListProps {
  rows: WorkoutTableRow[];
  onDelete?: (rowId: string) => void;
}

export function WorkoutTableRowList({ rows, onDelete }: WorkoutTableRowListProps) {
  const { t } = useLanguage();
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {t('plans.detail.section.exercises.empty')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li key={row.id} className="flex items-center justify-between gap-3 p-3 px-4 bg-muted/30 rounded-lg">
          <div className="flex flex-col">
            <span className="font-medium text-sm">{row.exercise?.name ?? '—'}</span>
            <span className="text-xs text-muted-foreground">
              {row.plannedSets} × {row.plannedTargetValue}
              {row.exercise?.measurementType === 'time' ? t('common.seconds') : ` ${t('common.reps')}`}
            </span>
          </div>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={() => onDelete(row.id)}
              aria-label={t('plans.detail.row.deleteAria')}
            >
              <span />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
