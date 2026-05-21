import type { WorkoutTable } from './workoutTable.types';
import type { User } from './user.types';

export type SharePermission = 'view' | 'copy';

export interface Share {
  id: string;
  workoutTableId: string;
  workoutTable?: WorkoutTable;
  sharedByUserId: string;
  sharedByUser?: User;
  sharedWithUserId: string;
  sharedWithUser?: User;
  permission: SharePermission;
  createdAt: string;
  revokedAt: string | null;
}

export interface CreateShareRequest {
  email: string;
  permission: SharePermission;
}
