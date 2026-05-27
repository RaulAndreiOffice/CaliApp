export interface WeeklyDataPoint {
  weekStart: string;
  totalReps: number;
  totalTimeSeconds: number;
  avgValue: number;
  sessionsCount: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  weeks: WeeklyDataPoint[];
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
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

export interface DashboardOverview {
  totalSessions: number;
  streakDays: number;
  activeExercises: number;
  recentSessions: Array<{
    id: string;
    workoutTableName: string;
    startedAt: string;
    completionRate: number;
  }>;
}

export type TrainingLoadZone =
  | 'below-mv'
  | 'maintenance'
  | 'mev'
  | 'mav'
  | 'mrv-risk';

export interface VolumeLandmarks {
  mv: number;
  mev: number;
  mavMin: number;
  mavMax: number;
  mrv: number;
}

export interface WeeklyTrainingLoadPoint {
  weekStart: string;
  label: string;
  hardSets: number;
  totalReps: number;
  totalTimeSeconds: number;
  equivalentReps: number;
  sessionsCount: number;
  acwr: number | null;
  zone: TrainingLoadZone;
  spike: boolean;
}

export interface DailyTrainingLoadPoint {
  date: string;
  label: string;
  hardSets: number;
  totalReps: number;
  totalTimeSeconds: number;
  equivalentReps: number;
  completionRate: number;
}

export interface CategoryTrainingLoad {
  category: string;
  hardSets: number;
  totalReps: number;
  totalTimeSeconds: number;
  equivalentReps: number;
  zone: TrainingLoadZone;
}

export interface ExerciseDistribution {
  exerciseId: string;
  name: string;
  category: string;
  hardSets: number;
  equivalentReps: number;
}

export interface PushPullBalance {
  pushSets: number;
  pullSets: number;
  coreSets: number;
  legsSets: number;
  pushPullRatio: number | null;
  status: 'balanced' | 'push-heavy' | 'pull-heavy' | 'insufficient-data';
}

export interface TrainingRecommendation {
  severity: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
}

export interface LearningState {
  firstCompletedAt: string | null;
  daysOfHistory: number;
  completedSessions: number;
  isLearning: boolean;
  minDays: number;
  minSessions: number;
}

export interface TrainingLoadDashboard {
  landmarks: VolumeLandmarks;
  weeklyTrend: WeeklyTrainingLoadPoint[];
  dailyVolume: DailyTrainingLoadPoint[];
  currentWeekByCategory: CategoryTrainingLoad[];
  exerciseDistribution: ExerciseDistribution[];
  pushPullBalance: PushPullBalance;
  recommendations: TrainingRecommendation[];
  restDaysThisWeek: number;
  learningState: LearningState;
}

// ---- progress insights (dashboard) -----------------------------------------

export interface ExerciseTrendPoint {
  weekStart: string;
  label: string;
  totalReps: number;
  totalTimeSeconds: number;
  sets: number;
  sessions: number;
  avgPerSet: number;
}

export interface ExerciseInsightWarning {
  kind: 'drop' | 'spike';
  severity: 'info' | 'warning';
  message: string;
}

export interface ExerciseInsight {
  exerciseId: string;
  name: string;
  category: string;
  measurementType: 'reps' | 'time';
  weeklyData: ExerciseTrendPoint[];
  trend: 'up' | 'flat' | 'down' | 'insufficient';
  deltaPercent: number;
  warning: ExerciseInsightWarning | null;
}

export interface CategoryShare {
  category: string;
  sets: number;
  percentage: number;
}

export interface WorkoutPercentages {
  activeDaysRatio: number;
  completionRate: number;
  totalCompletedSessions: number;
  byCategory: CategoryShare[];
}

export interface WeeklyVolumePoint {
  weekStart: string;
  label: string;
  totalReps: number;
  totalTimeSeconds: number;
  sessions: number;
  totalSets: number;
}

export interface ProgressInsights {
  exercises: ExerciseInsight[];
  workoutPercentages: WorkoutPercentages;
  weeklyTrend: WeeklyVolumePoint[];
  learningState: LearningState;
}
