import { workoutSessionRepository } from "../repositories/workoutSession.repository";
import { workoutSessionRowRepository } from "../repositories/workoutSessionRow.repository";
import { workoutTableRepository } from "../repositories/workoutTable.repository";
import { exerciseRepository } from "../repositories/exercise.repository";
import { AppError } from "../utils/apiError";
import { parsePagination, getPrismaSkip, buildPaginationMeta } from "../utils/pagination";
import type { PaginatedResponseDTO } from "../dtos/common/pagination.dto";
import type { LogRestDayDTO } from "../dtos/workout-session/log-rest-day.dto";
import type { StartSessionDTO } from "../dtos/workout-session/start-session.dto";
import type { AddSessionRowDTO } from "../dtos/workout-session/add-session-row.dto";
import type { WorkoutSessionResponseDTO } from "../dtos/workout-session/workout-session-response.dto";
import type { SessionStatus } from "../models/workoutSession.model";

const toWorkoutSessionResponse = (session: any): WorkoutSessionResponseDTO => ({
  ...session,
  workoutTableName: session.workoutTable?.name ?? null,
  rows: session.rows?.map((row: any) => ({
    ...row,
    exerciseName: row.exercise?.name,
    measurementType: row.exercise?.measurementType ?? row.measurementTypeSnapshot,
    plannedSets: row.plannedSetsSnapshot,
    plannedTargetValue: row.plannedTargetValueSnapshot,
  })),
});

export const workoutSessionService = {
  getAll: async (userId: string, query: any): Promise<PaginatedResponseDTO<WorkoutSessionResponseDTO>> => {
    const pagination = parsePagination(query);
    const skip = getPrismaSkip(pagination);
    const [sessions, total] = await Promise.all([
      workoutSessionRepository.findByUserId(userId, skip, pagination.limit),
      workoutSessionRepository.countByUserId(userId),
    ]);
    return { data: sessions.map(toWorkoutSessionResponse), meta: buildPaginationMeta(pagination, total) };
  },

  getById: async (userId: string, sessionId: string): Promise<WorkoutSessionResponseDTO> => {
    const session = await workoutSessionRepository.findByIdWithDetails(sessionId);
    if (!session) throw AppError.notFound("Workout session not found");
    if (session.userId !== userId) throw AppError.forbidden();
    return toWorkoutSessionResponse(session);
  },

  start: async (userId: string, { workoutTableId }: StartSessionDTO): Promise<WorkoutSessionResponseDTO> => {
    let sessionRows: any[] = [];

    if (workoutTableId) {
      const table = await workoutTableRepository.findByIdWithRows(workoutTableId);
      if (!table) throw AppError.notFound("Workout table not found");
      if (table.ownerUserId !== userId) throw AppError.forbidden();

      sessionRows = table.rows.map((row: any) => ({
        workoutTableRowId: row.id,
        exerciseId: row.exerciseId,
        plannedSetsSnapshot: row.plannedSets,
        plannedTargetValueSnapshot: row.plannedTargetValue,
        measurementTypeSnapshot: row.exercise.measurementType,
        orderIndex: row.orderIndex,
      }));
    }

    const session = await workoutSessionRepository.create({
      userId,
      workoutTableId: workoutTableId || null,
      startedAt: new Date(),
      status: "started",
    });

    if (sessionRows.length > 0) {
      const rowsWithSessionId = sessionRows.map((row) => ({
        ...row,
        workoutSessionId: session.id,
      }));
      await workoutSessionRowRepository.createMany(rowsWithSessionId);
    }

    const created = await workoutSessionRepository.findByIdWithDetails(session.id);
    if (!created) throw AppError.notFound("Workout session not found");
    return toWorkoutSessionResponse(created);
  },

  updateStatus: async (userId: string, sessionId: string, status: SessionStatus, notes?: string): Promise<WorkoutSessionResponseDTO> => {
    const session = await workoutSessionRepository.findById(sessionId);
    if (!session) throw AppError.notFound("Workout session not found");
    if (session.userId !== userId) throw AppError.forbidden();

    const updateData: any = { status };
    if (status === "completed") updateData.completedAt = new Date();
    if (notes !== undefined) updateData.notes = notes;

    return toWorkoutSessionResponse(await workoutSessionRepository.update(sessionId, updateData));
  },

  delete: async (userId: string, sessionId: string): Promise<WorkoutSessionResponseDTO> => {
    const session = await workoutSessionRepository.findById(sessionId);
    if (!session) throw AppError.notFound("Workout session not found");
    if (session.userId !== userId) throw AppError.forbidden();
    return toWorkoutSessionResponse(await workoutSessionRepository.delete(sessionId));
  },

  // Append an extra exercise to a session that's already underway. Lets the
  // user log mid-workout bonus work without polluting the underlying plan
  // template — the new row has workoutTableRowId = null so the plan stays
  // exactly as the user set it up.
  addRow: async (
    userId: string,
    sessionId: string,
    { exerciseId, plannedSets, plannedTargetValue, notes }: AddSessionRowDTO,
  ): Promise<WorkoutSessionResponseDTO> => {
    const session = await workoutSessionRepository.findById(sessionId);
    if (!session) throw AppError.notFound("Workout session not found");
    if (session.userId !== userId) throw AppError.forbidden();
    if (session.status !== "started") {
      throw AppError.badRequest("Cannot add exercises to a session that's not in progress");
    }

    const exercise = await exerciseRepository.findById(exerciseId);
    if (!exercise) throw AppError.notFound("Exercise not found");
    if (!exercise.isGlobal && exercise.ownerUserId !== userId) {
      throw AppError.forbidden();
    }

    const maxOrder = await workoutSessionRowRepository.findMaxOrderIndex(sessionId);
    await workoutSessionRowRepository.create({
      workoutSessionId: sessionId,
      workoutTableRowId: null,
      exerciseId,
      plannedSetsSnapshot: plannedSets,
      plannedTargetValueSnapshot: plannedTargetValue,
      measurementTypeSnapshot: exercise.measurementType,
      orderIndex: (maxOrder ?? -1) + 1,
      notes: notes ?? null,
    });

    const updated = await workoutSessionRepository.findByIdWithDetails(sessionId);
    if (!updated) throw AppError.notFound("Workout session not found");
    return toWorkoutSessionResponse(updated);
  },

  logRestDay: async (userId: string, { date, notes }: LogRestDayDTO): Promise<WorkoutSessionResponseDTO> => {
    const startedAt = date ? new Date(date) : new Date();

    const dayStart = new Date(startedAt);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const existingRest = await workoutSessionRepository.findRestDayInRange(userId, dayStart, dayEnd);
    if (existingRest) throw AppError.conflict("Rest day already logged for this date");

    const session = await workoutSessionRepository.create({
      userId,
      workoutTableId: null,
      startedAt,
      completedAt: startedAt,
      status: "rest" satisfies SessionStatus,
      notes: notes ?? null,
    });

    return toWorkoutSessionResponse(session);
  },
};
