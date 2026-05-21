export interface WorkoutTableRow {
  id: string;
  workoutTableId: string;
  exerciseId: string;
  plannedSets: number;
  plannedTargetValue: number;
  restSeconds: number | null;
  orderIndex: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
