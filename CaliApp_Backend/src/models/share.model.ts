export type SharePermission = "view" | "copy";

export interface WorkoutTableShare {
  id: string;
  workoutTableId: string;
  sharedByUserId: string;
  sharedWithUserId: string;
  permission: SharePermission;
  createdAt: Date;
  revokedAt: Date | null;
}
