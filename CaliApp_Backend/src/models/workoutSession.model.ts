export type SessionStatus = "started" | "completed" | "cancelled" | "rest";

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutTableId: string | null;
  startedAt: Date;
  completedAt: Date | null;
  status: SessionStatus;
  notes: string | null;
  createdAt: Date;
}
