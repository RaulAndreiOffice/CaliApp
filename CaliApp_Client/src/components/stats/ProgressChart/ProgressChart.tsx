import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatDateShort } from '../../../utils/formatters';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { WeeklyDataPoint } from '../../../types/stats.types';

interface ProgressChartProps {
  data: WeeklyDataPoint[];
  measurementType: 'reps' | 'time';
}

export function ProgressChart({ data, measurementType }: Readonly<ProgressChartProps>) {
  const { t } = useLanguage();
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        {t('stats.chart.notEnough')}
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    label: formatDateShort(d.weekStart),
    value: measurementType === 'time' ? d.totalTimeSeconds : d.totalReps,
    avg: d.avgValue,
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="label" stroke="#a3a3a3" style={{ fontSize: '12px' }} />
          <YAxis stroke="#a3a3a3" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#262626',
              border: '1px solid #404040',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#f5f5f5' }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#84ff00"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
