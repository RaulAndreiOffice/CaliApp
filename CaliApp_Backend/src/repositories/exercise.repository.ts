import prisma from "../config/database";

export const exerciseRepository = {
  findByUserId: (ownerUserId: string) =>
    prisma.exercise.findMany({
      where: { ownerUserId, archivedAt: null },
      orderBy: { name: "asc" },
    }),

  findGlobal: () =>
    prisma.exercise.findMany({
      where: { isGlobal: true, archivedAt: null },
      orderBy: { name: "asc" },
    }),

  findById: (id: string) =>
    prisma.exercise.findUnique({ where: { id } }),

  create: (data: any) =>
    prisma.exercise.create({ data }),

  update: (id: string, data: any) =>
    prisma.exercise.update({ where: { id }, data }),

  softDelete: (id: string) =>
    prisma.exercise.update({
      where: { id },
      data: { archivedAt: new Date() },
    }),
};
