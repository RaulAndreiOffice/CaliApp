export interface PerformedSet {
  id: string;
  workoutSessionRowId: string;
  setNumber: number;
  actualValue: number;
  notes: string | null;
  createdAt: string;
}

export interface CreatePerformedSetRequest {
  setNumber: number;
  actualValue: number;
  notes?: string;
}

export type UpdatePerformedSetRequest = Partial<CreatePerformedSetRequest>;
