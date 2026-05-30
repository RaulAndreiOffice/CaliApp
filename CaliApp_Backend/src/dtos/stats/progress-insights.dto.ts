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

// Per-week strength-vs-cardio split for the dashboard cardio chart.
export interface CardioWeekPointDTO {
  weekStart: Date;
  label: string;
  runs: number;
  distanceKm: number;
  strengthSessions: number;
  cardioPercentage: number;
}

// Strength-vs-cardio balance, computed only from manually entered activities.
// Headline counts/percentage are all-time so they match the user's worked
// example; `weekly` powers the chart and the week-over-week comparison.
export interface CardioInsightsDTO {
  totalActivities: number;
  strengthSessions: number;
  cardioActivities: number;
  cardioPercentage: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  avgDistanceKm: number;
  balanceLevel: "none" | "low" | "balanced" | "high";
  thisWeekRuns: number;
  lastWeekRuns: number;
  thisWeekDistanceKm: number;
  lastWeekDistanceKm: number;
  weekly: CardioWeekPointDTO[];
}

export interface ProgressInsightsDTO {
  exercises: ExerciseInsightDTO[];
  workoutPercentages: WorkoutPercentagesDTO;
  weeklyTrend: WeeklyVolumePointDTO[];
  cardio: CardioInsightsDTO;
  learningState: LearningStateDTO;
}
