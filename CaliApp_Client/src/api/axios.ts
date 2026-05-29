import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { API_URL } from '../utils/constants';
import type { AuthTokens } from '../types/auth.types';

export const api = axios.create({
  baseURL: API_URL,
  // Send the httpOnly refresh-token cookie on auth requests.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];
let refreshPromise: Promise<AuthTokens> | null = null;

function getTokenExpiresAt(token: string): number | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(window.atob(normalizedPayload)) as { exp?: number };
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

function shouldRefreshToken(token: string | null): boolean {
  if (!token) return false;
  const expiresAt = getTokenExpiresAt(token);
  if (!expiresAt) return false;
  return expiresAt - Date.now() < 60_000;
}

async function refreshTokens(): Promise<AuthTokens> {
  if (refreshPromise) return refreshPromise;

  const { updateTokens, logout } = useAuthStore.getState();

  // The refresh token lives in an httpOnly cookie; `withCredentials` sends it.
  refreshPromise = axios
    .post<{ success: true; data: AuthTokens }>(
      `${API_URL}/auth/refresh`,
      undefined,
      { withCredentials: true }
    )
    .then((response) => {
      const tokens = response.data.data;
      updateTokens(tokens);
      return tokens;
    })
    .catch((error) => {
      logout();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

api.interceptors.request.use(async (config) => {
  let token = useAuthStore.getState().accessToken;

  if (token && shouldRefreshToken(token) && !config.url?.includes('/auth/')) {
    try {
      const tokens = await refreshTokens();
      token = tokens.accessToken;
    } catch {
      token = null;
    }
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function resolveQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { logout } = useAuthStore.getState();

      try {
        const tokens = await refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        resolveQueue(tokens.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        resolveQueue(null);
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
