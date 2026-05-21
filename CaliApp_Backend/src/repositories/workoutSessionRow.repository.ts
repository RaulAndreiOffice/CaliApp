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
};
