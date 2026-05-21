export interface PerformedSet {
  id: string;
  workoutSessionRowId: string;
  setNumber: number;
  actualValue: number;
  notes: string | null;
  createdAt: Date;
}
