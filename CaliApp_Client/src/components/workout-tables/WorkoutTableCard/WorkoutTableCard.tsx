import { Link } from 'react-router-dom';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { formatDate } from '../../../utils/formatters';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { WorkoutTable } from '../../../types/workoutTable.types';

interface WorkoutTableCardProps {
  table: WorkoutTable;
}

export function WorkoutTableCard({ table }: WorkoutTableCardProps) {
  const { t } = useLanguage();
  const rowsCount = table.rows?.length ?? 0;
  return (
    <Link to={`/workout-tables/${table.id}`} className="block no-underline">
      <Card className="hover:border-primary/40 transition-colors duration-[var(--d-fast,160ms)]">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-medium text-base sm:text-lg">{table.name}</h3>
                <Badge variant={table.isActive ? 'success' : 'default'}>
                  {table.isActive ? t('plans.card.active') : t('plans.card.archived')}
                </Badge>
              </div>
              {table.description && (
                <p className="text-xs sm:text-sm text-muted-foreground">{table.description}</p>
              )}
            </div>
          </div>

          {table.rows && table.rows.length > 0 && (
            <div className="space-y-2">
              {table.rows.slice(0, 3).map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between text-xs sm:text-sm p-2 bg-muted/30 rounded"
                >
                  <span className="truncate">{row.exercise?.name ?? '—'}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {row.plannedSets} × {row.plannedTargetValue}
                    {row.exercise?.measurementType === 'time' ? t('common.seconds') : ''}
                  </span>
                </div>
              ))}
              {table.rows.length > 3 && (
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  {t('plans.card.moreExercises', { count: table.rows.length - 3 })}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span>{t('plans.card.exercisesCount', { count: rowsCount })}</span>
            <span>•</span>
            <span>{t('plans.card.created', { date: formatDate(table.createdAt) })}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
