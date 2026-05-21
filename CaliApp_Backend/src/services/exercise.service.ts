import { exerciseRepository } from "../repositories/exercise.repository";
import { workoutTableRowRepository } from "../repositories/workoutTableRow.repository";
import { AppError } from "../utils/apiError";
import type { CreateExerciseDTO } from "../dtos/exercise/create-exercise.dto";
import type { ExerciseResponseDTO } from "../dtos/exercise/exercise-response.dto";
import type { UpdateExerciseDTO } from "../dtos/exercise/update-exercise.dto";

export const exerciseService = {
  getAll: async (userId: string): Promise<ExerciseResponseDTO[]> => {
    const [userExercises, globalExercises] = await Promise.all([
      exerciseRepository.findByUserId(userId),
      exerciseRepository.findGlobal(),
    ]);
    return [...globalExercises, ...userExercises] as ExerciseResponseDTO[];
  },

  getById: async (userId: string, exerciseId: string): Promise<ExerciseResponseDTO> => {
    const exercise = await exerciseRepository.findById(exerciseId);
    if (!exercise) throw AppError.notFound("Exercise not found");
    if (!exercise.isGlobal && exercise.ownerUserId !== userId) throw AppError.forbidden();
    return exercise as ExerciseResponseDTO;
  },

  create: async (userId: string, data: CreateExerciseDTO): Promise<ExerciseResponseDTO> => {
    return exerciseRepository.create({ ...data, ownerUserId: userId, isGlobal: false }) as Promise<ExerciseResponseDTO>;
  },

  update: async (userId: string, exerciseId: string, data: UpdateExerciseDTO): Promise<ExerciseResponseDTO> => {
    const exercise = await exerciseRepository.findById(exerciseId);
    if (!exercise) throw AppError.notFound("Exercise not found");
    if (exercise.ownerUserId !== userId) throw AppError.forbidden();
    const updated = await exerciseRepository.update(exerciseId, data);
    await workoutTableRowRepository.syncExerciseDefaultsForUser(userId, exerciseId, data);
    return updated as ExerciseResponseDTO;
  },

  archive: async (userId: string, exerciseId: string) => {
    const exercise = await exerciseRepository.findById(exerciseId);
    if (!exercise) throw AppError.notFound("Exercise not found");
    if (exercise.ownerUserId !== userId) throw AppError.forbidden();
    return exerciseRepository.softDelete(exerciseId);
  },
};
