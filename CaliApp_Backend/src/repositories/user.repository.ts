import prisma from "../config/database";

export const userRepository = {
  findById: (id: string) =>
    prisma.user.findUnique({ where: { id } }),

  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  create: (data: { email: string; username: string; passwordHash: string }) =>
    prisma.user.create({ data }),

  update: (id: string, data: { username?: string; passwordHash?: string }) =>
    prisma.user.update({ where: { id }, data }),
};
