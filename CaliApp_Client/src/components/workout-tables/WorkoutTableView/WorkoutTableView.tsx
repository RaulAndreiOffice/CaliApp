import { useLanguage } from '../../../contexts/LanguageContext';
import type { WorkoutTableRow } from '../../../types/workoutTable.types';

interface WorkoutTableViewProps {
  rows: WorkoutTableRow[];
}

export function WorkoutTableView({ rows }: WorkoutTableViewProps) {
  const { t } = useLanguage();
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {t('plans.view.empty')}
      </p>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block border border-border rounded-xl overflow-hidden bg-card hairline">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 px-4 bg-muted/20 font-semibold text-muted-foreground/70 text-xs uppercase tracking-wider border-b border-border/20">{t('plans.view.col.exercise')}</th>
              <th className="text-left p-3 px-4 bg-muted/20 font-semibold text-muted-foreground/70 text-xs uppercase tracking-wider border-b border-border/20">{t('plans.view.col.sets')}</th>
              <th className="text-left p-3 px-4 bg-muted/20 font-semibold text-muted-foreground/70 text-xs uppercase tracking-wider border-b border-border/20">{t('plans.view.col.target')}</th>
              <th className="text-left p-3 px-4 bg-muted/20 font-semibold text-muted-foreground/70 text-xs uppercase tracking-wider border-b border-border/20">{t('plans.view.col.rest')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isTime = row.exercise?.measurementType === 'time';
              const unit = isTime ? t('common.seconds') : ` ${t('common.reps')}`;
              return (
                <tr key={row.id} className={`transition-colors hover:bg-muted/10 ${i < rows.length - 1 ? 'border-b border-border/15' : ''}`}>
                  <td className="p-3 px-4 font-medium">{row.exercise?.name ?? '—'}</td>
                  <td className="p-3 px-4 tabular-nums">{row.plannedSets}</td>
                  <td className="p-3 px-4 tabular-nums">{row.plannedTargetValue}{unit}</td>
                  <td className="p-3 px-4 text-muted-foreground">{row.restSeconds ? `${row.restSeconds}${t('common.seconds')}` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {rows.map((row) => {
          const isTime = row.exercise?.measurementType === 'time';
          const unit = isTime ? t('common.seconds') : ` ${t('common.reps')}`;
          return (
            <div key={row.id} className="p-3.5 bg-muted/15 rounded-xl border border-border/20">
              <p className="font-semibold text-sm">{row.exercise?.name ?? '—'}</p>
              <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground/70">
                <span className="font-medium">{t('plans.view.label.sets', { count: row.plannedSets })}</span>
                <span className="font-medium">{row.plannedTargetValue}{unit}</span>
                {row.restSeconds ? <span>{t('plans.view.label.rest', { seconds: row.restSeconds })}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
