import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { AppError } from "../utils/apiError";
import type { ChangePasswordDTO, UpdateUserDTO } from "../dtos/user/update-user.dto";
import type { UserResponseDTO } from "../dtos/user/user-response.dto";

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

export const userService = {
  getMe: async (userId: string): Promise<UserResponseDTO> => {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    return toUserResponse(user);
  },

  updateMe: async (userId: string, data: UpdateUserDTO): Promise<UserResponseDTO> => {
    const user = await userRepository.update(userId, data);
    return toUserResponse(user);
  },

  changePassword: async (userId: string, { currentPassword, newPassword }: ChangePasswordDTO) => {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound("User not found");

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) throw AppError.badRequest("Current password is incorrect");

    const passwordHash = await hashPassword(newPassword);
    await userRepository.update(userId, { passwordHash });
    await refreshTokenRepository.revokeAllForUser(userId);
  },
};
