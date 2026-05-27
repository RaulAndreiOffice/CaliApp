import type { LearningStateDTO } from "./training-load-dashboard.dto";

export interface ExerciseTrendPointDTO {
  weekStart: Date;
  label: string;
  totalReps: number;
  totalTimeSeconds: number;
  sets: number;
  sessions: number;
  avgPerSet: number;
}

export interface ExerciseInsightWarningDTO {
  kind: "drop" | "spike";
  severity: "info" | "warning";
  message: string;
}

export interface ExerciseInsightDTO {
  exerciseId: string;
  name: string;
  category: string;
  measurementType: "reps" | "time";
  weeklyData: ExerciseTrendPointDTO[];
  trend: "up" | "flat" | "down" | "insufficient";
  deltaPercent: number;
  warning: ExerciseInsightWarningDTO | null;
}

export interface CategoryShareDTO {
  category: string;
  sets: number;
  percentage: number;
}

export interface WorkoutPercentagesDTO {
  activeDaysRatio: number;
  completionRate: number;
  totalCompletedSessions: number;
  byCategory: CategoryShareDTO[];
}

export interface WeeklyVolumePointDTO {
  weekStart: Date;
  label: string;
  totalReps: number;
  totalTimeSeconds: number;
  sessions: number;
  totalSets: number;
}

export interface ProgressInsightsDTO {
  exercises: ExerciseInsightDTO[];
  workoutPercentages: WorkoutPercentagesDTO;
  weeklyTrend: WeeklyVolumePointDTO[];
  learningState: LearningStateDTO;
}
