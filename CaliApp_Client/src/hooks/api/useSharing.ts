import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sharingApi } from '../../api/sharing.api';
import { QUERY_KEYS } from '../../utils/constants';
import type { CreateShareRequest } from '../../types/sharing.types';

export function useSharedWithMe() {
  return useQuery({
    queryKey: QUERY_KEYS.SHARED_WITH_ME,
    queryFn: () => sharingApi.getSharedWithMe(),
  });
}

export function useTableShares(tableId: string | undefined) {
  return useQuery({
    queryKey: tableId ? QUERY_KEYS.TABLE_SHARES(tableId) : ['shares', 'none'],
    queryFn: () => sharingApi.getShares(tableId!),
    enabled: !!tableId,
  });
}

export function useShareTable(tableId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShareRequest) => sharingApi.share(tableId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TABLE_SHARES(tableId) });
    },
  });
}

export function useRevokeShare(tableId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shareId: string) => sharingApi.revoke(tableId, shareId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TABLE_SHARES(tableId) });
    },
  });
}

export function useCopyShared() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shareId: string) => sharingApi.copyShared(shareId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKOUT_TABLES });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.SHARED_WITH_ME });
    },
  });
}
