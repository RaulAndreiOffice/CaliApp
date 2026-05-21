import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { userApi } from '../../api/user.api';
import { useAuthStore } from '../../stores/auth.store';
import { QUERY_KEYS } from '../../utils/constants';
import type { LoginRequest, RegisterRequest } from '../../types/auth.types';

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      login(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}

export function useRegister() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      login(data.user, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { refreshToken, logout } = useAuthStore.getState();
  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch {
          /* ignore */
        }
      }
    },
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: () => userApi.getMe(),
    enabled: isAuthenticated,
  });
}
