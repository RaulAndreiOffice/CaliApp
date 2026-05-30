import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/user.types';
import type { AuthTokens } from '../types/auth.types';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthState {
  user: User | null;
  accessToken: string | null;
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
      isAuthenticated: false,
      login: (user, tokens) =>
        set({
          user,
          accessToken: tokens.accessToken,
          isAuthenticated: true,
        }),
      updateTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
        }),
      updateUser: (user) => set({ user }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
      // Security: never persist the access token to localStorage (it would be
      // readable by any XSS). Only the non-sensitive session flag + profile
      // survive a reload; the token is re-minted in memory via a silent refresh
      // from the httpOnly refresh cookie (see AuthBootstrap).
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
