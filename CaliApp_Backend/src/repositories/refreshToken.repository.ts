import prisma from "../config/database";
import type { RefreshToken } from "../models/refreshToken.model";

export const refreshTokenRepository = {
  create: (data: Pick<RefreshToken, "userId" | "tokenHash" | "expiresAt">) =>
    prisma.refreshToken.create({ data }),

  findByTokenHash: (tokenHash: string) =>
    prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
    }),

  revoke: (id: string) =>
    prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    }),

  revokeAllForUser: (userId: string) =>
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
};
