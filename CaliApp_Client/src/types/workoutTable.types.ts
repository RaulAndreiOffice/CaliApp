import type { Exercise } from './exercise.types';

export interface WorkoutTable {
  id: string;
  ownerUserId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  rows?: WorkoutTableRow[];
}

export interface WorkoutTableRow {
  id: string;
  workoutTableId: string;
  exerciseId: string;
  exercise?: Exercise;
  plannedSets: number;
  plannedTargetValue: number;
  restSeconds: number | null;
  orderIndex: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutTableRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkoutTableRequest extends Partial<CreateWorkoutTableRequest> {
  isActive?: boolean;
}

export interface CreateWorkoutTableRowRequest {
  exerciseId: string;
  plannedSets: number;
  plannedTargetValue: number;
  restSeconds?: number;
  notes?: string;
}

export type UpdateWorkoutTableRowRequest = Partial<CreateWorkoutTableRowRequest>;

export interface ReorderRowsRequest {
  orderedIds: string[];
}
