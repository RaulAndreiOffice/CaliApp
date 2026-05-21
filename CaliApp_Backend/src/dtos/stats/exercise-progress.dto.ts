export interface ExerciseProgressDTO {
  exerciseId: string;
  exerciseName: string;
  weeks: WeeklyDataPoint[];
}

export interface WeeklyDataPoint {
  weekStart: Date;
  totalReps: number;
  totalTimeSeconds: number;
  avgValue: number;
  sessionsCount: number;
}
