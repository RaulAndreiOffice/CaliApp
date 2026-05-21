import { StatsCard } from '../StatsCard/StatsCard';
import { formatPercent } from '../../../utils/formatters';
import type { WeeklyStats } from '../../../types/stats.types';

interface WeeklyOverviewProps {
  stats: WeeklyStats;
}

export function WeeklyOverview({ stats }: WeeklyOverviewProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatsCard
        label="Sesiuni saptamana"
        value={stats.totalSessions}
        delta={{ value: stats.vsLastWeek.sessionsDiff, suffix: ' sesiuni' }}
      />
      <StatsCard
        label="Completare medie"
        value={formatPercent(stats.completionRate)}
        delta={{ value: stats.vsLastWeek.completionDiff, suffix: '%' }}
      />
      <StatsCard label="Total serii" value={stats.totalSets} />
      <StatsCard label="Total reps" value={stats.totalReps} />
    </div>
  );
}
