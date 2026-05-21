export interface WeeklyStatsDTO {
  weekStart: Date;
  weekEnd: Date;
  totalSessions: number;
  totalSets: number;
  totalReps: number;
  totalTimeSeconds: number;
  completionRate: number;
  vsLastWeek: {
    sessionsDiff: number;
    completionDiff: number;
  };
}
