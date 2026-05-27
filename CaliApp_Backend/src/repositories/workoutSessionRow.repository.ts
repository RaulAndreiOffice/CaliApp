import prisma from "../config/database";

export const workoutSessionRowRepository = {
  createMany: (data: any[]) =>
    prisma.workoutSessionRow.createMany({ data }),

  findBySessionId: (workoutSessionId: string) =>
    prisma.workoutSessionRow.findMany({
      where: { workoutSessionId },
      orderBy: { orderIndex: "asc" },
      include: {
        exercise: true,
        performedSets: { orderBy: { setNumber: "asc" } },
      },
    }),

  findById: (id: string) =>
    prisma.workoutSessionRow.findUnique({ where: { id } }),

  findMaxOrderIndex: async (workoutSessionId: string): Promise<number | null> => {
    const result = await prisma.workoutSessionRow.aggregate({
      where: { workoutSessionId },
      _max: { orderIndex: true },
    });
    return result._max.orderIndex;
  },

  create: (data: {
    workoutSessionId: string;
    workoutTableRowId: string | null;
    exerciseId: string;
    plannedSetsSnapshot: number;
    plannedTargetValueSnapshot: number;
    measurementTypeSnapshot: string;
    orderIndex: number | null;
    notes: string | null;
  }) =>
    prisma.workoutSessionRow.create({
      data,
      include: {
        exercise: true,
        performedSets: { orderBy: { setNumber: "asc" } },
      },
    }),
};
