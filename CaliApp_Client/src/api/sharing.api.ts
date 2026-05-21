import { api } from './axios';
import type { ApiResponse } from '../types/api.types';
import type { Share, CreateShareRequest } from '../types/sharing.types';
import type { WorkoutTable } from '../types/workoutTable.types';

export const sharingApi = {
  async share(tableId: string, data: CreateShareRequest): Promise<Share> {
    const res = await api.post<ApiResponse<Share>>(
      `/workout-tables/${tableId}/share`,
      data
    );
    return res.data.data;
  },

  async getShares(tableId: string): Promise<Share[]> {
    const res = await api.get<ApiResponse<Share[]>>(
      `/workout-tables/${tableId}/shares`
    );
    return res.data.data;
  },

  async revoke(tableId: string, shareId: string): Promise<void> {
    await api.delete(`/workout-tables/${tableId}/shares/${shareId}`);
  },

  async getSharedWithMe(): Promise<Share[]> {
    const res = await api.get<ApiResponse<Share[]>>('/shared-with-me');
    return res.data.data;
  },

  async copyShared(shareId: string): Promise<WorkoutTable> {
    const res = await api.post<ApiResponse<WorkoutTable>>(
      `/shared-with-me/${shareId}/copy`
    );
    return res.data.data;
  },
};
