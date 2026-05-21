import prisma from "../config/database";

export const workoutTableRepository = {
  findByUserId: (ownerUserId: string) =>
    prisma.workoutTable.findMany({
      where: { ownerUserId, archivedAt: null },
      orderBy: { updatedAt: "desc" },
    }),

  findById: (id: string) =>
    prisma.workoutTable.findUnique({ where: { id } }),

  findByIdWithRows: (id: string) =>
    prisma.workoutTable.findUnique({
      where: { id },
      include: {
        rows: {
          orderBy: { orderIndex: "asc" },
          include: { exercise: true },
        },
      },
    }),

  create: (data: any) =>
    prisma.workoutTable.create({ data }),

  update: (id: string, data: any) =>
    prisma.workoutTable.update({ where: { id }, data }),

  softDelete: (id: string) =>
    prisma.workoutTable.update({
      where: { id },
      data: { archivedAt: new Date() },
    }),
};
