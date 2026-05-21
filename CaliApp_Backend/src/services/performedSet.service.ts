import { performedSetRepository } from "../repositories/performedSet.repository";
import { workoutSessionRepository } from "../repositories/workoutSession.repository";
import { workoutSessionRowRepository } from "../repositories/workoutSessionRow.repository";
import { AppError } from "../utils/apiError";
import type { CreatePerformedSetDTO } from "../dtos/performed-set/create-performed-set.dto";
import type { PerformedSetResponseDTO } from "../dtos/performed-set/performed-set-response.dto";

export const performedSetService = {
  create: async (userId: string, sessionId: string, rowId: string, data: CreatePerformedSetDTO): Promise<PerformedSetResponseDTO> => {
    const session = await workoutSessionRepository.findById(sessionId);
    if (!session) throw AppError.notFound("Session not found");
    if (session.userId !== userId) throw AppError.forbidden();
    if (session.status !== "started") throw AppError.badRequest("Session is not active");

    const row = await workoutSessionRowRepository.findById(rowId);
    if (row?.workoutSessionId !== sessionId) throw AppError.notFound("Session row not found");

    const existing = await performedSetRepository.findByRowAndSetNumber(rowId, data.setNumber);
    if (existing) return performedSetRepository.update(existing.id, data);

    return performedSetRepository.create({ ...data, workoutSessionRowId: rowId });
  },

  update: async (userId: string, sessionId: string, rowId: string, setId: string, data: Partial<CreatePerformedSetDTO>): Promise<PerformedSetResponseDTO> => {
    const session = await workoutSessionRepository.findById(sessionId);
    if (!session) throw AppError.notFound("Session not found");
    if (session.userId !== userId) throw AppError.forbidden();
    if (session.status !== "started") throw AppError.badRequest("Session is not active");

    const row = await workoutSessionRowRepository.findById(rowId);
    if (row?.workoutSessionId !== sessionId) throw AppError.notFound("Session row not found");
    const set = await performedSetRepository.findById(setId);
    if (set?.workoutSessionRowId !== rowId) throw AppError.notFound("Performed set not found");

    return performedSetRepository.update(setId, data);
  },

  delete: async (userId: string, sessionId: string, rowId: string, setId: string) => {
    const session = await workoutSessionRepository.findById(sessionId);
    if (!session) throw AppError.notFound("Session not found");
    if (session.userId !== userId) throw AppError.forbidden();
    if (session.status !== "started") throw AppError.badRequest("Session is not active");

    const row = await workoutSessionRowRepository.findById(rowId);
    if (row?.workoutSessionId !== sessionId) throw AppError.notFound("Session row not found");
    const set = await performedSetRepository.findById(setId);
    if (set?.workoutSessionRowId !== rowId) throw AppError.notFound("Performed set not found");

    return performedSetRepository.delete(setId);
  },
};
