// Payload for adding an ad-hoc exercise to an already-started session.
// Used when the user decides mid-day to do extra work without altering
// the underlying plan template.
export interface AddSessionRowDTO {
  exerciseId: string;
  plannedSets: number;
  plannedTargetValue: number;
  notes?: string;
}
