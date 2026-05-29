import prisma from "../config/database";
import type { UpdateExerciseDTO } from "../dtos/exercise/update-exercise.dto";

const getPlanSyncData = (data: UpdateExerciseDTO) => {
  const syncData: {
    plannedSets?: number;
    plannedTargetValue?: number;
    restSeconds?: number | null;
  } = {};

  if (data.defaultSets !== undefined) syncData.plannedSets = data.defaultSets;
  if (data.defaultTargetValue !== undefined) syncData.plannedTargetValue = data.defaultTargetValue;
  if (data.defaultRestSeconds !== undefined) syncData.restSeconds = data.defaultRestSeconds;

  return syncData;
};

export const workoutTableRowRepository = {
  findByTableId: (workoutTableId: string) =>
    prisma.workoutTableRow.findMany({
      where: { workoutTableId },
      orderBy: { orderIndex: "asc" },
      include: { exercise: true },
    }),

  findById: (id: string) =>
    prisma.workoutTableRow.findUnique({ where: { id } }),

  findManyByIds: (ids: string[]) =>
    prisma.workoutTableRow.findMany({ where: { id: { in: ids } } }),

  create: (data: any) =>
    prisma.workoutTableRow.create({ data }),

  update: (id: string, data: any) =>
    prisma.workoutTableRow.update({ where: { id }, data }),

  reorder: async (orderedIds: string[]) => {
    const offset = orderedIds.length + 1000;
    await prisma.$transaction(async (tx) => {
      await Promise.all(
        orderedIds.map((id, index) =>
          tx.workoutTableRow.update({
            where: { id },
            data: { orderIndex: offset + index },
          }),
        ),
      );

      await Promise.all(
        orderedIds.map((id, index) =>
          tx.workoutTableRow.update({
            where: { id },
            data: { orderIndex: index },
          }),
        ),
      );
    });
  },

  syncExerciseDefaultsForUser: async (ownerUserId: string, exerciseId: string, data: UpdateExerciseDTO) => {
    const syncData = getPlanSyncData(data);
    if (Object.keys(syncData).length === 0) {
      return { count: 0 };
    }

    const where = {
      exerciseId,
      workoutTable: {
        ownerUserId,
        archivedAt: null,
      },
    };

    return prisma.$transaction(async (tx) => {
      const affectedRows = await tx.workoutTableRow.findMany({
        where,
        select: { workoutTableId: true },
        distinct: ["workoutTableId"],
      });

      const result = await tx.workoutTableRow.updateMany({
        where,
        data: syncData,
      });

      if (affectedRows.length > 0) {
        await tx.workoutTable.updateMany({
          where: {
            id: { in: affectedRows.map((row) => row.workoutTableId) },
          },
          data: { updatedAt: new Date() },
        });
      }

      return result;
    });
  },

  delete: (id: string) =>
    prisma.workoutTableRow.delete({ where: { id } }),

  getMaxOrderIndex: async (workoutTableId: string) => {
    const result = await prisma.workoutTableRow.aggregate({
      where: { workoutTableId },
      _max: { orderIndex: true },
    });
    return result._max.orderIndex ?? -1;
  },
};
