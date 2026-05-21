export interface CreateWorkoutTableRowDTO {
  exerciseId: string;
  plannedSets: number;
  plannedTargetValue: number;
  restSeconds?: number;
  notes?: string;
}
