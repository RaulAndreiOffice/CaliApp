import { workoutTableRepository } from "../repositories/workoutTable.repository";
import { AppError } from "../utils/apiError";
import type { CreateWorkoutTableDTO } from "../dtos/workout-table/create-workout-table.dto";
import type { UpdateWorkoutTableDTO } from "../dtos/workout-table/update-workout-table.dto";
import type { WorkoutTableResponseDTO } from "../dtos/workout-table/workout-table-response.dto";

export const workoutTableService = {
  getAll: async (userId: string): Promise<WorkoutTableResponseDTO[]> => {
    return workoutTableRepository.findByUserId(userId);
  },

  getById: async (userId: string, tableId: string): Promise<WorkoutTableResponseDTO> => {
    const table = await workoutTableRepository.findByIdWithRows(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();
    return table as WorkoutTableResponseDTO;
  },

  create: async (userId: string, data: CreateWorkoutTableDTO): Promise<WorkoutTableResponseDTO> => {
    return workoutTableRepository.create({ ...data, ownerUserId: userId });
  },

  update: async (userId: string, tableId: string, data: UpdateWorkoutTableDTO): Promise<WorkoutTableResponseDTO> => {
    const table = await workoutTableRepository.findById(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();
    return workoutTableRepository.update(tableId, data);
  },

  archive: async (userId: string, tableId: string): Promise<WorkoutTableResponseDTO> => {
    const table = await workoutTableRepository.findById(tableId);
    if (!table) throw AppError.notFound("Workout table not found");
    if (table.ownerUserId !== userId) throw AppError.forbidden();
    return workoutTableRepository.softDelete(tableId);
  },
};
