import { ArrowUp, ArrowDown, Minus, AlertTriangle } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../../contexts/LanguageContext';
import { cn } from '../../../utils/cn';
import type { TranslationKey } from '../../../i18n/translations';
import type { ExerciseInsight } from '../../../types/stats.types';

interface Props {
  exercises: ExerciseInsight[];
  /** How many rows to render — keep the widget compact in the grid. */
  limit?: number;
}

const TREND_LABEL: Record<ExerciseInsight['trend'], TranslationKey> = {
  up: 'dashboard.progress.exercises.trend.up',
  flat: 'dashboard.progress.exercises.trend.flat',
  down: 'dashboard.progress.exercises.trend.down',
  insufficient: 'dashboard.progress.exercises.trend.insufficient',
};

const TREND_CLASS: Record<ExerciseInsight['trend'], string> = {
  up: 'text-primary bg-primary/10 border-primary/30',
  flat: 'text-muted-foreground bg-muted/30 border-border/40',
  down: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  insufficient: 'text-muted-foreground/70 bg-muted/20 border-border/30',
};

function TrendIcon({ trend }: Readonly<{ trend: ExerciseInsight['trend'] }>) {
  if (trend === 'up') return <ArrowUp className="w-3 h-3" />;
  if (trend === 'down') return <ArrowDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
}

function Sparkline({ exercise }: Readonly<{ exercise: ExerciseInsight }>) {
  const data = exercise.weeklyData.map((w) => ({
    label: w.label,
    value: w.totalReps + Math.round(w.totalTimeSeconds / 2),
  }));
  const allZero = data.every((d) => d.value === 0);
  if (allZero) return <div className="h-8 w-20" />;

  const color = exercise.trend === 'down' ? '#f59e0b' : '#84ff00';
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExerciseTrendList({ exercises, limit = 5 }: Readonly<Props>) {
  const { t } = useLanguage();

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        {t('dashboard.progress.exercises.empty')}
      </p>
    );
  }

  const rows = exercises.slice(0, limit);

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((ex) => {
        const last = ex.weeklyData[ex.weeklyData.length - 1];
        const lastLabel = ex.measurementType === 'time'
          ? t('dashboard.progress.exercises.lastWeekTime', {
              seconds: last?.totalTimeSeconds ?? 0,
              sets: last?.sets ?? 0,
            })
          : t('dashboard.progress.exercises.lastWeek', {
              reps: last?.totalReps ?? 0,
              sets: last?.sets ?? 0,
            });

        return (
          <li
            key={ex.exerciseId}
            className="flex items-center gap-3 p-2.5 bg-muted/20 border border-border/30 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-sm truncate">{ex.name}</span>
                {ex.warning && (
                  <AlertTriangle
                    className="w-3.5 h-3.5 text-amber-400 shrink-0"
                    aria-label={ex.warning.message}
                  />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{lastLabel}</p>
            </div>

            <Sparkline exercise={ex} />

            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-semibold whitespace-nowrap',
                TREND_CLASS[ex.trend],
              )}
            >
              <TrendIcon trend={ex.trend} />
              {t(TREND_LABEL[ex.trend])}
              {ex.trend !== 'insufficient' && ex.trend !== 'flat' && (
                <span className="tabular-nums">{ex.deltaPercent > 0 ? '+' : ''}{ex.deltaPercent}%</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
