import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Footprints, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { CardioInsights } from '../../../types/stats.types';

interface Props {
  data: CardioInsights;
}

const STRENGTH_COLOR = '#84ff00';
const CARDIO_COLOR = '#06b6d4';

const tooltipStyle = {
  backgroundColor: 'var(--glass-bg-strong, rgba(38, 38, 38, 0.85))',
  backdropFilter: 'blur(40px)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

function StatChip({ label, value }: Readonly<{ label: string; value: string | number }>) {
  return (
    <div className="bg-muted/30 rounded-lg px-3 py-2">
      <p className="text-[11px] text-muted-foreground truncate">{label}</p>
      <p className="text-base font-bold tabular-nums leading-tight">{value}</p>
    </div>
  );
}

export function CardioBalance({ data }: Readonly<Props>) {
  const { t } = useLanguage();

  // Useful empty state: no runs logged yet → tell the user how to populate this.
  if (data.cardioActivities === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <Footprints className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground max-w-xs">{t('dashboard.cardio.empty')}</p>
      </div>
    );
  }

  const splitData = [
    { key: 'strength', name: t('dashboard.cardio.split.strength'), value: data.strengthSessions, fill: STRENGTH_COLOR },
    { key: 'cardio', name: t('dashboard.cardio.split.cardio'), value: data.cardioActivities, fill: CARDIO_COLOR },
  ];

  const showChart = data.weekly.some((w) => w.runs > 0 || w.strengthSessions > 0);

  // Textual, data-driven insights (spec item 5).
  const insights = [
    t('dashboard.cardio.insight.percent', { percent: data.cardioPercentage }),
    t('dashboard.cardio.insight.counts', { runs: data.cardioActivities, strength: data.strengthSessions }),
    t('dashboard.cardio.insight.distance', { km: data.totalDistanceKm }),
  ];
  if (data.balanceLevel === 'low') insights.push(t('dashboard.cardio.insight.low'));
  else if (data.balanceLevel === 'balanced') insights.push(t('dashboard.cardio.insight.balanced'));
  else if (data.balanceLevel === 'high') insights.push(t('dashboard.cardio.insight.high'));

  // Week-over-week cardio comparison, only when there's something to compare.
  let week: { text: string; dir: 'up' | 'down' | 'same' } | null = null;
  if (data.thisWeekRuns > 0 || data.lastWeekRuns > 0) {
    if (data.thisWeekRuns > data.lastWeekRuns) week = { text: t('dashboard.cardio.insight.weekUp'), dir: 'up' };
    else if (data.thisWeekRuns < data.lastWeekRuns) week = { text: t('dashboard.cardio.insight.weekDown'), dir: 'down' };
    else week = { text: t('dashboard.cardio.insight.weekSame'), dir: 'same' };
  }
  const WeekIcon = week?.dir === 'up' ? TrendingUp : week?.dir === 'down' ? TrendingDown : Minus;

  return (
    <div className="space-y-4">
      {/* Headline: donut split + key numbers */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative shrink-0" style={{ width: 116, height: 116 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={splitData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={56}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {splitData.map((s) => (
                  <Cell key={s.key} fill={s.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold tabular-nums leading-none" style={{ color: CARDIO_COLOR }}>
              {data.cardioPercentage}%
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {t('dashboard.cardio.percentLabel')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 flex-1 w-full min-w-0">
          <StatChip label={t('dashboard.cardio.stat.runs')} value={data.cardioActivities} />
          <StatChip label={t('dashboard.cardio.stat.strength')} value={data.strengthSessions} />
          <StatChip label={t('dashboard.cardio.stat.distance')} value={`${data.totalDistanceKm} km`} />
          <StatChip label={t('dashboard.cardio.stat.avgDistance')} value={`${data.avgDistanceKm} km`} />
        </div>
      </div>

      {/* Legend for the split */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: STRENGTH_COLOR }} />
          {t('dashboard.cardio.split.strength')} · {data.strengthSessions}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CARDIO_COLOR }} />
          {t('dashboard.cardio.split.cardio')} · {data.cardioActivities}
        </span>
        <span className="text-muted-foreground">
          {t('dashboard.cardio.totalActivities', { total: data.totalActivities })}
        </span>
      </div>

      {/* km per week (bars) + cardio % over time (line) */}
      {showChart && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">{t('dashboard.cardio.chart.title')}</p>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={data.weekly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="label" stroke="#a3a3a3" style={{ fontSize: '11px' }} />
              <YAxis yAxisId="left" stroke="#a3a3a3" style={{ fontSize: '11px' }} allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#a3a3a3"
                style={{ fontSize: '11px' }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#f5f5f5' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar
                dataKey="distanceKm"
                name={t('dashboard.cardio.chart.km')}
                yAxisId="left"
                fill={CARDIO_COLOR}
                fillOpacity={0.75}
                barSize={14}
                radius={[3, 3, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="cardioPercentage"
                name={t('dashboard.cardio.chart.percent')}
                yAxisId="right"
                stroke={STRENGTH_COLOR}
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Data-driven insight messages */}
      <ul className="space-y-1.5">
        {insights.map((line) => (
          <li key={line} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
            <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CARDIO_COLOR }} />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {week && (
        <div className="flex items-start gap-2 p-2.5 bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg">
          <WeekIcon className="w-4 h-4 text-[#06b6d4] shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/90 leading-relaxed">{week.text}</p>
        </div>
      )}
    </div>
  );
}
