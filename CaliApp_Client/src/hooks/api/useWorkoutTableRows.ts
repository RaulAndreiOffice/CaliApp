import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutTableRowApi } from '../../api/workoutTableRow.api';
import { QUERY_KEYS } from '../../utils/constants';
import type {
  CreateWorkoutTableRowRequest,
  UpdateWorkoutTableRowRequest,
  ReorderRowsRequest,
} from '../../types/workoutTable.types';

export function useWorkoutTableRows(tableId: string | undefined) {
  return useQuery({
    queryKey: tableId ? QUERY_KEYS.WORKOUT_TABLE_ROWS(tableId) : ['rows', 'none'],
    queryFn: () => workoutTableRowApi.getByTableId(tableId!),
    enabled: !!tableId,
  });
}

export function useCreateRow(tableId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkoutTableRowRequest) =>
      workoutTableRowApi.create(tableId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLE(tableId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLE_ROWS(tableId) });
    },
  });
}

export function useUpdateRow(tableId: string, rowId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWorkoutTableRowRequest) =>
      workoutTableRowApi.update(tableId, rowId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLE(tableId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLE_ROWS(tableId) });
    },
  });
}

export function useDeleteRow(tableId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rowId: string) => workoutTableRowApi.remove(tableId, rowId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLE(tableId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLE_ROWS(tableId) });
    },
  });
}

export function useReorderRows(tableId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReorderRowsRequest) =>
      workoutTableRowApi.reorder(tableId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLE(tableId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLE_ROWS(tableId) });
    },
  });
}
