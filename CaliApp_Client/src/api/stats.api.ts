import { api } from './axios';
import type { ApiResponse } from '../types/api.types';
import type {
  ExerciseProgress,
  WeeklyStats,
  DashboardOverview,
  TrainingLoadDashboard,
  ProgressInsights,
} from '../types/stats.types';

export type TrainingLoadRange = number | 'all';

export const statsApi = {
  async getExerciseProgress(
    exerciseId: string,
    weeks = 8
  ): Promise<ExerciseProgress> {
    const res = await api.get<ApiResponse<ExerciseProgress>>(
      `/stats/exercise/${exerciseId}`,
      { params: { weeks } }
    );
    return res.data.data;
  },

  async getWeekly(): Promise<WeeklyStats> {
    const res = await api.get<ApiResponse<WeeklyStats>>('/stats/weekly');
    return res.data.data;
  },

  async getOverview(): Promise<DashboardOverview> {
    const res = await api.get<ApiResponse<DashboardOverview>>('/stats/overview');
    return res.data.data;
  },

  async getTrainingLoadDashboard(weeks: TrainingLoadRange = 6): Promise<TrainingLoadDashboard> {
    const res = await api.get<ApiResponse<TrainingLoadDashboard>>(
      '/stats/training-load',
      { params: { weeks } }
    );
    return res.data.data;
  },

  async getProgressInsights(weeks = 8): Promise<ProgressInsights> {
    const res = await api.get<ApiResponse<ProgressInsights>>(
      '/stats/progress-insights',
      { params: { weeks } }
    );
    return res.data.data;
  },
};
