import { Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { WorkoutTableRow } from '../../../types/workoutTable.types';

interface WorkoutTableRowListProps {
  rows: WorkoutTableRow[];
  onDelete?: (rowId: string) => void;
}

export function WorkoutTableRowList({ rows, onDelete }: WorkoutTableRowListProps) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Adauga primul exercitiu in plan.
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
              {row.plannedSets} x {row.plannedTargetValue}
              {row.exercise?.measurementType === 'time' ? 's' : ' rep'}
            </span>
          </div>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={() => onDelete(row.id)}
              aria-label="Sterge rand"
            >
              <span />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
