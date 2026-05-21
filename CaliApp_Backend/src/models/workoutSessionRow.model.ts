import { MeasurementType } from "./exercise.model";

export interface WorkoutSessionRow {
  id: string;
  workoutSessionId: string;
  workoutTableRowId: string | null;
  exerciseId: string;
  plannedSetsSnapshot: number | null;
  plannedTargetValueSnapshot: number | null;
  measurementTypeSnapshot: MeasurementType | null;
  orderIndex: number | null;
  notes: string | null;
  createdAt: Date;
}
