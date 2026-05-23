import { StatsCard } from '../StatsCard/StatsCard';
import { formatPercent } from '../../../utils/formatters';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { WeeklyStats } from '../../../types/stats.types';

interface WeeklyOverviewProps {
  stats: WeeklyStats;
}

export function WeeklyOverview({ stats }: Readonly<WeeklyOverviewProps>) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatsCard
        label={t('stats.weekly.sessions')}
        value={stats.totalSessions}
        delta={{ value: stats.vsLastWeek.sessionsDiff, suffix: t('stats.weekly.sessionsSuffix') }}
      />
      <StatsCard
        label={t('stats.weekly.completion')}
        value={formatPercent(stats.completionRate)}
        delta={{ value: stats.vsLastWeek.completionDiff, suffix: '%' }}
      />
      <StatsCard label={t('stats.weekly.totalSets')} value={stats.totalSets} />
      <StatsCard label={t('stats.weekly.totalReps')} value={stats.totalReps} />
    </div>
  );
}
