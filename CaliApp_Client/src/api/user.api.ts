import { api } from './axios';
import type { ApiResponse } from '../types/api.types';
import type {
  User,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '../types/user.types';

export const userApi = {
  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/users/me');
    return res.data.data;
  },

  async updateMe(data: UpdateUserRequest): Promise<User> {
    const res = await api.patch<ApiResponse<User>>('/users/me', data);
    return res.data.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.patch('/users/me/password', data);
  },
};
