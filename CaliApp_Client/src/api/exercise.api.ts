import { api } from './axios';
import type { ApiResponse } from '../types/api.types';
import type {
  Exercise,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from '../types/exercise.types';

export const exerciseApi = {
  async getAll(): Promise<Exercise[]> {
    const res = await api.get<ApiResponse<Exercise[]>>('/exercises');
    return res.data.data;
  },

  async getById(id: string): Promise<Exercise> {
    const res = await api.get<ApiResponse<Exercise>>(`/exercises/${id}`);
    return res.data.data;
  },

  async create(data: CreateExerciseRequest): Promise<Exercise> {
    const res = await api.post<ApiResponse<Exercise>>('/exercises', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateExerciseRequest): Promise<Exercise> {
    const res = await api.patch<ApiResponse<Exercise>>(`/exercises/${id}`, data);
    return res.data.data;
  },

  async archive(id: string): Promise<void> {
    await api.delete(`/exercises/${id}`);
  },
};
