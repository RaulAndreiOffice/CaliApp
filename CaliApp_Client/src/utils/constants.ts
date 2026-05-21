export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const MEASUREMENT_TYPES = ['reps', 'time'] as const;

export const SESSION_STATUS = ['started', 'completed', 'cancelled'] as const;

export const SHARE_PERMISSIONS = ['view', 'copy'] as const;

export const STORAGE_KEYS = {
  AUTH: 'caliapp.auth',
  THEME: 'caliapp.theme',
} as const;

export const QUERY_KEYS = {
  ME: ['me'] as const,
  EXERCISES: ['exercises'] as const,
  EXERCISE: (id: string) => ['exercises', id] as const,
  WORKOUT_TABLES: ['workout-tables'] as const,
  WORKOUT_TABLE: (id: string) => ['workout-tables', id] as const,
  WORKOUT_TABLE_ROWS: (id: string) => ['workout-tables', id, 'rows'] as const,
  WORKOUT_SESSIONS: ['workout-sessions'] as const,
  WORKOUT_SESSION: (id: string) => ['workout-sessions', id] as const,
  SHARED_WITH_ME: ['shared-with-me'] as const,
  TABLE_SHARES: (tableId: string) => ['workout-tables', tableId, 'shares'] as const,
  STATS_OVERVIEW: ['stats', 'overview'] as const,
  STATS_WEEKLY: ['stats', 'weekly'] as const,
  STATS_TRAINING_LOAD: ['stats', 'training-load'] as const,
  STATS_EXERCISE: (id: string) => ['stats', 'exercise', id] as const,
} as const;
