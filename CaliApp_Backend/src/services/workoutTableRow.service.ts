import { workoutTableRepository } from "../repositories/workoutTable.repository";
import { workoutTableRowRepository } from "../repositories/workoutTableRow.repository";
import { exerciseRepository } from "../repositories/exercise.repository";
import { AppError } from "../utils/apiError";
import type { CreateWorkoutTableRowDTO } from "../dtos/workout-table-row/create-workout-table-row.dto";
import type { UpdateWorkoutTableRowDTO } from "../dtos/workout-table-row/update-workout-table-row.dto";
import type { WorkoutTableRowResponseDTO } from "../dtos/workout-table-row/workout-table-row-response.dto";

export const workoutTableRowService = {
  getByTableId: async (userId: string, tableId: string): Promise<WorkoutTableRowResponseDTO[]> => {
    const table = await workoutTableRepository.findById(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();
    return workoutTableRowRepository.findByTableId(tableId) as Promise<WorkoutTableRowResponseDTO[]>;
  },

  create: async (userId: string, tableId: string, data: CreateWorkoutTableRowDTO): Promise<WorkoutTableRowResponseDTO> => {
    const table = await workoutTableRepository.findById(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();
    const exercise = await exerciseRepository.findById(data.exerciseId);
    if (!exercise) throw AppError.notFound("Exercise not found");
    if (!exercise.isGlobal && exercise.ownerUserId !== userId) throw AppError.forbidden("Exercise is not available for this user");

    const maxIndex = await workoutTableRowRepository.getMaxOrderIndex(tableId);
    return workoutTableRowRepository.create({
      ...data,
      workoutTableId: tableId,
      orderIndex: maxIndex + 1,
    });
  },

  update: async (userId: string, tableId: string, rowId: string, data: UpdateWorkoutTableRowDTO): Promise<WorkoutTableRowResponseDTO> => {
    const table = await workoutTableRepository.findById(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();
    const row = await workoutTableRowRepository.findById(rowId);
    if (!row || row.workoutTableId !== tableId) throw AppError.notFound("Workout table row not found");
    return workoutTableRowRepository.update(rowId, data);
  },

  delete: async (userId: string, tableId: string, rowId: string) => {
    const table = await workoutTableRepository.findById(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();
    const row = await workoutTableRowRepository.findById(rowId);
    if (!row || row.workoutTableId !== tableId) throw AppError.notFound("Workout table row not found");
    return workoutTableRowRepository.delete(rowId);
  },

  reorder: async (userId: string, tableId: string, orderedIds: string[]) => {
    const table = await workoutTableRepository.findById(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();
    const rows = await workoutTableRowRepository.findManyByIds(orderedIds);
    if (rows.length !== orderedIds.length || rows.some((row) => row.workoutTableId !== tableId)) {
      throw AppError.badRequest("Invalid row order for this workout table");
    }

    await workoutTableRowRepository.reorder(orderedIds);
  },
};
