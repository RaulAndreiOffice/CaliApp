import prisma from "../config/database";

export const performedSetRepository = {
  create: (data: any) =>
    prisma.performedSet.create({ data }),

  update: (id: string, data: any) =>
    prisma.performedSet.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.performedSet.delete({ where: { id } }),

  findById: (id: string) =>
    prisma.performedSet.findUnique({ where: { id } }),

  findByRowAndSetNumber: (workoutSessionRowId: string, setNumber: number) =>
    prisma.performedSet.findUnique({
      where: { workoutSessionRowId_setNumber: { workoutSessionRowId, setNumber } },
    }),

  findBySessionRowId: (workoutSessionRowId: string) =>
    prisma.performedSet.findMany({
      where: { workoutSessionRowId },
      orderBy: { setNumber: "asc" },
    }),
};
