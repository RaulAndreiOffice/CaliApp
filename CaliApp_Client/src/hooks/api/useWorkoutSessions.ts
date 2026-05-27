import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { workoutSessionApi } from '../../api/workoutSession.api';
import { QUERY_KEYS } from '../../utils/constants';
import type {
  AddSessionRowRequest,
  LogRestDayRequest,
  StartSessionRequest,
  UpdateSessionRequest,
} from '../../types/workoutSession.types';

// Every chart, dashboard widget and per-exercise progression is computed from
// session data, so any session-shape mutation (create/update/delete/sets) must
// invalidate the same set of dependent caches.
function invalidateSessionDependentQueries(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSIONS });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.STATS_OVERVIEW });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.STATS_WEEKLY });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.STATS_TRAINING_LOAD });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.STATS_PROGRESS_INSIGHTS });
  qc.invalidateQueries({ queryKey: ['stats', 'exercise'] });
}

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
    onSuccess: () => invalidateSessionDependentQueries(qc),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionRequest }) =>
      workoutSessionApi.update(id, data),
    onSuccess: (_, { id }) => {
      invalidateSessionDependentQueries(qc);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(id) });
    },
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutSessionApi.complete(id),
    onSuccess: (_, id) => {
      invalidateSessionDependentQueries(qc);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(id) });
    },
  });
}

export function useCancelSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutSessionApi.cancel(id),
    onSuccess: (_, id) => {
      invalidateSessionDependentQueries(qc);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(id) });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutSessionApi.remove(id),
    onSuccess: (_, id) => {
      invalidateSessionDependentQueries(qc);
      qc.removeQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(id) });
    },
  });
}

export function useAddSessionRow(sessionId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddSessionRowRequest) => {
      if (!sessionId) throw new Error('No active session');
      return workoutSessionApi.addRow(sessionId, data);
    },
    onSuccess: (session) => {
      if (sessionId) {
        qc.setQueryData(QUERY_KEYS.WORKOUT_SESSION(sessionId), session);
        invalidateSessionDependentQueries(qc);
        qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(sessionId) });
      }
    },
  });
}

export function useLogRestDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LogRestDayRequest = {}) => workoutSessionApi.logRestDay(data),
    onSuccess: () => invalidateSessionDependentQueries(qc),
  });
}
