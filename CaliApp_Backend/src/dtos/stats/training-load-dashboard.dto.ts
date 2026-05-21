export type TrainingLoadZone = "below-mv" | "maintenance" | "mev" | "mav" | "mrv-risk";

export interface VolumeLandmarksDTO {
  mv: number;
  mev: number;
  mavMin: number;
  mavMax: number;
  mrv: number;
}

export interface WeeklyTrainingLoadPointDTO {
  weekStart: Date;
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

export interface DailyTrainingLoadPointDTO {
  date: Date;
  label: string;
  hardSets: number;
  totalReps: number;
  totalTimeSeconds: number;
  equivalentReps: number;
  completionRate: number;
}

export interface CategoryTrainingLoadDTO {
  category: string;
  hardSets: number;
  totalReps: number;
  totalTimeSeconds: number;
  equivalentReps: number;
  zone: TrainingLoadZone;
}

export interface ExerciseDistributionDTO {
  exerciseId: string;
  name: string;
  category: string;
  hardSets: number;
  equivalentReps: number;
}

export interface PushPullBalanceDTO {
  pushSets: number;
  pullSets: number;
  coreSets: number;
  legsSets: number;
  pushPullRatio: number | null;
  status: "balanced" | "push-heavy" | "pull-heavy" | "insufficient-data";
}

export interface TrainingRecommendationDTO {
  severity: "info" | "warning" | "danger";
  title: string;
  message: string;
}

export interface TrainingLoadDashboardDTO {
  landmarks: VolumeLandmarksDTO;
  weeklyTrend: WeeklyTrainingLoadPointDTO[];
  dailyVolume: DailyTrainingLoadPointDTO[];
  currentWeekByCategory: CategoryTrainingLoadDTO[];
  exerciseDistribution: ExerciseDistributionDTO[];
  pushPullBalance: PushPullBalanceDTO;
  recommendations: TrainingRecommendationDTO[];
  restDaysThisWeek: number;
}
