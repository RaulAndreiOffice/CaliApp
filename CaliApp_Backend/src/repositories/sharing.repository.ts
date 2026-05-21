import prisma from "../config/database";

export const sharingRepository = {
  create: (data: any) =>
    prisma.workoutTableShare.create({ data }),

  findByTableId: (workoutTableId: string) =>
    prisma.workoutTableShare.findMany({
      where: { workoutTableId, revokedAt: null },
      include: {
        sharedWithUser: { select: { id: true, username: true, email: true } },
      },
    }),

  findSharedWithUser: (sharedWithUserId: string) =>
    prisma.workoutTableShare.findMany({
      where: { sharedWithUserId, revokedAt: null },
      include: {
        workoutTable: true,
        sharedByUser: { select: { id: true, username: true } },
      },
    }),

  findById: (id: string) =>
    prisma.workoutTableShare.findUnique({ where: { id } }),

  findExisting: (workoutTableId: string, sharedWithUserId: string) =>
    prisma.workoutTableShare.findFirst({
      where: { workoutTableId, sharedWithUserId, revokedAt: null },
    }),

  revoke: (id: string) =>
    prisma.workoutTableShare.update({
      where: { id },
      data: { revokedAt: new Date() },
    }),
};
