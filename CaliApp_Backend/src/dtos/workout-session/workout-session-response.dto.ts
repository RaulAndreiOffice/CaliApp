import { SessionStatus } from "../../models/workoutSession.model";
import type { MeasurementType } from "../../models/exercise.model";
import type { WorkoutSessionRow } from "../../models/workoutSessionRow.model";
import type { PerformedSet } from "../../models/performedSet.model";
import type { ExerciseResponseDTO } from "../exercise/exercise-response.dto";

export interface WorkoutSessionResponseDTO {
  id: string;
  userId: string;
  workoutTableId: string | null;
  workoutTableName?: string | null;
  startedAt: Date;
  completedAt: Date | null;
  status: SessionStatus;
  distanceKm: number | null;
  durationMinutes: number | null;
  notes: string | null;
  createdAt: Date;
  rows?: WorkoutSessionRowResponseDTO[];
}

export interface WorkoutSessionRowResponseDTO extends WorkoutSessionRow {
  exercise?: ExerciseResponseDTO;
  exerciseName?: string;
  measurementTypeSnapshot: MeasurementType | null;
  measurementType?: MeasurementType;
  plannedSets?: number | null;
  plannedTargetValue?: number | null;
  performedSets?: PerformedSetResponseDTO[];
}

export interface PerformedSetResponseDTO extends PerformedSet {}
