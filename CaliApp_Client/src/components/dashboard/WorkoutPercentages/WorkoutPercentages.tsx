import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { WorkoutPercentages as WorkoutPercentagesData } from '../../../types/stats.types';

interface Props {
  data: WorkoutPercentagesData;
}

const CATEGORY_COLORS: Record<string, string> = {
  push: '#84ff00',
  pull: '#38bdf8',
  legs: '#f97316',
  core: '#a855f7',
  other: '#64748b',
};

const tooltipStyle = {
  backgroundColor: 'var(--glass-bg-strong, rgba(38, 38, 38, 0.85))',
  backdropFilter: 'blur(40px)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

function Ring({ value, label }: Readonly<{ value: number; label: string }>) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: 64, height: 64 }}>
        <svg width={64} height={64} aria-hidden="true">
          <circle cx={32} cy={32} r={radius} strokeWidth={5} stroke="var(--border)" fill="none" />
          <circle
            cx={32}
            cy={32}
            r={radius}
            strokeWidth={5}
            stroke="var(--primary, #84ff00)"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 32 32)"
            style={{ transition: 'stroke-dashoffset 480ms ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">
          {Math.round(pct)}%
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground text-center">{label}</span>
    </div>
  );
}

export function WorkoutPercentages({ data }: Readonly<Props>) {
  const { t } = useLanguage();

  if (data.totalCompletedSessions === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        {t('dashboard.progress.percentages.empty')}
      </p>
    );
  }

  const slices = data.byCategory.map((c) => ({
    ...c,
    fill: CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS.other,
  }));

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex gap-3">
        <Ring value={data.activeDaysRatio * 100} label={t('dashboard.progress.percentages.activeDays')} />
        <Ring value={data.completionRate} label={t('dashboard.progress.percentages.completionRate')} />
      </div>

      <div className="flex-1 min-w-0 w-full">
        <p className="text-xs text-muted-foreground mb-1">
          {t('dashboard.progress.percentages.byCategory')}
        </p>
        {slices.length === 0 ? (
          <p className="text-xs text-muted-foreground">—</p>
        ) : (
          <div className="flex items-center gap-3">
            <div style={{ width: 80, height: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="sets"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={38}
                    paddingAngle={2}
                  >
                    {slices.map((s) => (
                      <Cell key={s.category} fill={s.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-col gap-1 text-xs flex-1 min-w-0">
              {slices.slice(0, 4).map((s) => (
                <li key={s.category} className="flex items-center justify-between gap-2 min-w-0">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: s.fill }}
                    />
                    <span className="capitalize truncate">{s.category}</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground shrink-0">{s.percentage}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
