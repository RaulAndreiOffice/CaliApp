import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutTableApi } from '../../api/workoutTable.api';
import { QUERY_KEYS } from '../../utils/constants';
import type {
  CreateWorkoutTableRequest,
  UpdateWorkoutTableRequest,
} from '../../types/workoutTable.types';

export function useWorkoutTables() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKOUT_TABLES,
    queryFn: () => workoutTableApi.getAll(),
    refetchOnMount: 'always',
  });
}

export function useWorkoutTable(id: string | undefined) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.WORKOUT_TABLE(id) : ['workout-tables', 'none'],
    queryFn: () => workoutTableApi.getById(id!),
    enabled: !!id,
    refetchOnMount: 'always',
  });
}

export function useCreateWorkoutTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkoutTableRequest) => workoutTableApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLES });
    },
  });
}

export function useUpdateWorkoutTable(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWorkoutTableRequest) =>
      workoutTableApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLES });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLE(id) });
    },
  });
}

export function useArchiveWorkoutTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutTableApi.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLES });
    },
  });
}
