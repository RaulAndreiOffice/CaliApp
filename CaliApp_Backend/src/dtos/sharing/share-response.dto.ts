import { SharePermission } from "../../models/share.model";
import type { UserResponseDTO } from "../user/user-response.dto";
import type { WorkoutTableResponseDTO } from "../workout-table/workout-table-response.dto";

export interface ShareResponseDTO {
  id: string;
  workoutTableId: string;
  workoutTable?: WorkoutTableResponseDTO;
  sharedByUserId: string;
  sharedByUser?: Pick<UserResponseDTO, "id" | "username">;
  sharedWithUserId: string;
  sharedWithUser?: Pick<UserResponseDTO, "id" | "username" | "email">;
  permission: SharePermission;
  createdAt: Date;
  revokedAt: Date | null;
}
