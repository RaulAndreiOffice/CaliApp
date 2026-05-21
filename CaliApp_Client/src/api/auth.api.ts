import { api } from './axios';
import type {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
} from '../types/auth.types';
import type { ApiResponse } from '../types/api.types';

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const res = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken,
    });
    return res.data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },
};
