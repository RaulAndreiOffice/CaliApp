import { api } from './axios';
import type { ApiResponse } from '../types/api.types';
import type {
  WorkoutTable,
  CreateWorkoutTableRequest,
  UpdateWorkoutTableRequest,
} from '../types/workoutTable.types';

export const workoutTableApi = {
  async getAll(): Promise<WorkoutTable[]> {
    const res = await api.get<ApiResponse<WorkoutTable[]>>('/workout-tables');
    return res.data.data;
  },

  async getById(id: string): Promise<WorkoutTable> {
    const res = await api.get<ApiResponse<WorkoutTable>>(`/workout-tables/${id}`);
    return res.data.data;
  },

  async create(data: CreateWorkoutTableRequest): Promise<WorkoutTable> {
    const res = await api.post<ApiResponse<WorkoutTable>>('/workout-tables', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateWorkoutTableRequest): Promise<WorkoutTable> {
    const res = await api.patch<ApiResponse<WorkoutTable>>(
      `/workout-tables/${id}`,
      data
    );
    return res.data.data;
  },

  async archive(id: string): Promise<void> {
    await api.delete(`/workout-tables/${id}`);
  },
};
