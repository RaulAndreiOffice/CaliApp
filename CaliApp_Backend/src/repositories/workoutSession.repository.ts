import prisma from "../config/database";

export const workoutSessionRepository = {
  findByUserId: (userId: string, skip: number, take: number) =>
    prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      skip,
      take,
      include: { workoutTable: { select: { name: true } } },
    }),

  countByUserId: (userId: string) =>
    prisma.workoutSession.count({ where: { userId } }),

  findById: (id: string) =>
    prisma.workoutSession.findUnique({ where: { id } }),

  findByIdWithDetails: (id: string) =>
    prisma.workoutSession.findUnique({
      where: { id },
      include: {
        workoutTable: { select: { name: true } },
        rows: {
          orderBy: { orderIndex: "asc" },
          include: {
            exercise: true,
            performedSets: { orderBy: { setNumber: "asc" } },
          },
        },
      },
    }),

  findRestDayInRange: (userId: string, from: Date, to: Date) =>
    prisma.workoutSession.findFirst({
      where: {
        userId,
        status: "rest",
        startedAt: { gte: from, lt: to },
      },
    }),

  create: (data: any) =>
    prisma.workoutSession.create({ data }),

  update: (id: string, data: any) =>
    prisma.workoutSession.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.workoutSession.delete({ where: { id } }),
};
