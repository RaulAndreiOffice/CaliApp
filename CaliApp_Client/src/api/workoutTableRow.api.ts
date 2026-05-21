import { api } from './axios';
import type { ApiResponse } from '../types/api.types';
import type {
  WorkoutTableRow,
  CreateWorkoutTableRowRequest,
  UpdateWorkoutTableRowRequest,
  ReorderRowsRequest,
} from '../types/workoutTable.types';

export const workoutTableRowApi = {
  async getByTableId(tableId: string): Promise<WorkoutTableRow[]> {
    const res = await api.get<ApiResponse<WorkoutTableRow[]>>(
      `/workout-tables/${tableId}/rows`
    );
    return res.data.data;
  },

  async create(
    tableId: string,
    data: CreateWorkoutTableRowRequest
  ): Promise<WorkoutTableRow> {
    const res = await api.post<ApiResponse<WorkoutTableRow>>(
      `/workout-tables/${tableId}/rows`,
      data
    );
    return res.data.data;
  },

  async update(
    tableId: string,
    rowId: string,
    data: UpdateWorkoutTableRowRequest
  ): Promise<WorkoutTableRow> {
    const res = await api.patch<ApiResponse<WorkoutTableRow>>(
      `/workout-tables/${tableId}/rows/${rowId}`,
      data
    );
    return res.data.data;
  },

  async remove(tableId: string, rowId: string): Promise<void> {
    await api.delete(`/workout-tables/${tableId}/rows/${rowId}`);
  },

  async reorder(tableId: string, data: ReorderRowsRequest): Promise<void> {
    await api.patch(`/workout-tables/${tableId}/rows/reorder`, data);
  },
};
