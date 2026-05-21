import { sharingRepository } from "../repositories/sharing.repository";
import { workoutTableRepository } from "../repositories/workoutTable.repository";
import { workoutTableRowRepository } from "../repositories/workoutTableRow.repository";
import { userRepository } from "../repositories/user.repository";
import { exerciseRepository } from "../repositories/exercise.repository";
import { AppError } from "../utils/apiError";
import type { CreateShareDTO } from "../dtos/sharing/create-share.dto";
import type { ShareResponseDTO } from "../dtos/sharing/share-response.dto";
import type { WorkoutTableResponseDTO } from "../dtos/workout-table/workout-table-response.dto";

export const sharingService = {
  share: async (userId: string, tableId: string, { email, permission }: CreateShareDTO): Promise<ShareResponseDTO> => {
    const table = await workoutTableRepository.findById(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();

    const targetUser = await userRepository.findByEmail(email);
    if (!targetUser) throw AppError.notFound("User not found");
    if (targetUser.id === userId) throw AppError.badRequest("Cannot share with yourself");

    const existing = await sharingRepository.findExisting(tableId, targetUser.id);
    if (existing) throw AppError.conflict("Already shared with this user");

    return sharingRepository.create({
      workoutTableId: tableId,
      sharedByUserId: userId,
      sharedWithUserId: targetUser.id,
      permission,
    }) as Promise<ShareResponseDTO>;
  },

  getSharesByTableId: async (userId: string, tableId: string): Promise<ShareResponseDTO[]> => {
    const table = await workoutTableRepository.findById(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();
    return sharingRepository.findByTableId(tableId) as Promise<ShareResponseDTO[]>;
  },

  getSharedWithMe: async (userId: string): Promise<ShareResponseDTO[]> => {
    return sharingRepository.findSharedWithUser(userId) as Promise<ShareResponseDTO[]>;
  },

  revoke: async (userId: string, tableId: string, shareId: string): Promise<ShareResponseDTO> => {
    const table = await workoutTableRepository.findById(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();
    const share = await sharingRepository.findById(shareId);
    if (!share || share.workoutTableId !== tableId || share.revokedAt) {
      throw AppError.notFound("Share not found");
    }
    return sharingRepository.revoke(shareId) as Promise<ShareResponseDTO>;
  },

  copySharedTable: async (userId: string, shareId: string): Promise<WorkoutTableResponseDTO> => {
    const share = await sharingRepository.findById(shareId);
    if (!share) throw AppError.notFound("Share not found");
    if (share.sharedWithUserId !== userId) throw AppError.forbidden();
    if (share.revokedAt) throw AppError.notFound("Share not found");
    if (!["copy", "edit"].includes(share.permission)) {
      throw AppError.forbidden("You don't have copy permission");
    }

    const original = await workoutTableRepository.findByIdWithRows(share.workoutTableId);
    if (!original) throw AppError.notFound("Original table not found");

    const newTable = await workoutTableRepository.create({
      ownerUserId: userId,
      name: `${original.name} (copy)`,
      description: original.description,
    });

    for (const row of original.rows) {
      let exerciseId = row.exerciseId;
      if (!row.exercise.isGlobal && row.exercise.ownerUserId !== userId) {
        const clonedExercise = await exerciseRepository.create({
          ownerUserId: userId,
          name: row.exercise.name,
          measurementType: row.exercise.measurementType,
          category: row.exercise.category,
          description: row.exercise.description,
          defaultSets: row.exercise.defaultSets,
          defaultTargetValue: row.exercise.defaultTargetValue,
          defaultRestSeconds: row.exercise.defaultRestSeconds,
          isGlobal: false,
        });
        exerciseId = clonedExercise.id;
      }

      await workoutTableRowRepository.create({
        workoutTableId: newTable.id,
        exerciseId,
        plannedSets: row.plannedSets,
        plannedTargetValue: row.plannedTargetValue,
        restSeconds: row.restSeconds,
        orderIndex: row.orderIndex,
      });
    }

    return newTable;
  },
};
