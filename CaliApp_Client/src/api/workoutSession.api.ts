import { api } from './axios';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type {
  WorkoutSession,
  StartSessionRequest,
  UpdateSessionRequest,
  LogRestDayRequest,
} from '../types/workoutSession.types';

export const workoutSessionApi = {
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<WorkoutSession>> {
    const res = await api.get<ApiResponse<WorkoutSession[]>>('/workout-sessions', {
      params: { page, limit },
    });
    return {
      items: res.data.data,
      meta: res.data.meta ?? { page, limit, total: res.data.data.length },
    };
  },

  async getById(id: string): Promise<WorkoutSession> {
    const res = await api.get<ApiResponse<WorkoutSession>>(
      `/workout-sessions/${id}`
    );
    return res.data.data;
  },

  async start(data: StartSessionRequest): Promise<WorkoutSession> {
    const res = await api.post<ApiResponse<WorkoutSession>>(
      '/workout-sessions',
      data
    );
    return res.data.data;
  },

  async update(id: string, data: UpdateSessionRequest): Promise<WorkoutSession> {
    const res = await api.patch<ApiResponse<WorkoutSession>>(
      `/workout-sessions/${id}`,
      data
    );
    return res.data.data;
  },

  async complete(id: string): Promise<WorkoutSession> {
    return this.update(id, { status: 'completed' });
  },

  async cancel(id: string): Promise<WorkoutSession> {
    return this.update(id, { status: 'cancelled' });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/workout-sessions/${id}`);
  },

  async logRestDay(data: LogRestDayRequest = {}): Promise<WorkoutSession> {
    const res = await api.post<ApiResponse<WorkoutSession>>(
      '/workout-sessions/rest-day',
      data
    );
    return res.data.data;
  },
};
