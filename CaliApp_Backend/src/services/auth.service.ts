import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { jwtConfig } from "../config/jwt";
import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { AppError } from "../utils/apiError";
import type { LoginRequestDTO } from "../dtos/auth/login.dto";
import type { RegisterRequestDTO } from "../dtos/auth/register.dto";
import type { AuthResponseDTO, TokensResponseDTO } from "../dtos/auth/tokens.dto";
import type { UserResponseDTO } from "../dtos/user/user-response.dto";

const generateAccessToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn as SignOptions["expiresIn"],
  });
};

const generateRefreshToken = () => uuidv4();

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const toUserResponse = (user: {
  id: string;
  email: string;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserResponseDTO => ({
  id: user.id,
  email: user.email,
  username: user.username,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const authService = {
  register: async ({ email, password, username }: RegisterRequestDTO): Promise<AuthResponseDTO> => {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw AppError.conflict("Email already in use");

    const passwordHash = await hashPassword(password);
    const user = await userRepository.create({ email, username, passwordHash });

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.create({ userId: user.id, tokenHash, expiresAt });

    return {
      user: toUserResponse(user),
      accessToken,
      refreshToken,
    };
  },

  login: async ({ email, password }: LoginRequestDTO): Promise<AuthResponseDTO> => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw AppError.unauthorized("Invalid email or password");

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw AppError.unauthorized("Invalid email or password");

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.create({ userId: user.id, tokenHash, expiresAt });

    return {
      user: toUserResponse(user),
      accessToken,
      refreshToken,
    };
  },

  refresh: async (refreshToken: string): Promise<TokensResponseDTO> => {
    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (!stored) {
      // The token isn't active. If it nonetheless exists (already rotated or
      // revoked), it's being replayed — a sign of theft. Revoke the whole
      // family so the attacker and victim are both forced to re-authenticate.
      const reused = await refreshTokenRepository.findByTokenHashAny(tokenHash);
      if (reused) await refreshTokenRepository.revokeAllForUser(reused.userId);
      throw AppError.unauthorized("Invalid refresh token");
    }
    if (stored.expiresAt < new Date()) throw AppError.unauthorized("Refresh token expired");

    await refreshTokenRepository.revoke(stored.id);

    const user = await userRepository.findById(stored.userId);
    if (!user) throw AppError.unauthorized("User not found");

    const newAccessToken = generateAccessToken(user.id, user.email);
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.create({ userId: user.id, tokenHash: newTokenHash, expiresAt });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  logout: async (refreshToken: string) => {
    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (stored) await refreshTokenRepository.revoke(stored.id);
  },
};
