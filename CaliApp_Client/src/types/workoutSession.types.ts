import type { Exercise, MeasurementType } from './exercise.types';
import type { PerformedSet } from './performedSet.types';

export type WorkoutSessionStatus = 'started' | 'completed' | 'cancelled' | 'rest';

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutTableId: string | null;
  workoutTableName?: string;
  status: WorkoutSessionStatus;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  rows?: WorkoutSessionRow[];
}

export interface WorkoutSessionRow {
  id: string;
  workoutSessionId: string;
  workoutTableRowId: string | null;
  exerciseId: string;
  exercise?: Exercise;
  exerciseName?: string;
  measurementTypeSnapshot: MeasurementType;
  measurementType?: MeasurementType;
  plannedSetsSnapshot: number | null;
  plannedSets?: number;
  plannedTargetValueSnapshot: number | null;
  plannedTargetValue?: number;
  orderIndex: number | null;
  notes: string | null;
  performedSets?: PerformedSet[];
  createdAt: string;
}

export interface StartSessionRequest {
  workoutTableId: string;
}

export interface UpdateSessionRequest {
  status?: WorkoutSessionStatus;
  notes?: string;
}

export interface LogRestDayRequest {
  date?: string;
  notes?: string;
}

export interface AddSessionRowRequest {
  exerciseId: string;
  plannedSets: number;
  plannedTargetValue: number;
  notes?: string;
}
