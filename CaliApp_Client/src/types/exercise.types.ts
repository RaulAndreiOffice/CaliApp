export type MeasurementType = 'reps' | 'time';

export interface Exercise {
  id: string;
  ownerUserId: string | null;
  name: string;
  measurementType: MeasurementType;
  category: string | null;
  description: string | null;
  defaultSets: number | null;
  defaultTargetValue: number | null;
  defaultRestSeconds: number | null;
  isGlobal: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseRequest {
  name: string;
  measurementType: MeasurementType;
  category?: string;
  description?: string;
  defaultSets?: number;
  defaultTargetValue?: number;
  defaultRestSeconds?: number;
}

export type UpdateExerciseRequest = Partial<CreateExerciseRequest>;
