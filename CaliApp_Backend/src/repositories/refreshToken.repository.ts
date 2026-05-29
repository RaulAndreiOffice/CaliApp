import prisma from "../config/database";
import type { RefreshToken } from "../models/refreshToken.model";

export const refreshTokenRepository = {
  create: (data: Pick<RefreshToken, "userId" | "tokenHash" | "expiresAt">) =>
    prisma.refreshToken.create({ data }),

  findByTokenHash: (tokenHash: string) =>
    prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null },
    }),

  // Looks up a token regardless of its revoked state. Used to detect replay of
  // an already-rotated/revoked token (token-reuse detection).
  findByTokenHashAny: (tokenHash: string) =>
    prisma.refreshToken.findFirst({
      where: { tokenHash },
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

  // Removes tokens past their expiry. Revoked-but-unexpired tokens are kept so
  // they can still be matched for reuse detection until they expire.
  deleteExpired: () =>
    prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    }),
};
