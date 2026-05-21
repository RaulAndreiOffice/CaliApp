import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { exerciseApi } from '../../api/exercise.api';
import { QUERY_KEYS } from '../../utils/constants';
import type {
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from '../../types/exercise.types';

export function useExercises() {
  return useQuery({
    queryKey: QUERY_KEYS.EXERCISES,
    queryFn: () => exerciseApi.getAll(),
  });
}

export function useExercise(id: string | undefined) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.EXERCISE(id) : ['exercises', 'none'],
    queryFn: () => exerciseApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExerciseRequest) => exerciseApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES });
    },
  });
}

export function useUpdateExercise(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateExerciseRequest) => exerciseApi.update(id, data),
    onSuccess: async () => {
      qc.removeQueries({
        predicate: (query) => query.queryKey[0] === QUERY_KEYS.WORKOUT_TABLES[0],
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES }),
        qc.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISE(id) }),
        qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLES }),
        qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_SESSIONS }),
      ]);
    },
  });
}

export function useArchiveExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exerciseApi.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.EXERCISES });
    },
  });
}
