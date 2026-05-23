import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutSessionApi } from '../../api/workoutSession.api';
import { QUERY_KEYS } from '../../utils/constants';
import type {
  LogRestDayRequest,
  StartSessionRequest,
  UpdateSessionRequest,
} from '../../types/workoutSession.types';

export function useWorkoutSessions(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.WORKOUT_SESSIONS, page, limit],
    queryFn: () => workoutSessionApi.getAll(page, limit),
  });
}

export function useWorkoutSession(id: string | undefined) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.WORKOUT_SESSION(id) : ['sessions', 'none'],
    queryFn: () => workoutSessionApi.getById(id!),
    enabled: !!id,
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StartSessionRequest) => workoutSessionApi.start(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSIONS });
    },
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionRequest }) =>
      workoutSessionApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSIONS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(id) });
    },
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutSessionApi.complete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSIONS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(id) });
    },
  });
}

export function useCancelSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutSessionApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSIONS });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutSessionApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSIONS });
    },
  });
}

export function useLogRestDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LogRestDayRequest = {}) => workoutSessionApi.logRestDay(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSIONS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.STATS_OVERVIEW });
    },
  });
}
