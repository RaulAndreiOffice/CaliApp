import { useMutation, useQueryClient } from '@tanstack/react-query';
import { performedSetApi } from '../../api/performedSet.api';
import { QUERY_KEYS } from '../../utils/constants';
import type {
  CreatePerformedSetRequest,
  UpdatePerformedSetRequest,
} from '../../types/performedSet.types';

export function useCreateSet(sessionId: string, rowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePerformedSetRequest) =>
      performedSetApi.create(sessionId, rowId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(sessionId) });
    },
  });
}

export function useUpdateSet(sessionId: string, rowId: string, setId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePerformedSetRequest) =>
      performedSetApi.update(sessionId, rowId, setId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(sessionId) });
    },
  });
}

export function useDeleteSet(sessionId: string, rowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (setId: string) =>
      performedSetApi.remove(sessionId, rowId, setId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSION(sessionId) });
    },
  });
}
