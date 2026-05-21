import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user.types';
import type { AuthTokens } from '../types/auth.types';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, tokens: AuthTokens) => void;
  updateTokens: (tokens: AuthTokens) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, tokens) =>
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),
      updateTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      updateUser: (user) => set({ user }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
    }
  )
);
