import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { performedSetApi } from '../../api/performedSet.api';
import { QUERY_KEYS } from '../../utils/constants';
import type {
  CreatePerformedSetRequest,
  UpdatePerformedSetRequest,
} from '../../types/performedSet.types';

// Performed sets feed the same dashboards/stats as sessions, so any mutation
// here must invalidate the session, list, and all derived stats caches.
function invalidatePerformedSetQueries(qc: QueryClient, sessionId: string) {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(sessionId) });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSIONS });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.STATS_OVERVIEW });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.STATS_WEEKLY });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.STATS_TRAINING_LOAD });
  qc.invalidateQueries({ queryKey: ['stats', 'exercise'] });
}

export function useCreateSet(sessionId: string, rowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePerformedSetRequest) =>
      performedSetApi.create(sessionId, rowId, data),
    onSuccess: () => invalidatePerformedSetQueries(qc, sessionId),
  });
}

export function useUpdateSet(sessionId: string, rowId: string, setId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePerformedSetRequest) =>
      performedSetApi.update(sessionId, rowId, setId, data),
    onSuccess: () => invalidatePerformedSetQueries(qc, sessionId),
  });
}

export function useDeleteSet(sessionId: string, rowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (setId: string) =>
      performedSetApi.remove(sessionId, rowId, setId),
    onSuccess: () => invalidatePerformedSetQueries(qc, sessionId),
  });
}
