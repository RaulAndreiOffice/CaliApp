import { api } from './axios';
import type { ApiResponse } from '../types/api.types';
import type {
  PerformedSet,
  CreatePerformedSetRequest,
  UpdatePerformedSetRequest,
} from '../types/performedSet.types';

export const performedSetApi = {
  async create(
    sessionId: string,
    rowId: string,
    data: CreatePerformedSetRequest
  ): Promise<PerformedSet> {
    const res = await api.post<ApiResponse<PerformedSet>>(
      `/workout-sessions/${sessionId}/rows/${rowId}/sets`,
      data
    );
    return res.data.data;
  },

  async update(
    sessionId: string,
    rowId: string,
    setId: string,
    data: UpdatePerformedSetRequest
  ): Promise<PerformedSet> {
    const res = await api.patch<ApiResponse<PerformedSet>>(
      `/workout-sessions/${sessionId}/rows/${rowId}/sets/${setId}`,
      data
    );
    return res.data.data;
  },

  async remove(sessionId: string, rowId: string, setId: string): Promise<void> {
    await api.delete(
      `/workout-sessions/${sessionId}/rows/${rowId}/sets/${setId}`
    );
  },
};
