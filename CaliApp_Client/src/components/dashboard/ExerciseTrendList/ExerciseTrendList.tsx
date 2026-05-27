import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { ExerciseInsight } from '../../../types/stats.types';

// Distinct hues so each line is readable when overlaid. Capped to MAX_LINES
// because anything past ~8 lines turns into spaghetti even with strong colors.
const COLORS = [
  '#84ff00',
  '#38bdf8',
  '#f97316',
  '#a855f7',
  '#22c55e',
  '#f43f5e',
  '#eab308',
  '#ec4899',
];
const MAX_LINES = 8;

const tooltipStyle = {
  backgroundColor: 'var(--glass-bg-strong, rgba(38, 38, 38, 0.85))',
  backdropFilter: 'blur(40px)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

interface Props {
  exercises: ExerciseInsight[];
}

export function ExerciseTrendList({ exercises }: Readonly<Props>) {
  const { t } = useLanguage();

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        {t('dashboard.progress.exercises.empty')}
      </p>
    );
  }

  // Backend already sorts: warnings first, then most-recently-active.
  // Cap here so a user with 30 exercises still gets a readable chart.
  const top = exercises.slice(0, MAX_LINES);

  // All exercises share the same weekly buckets (backend pads empty weeks
  // for every exercise), so we can pivot to wide format keyed by exerciseId
  // (not name — two exercises could share a label and one would overwrite
  // the other in the row).
  const labels = top[0]?.weeklyData.map((w) => w.label) ?? [];
  const data = labels.map((label, idx) => {
    const row: Record<string, string | number> = { label };
    for (const ex of top) {
      const point = ex.weeklyData[idx];
      // Equivalent volume: reps + seconds/2, same metric as the sessions chart.
      row[ex.exerciseId] = point ? point.totalReps + Math.round(point.totalTimeSeconds / 2) : 0;
    }
    return row;
  });

  const hasAnyVolume = data.some((row) =>
    top.some((ex) => Number(row[ex.exerciseId] ?? 0) > 0),
  );
  if (!hasAnyVolume) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        {t('dashboard.progress.weekly.empty')}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis dataKey="label" stroke="#a3a3a3" style={{ fontSize: '11px' }} />
        <YAxis stroke="#a3a3a3" style={{ fontSize: '11px' }} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#f5f5f5' }} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: 6 }} />
        {top.map((ex, i) => (
          <Line
            key={ex.exerciseId}
            type="monotone"
            dataKey={ex.exerciseId}
            name={ex.name}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
