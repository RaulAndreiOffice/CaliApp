import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { WeeklyVolumePoint } from '../../../types/stats.types';

interface Props {
  data: WeeklyVolumePoint[];
}

const tooltipStyle = {
  backgroundColor: 'var(--glass-bg-strong, rgba(38, 38, 38, 0.85))',
  backdropFilter: 'blur(40px)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

export function WeeklyProgressChart({ data }: Readonly<Props>) {
  const { t } = useLanguage();
  const points = data.map((p) => ({
    ...p,
    equivalentVolume: p.totalReps + Math.round(p.totalTimeSeconds / 2),
  }));
  const hasAnyVolume = points.some((p) => p.equivalentVolume > 0 || p.sessions > 0);

  if (!hasAnyVolume) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        {t('dashboard.progress.weekly.empty')}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis dataKey="label" stroke="#a3a3a3" style={{ fontSize: '11px' }} />
        <YAxis yAxisId="left" stroke="#a3a3a3" style={{ fontSize: '11px' }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#a3a3a3"
          style={{ fontSize: '11px' }}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#f5f5f5' }} />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        <Area
          type="monotone"
          dataKey="equivalentVolume"
          name={t('dashboard.progress.weekly.volume')}
          yAxisId="left"
          stroke="#84ff00"
          fill="#84ff00"
          fillOpacity={0.18}
          strokeWidth={2}
        />
        <Bar
          dataKey="sessions"
          name={t('dashboard.progress.weekly.sessions')}
          yAxisId="right"
          fill="#3b82f6"
          fillOpacity={0.7}
          barSize={14}
          radius={[3, 3, 0, 0]}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
