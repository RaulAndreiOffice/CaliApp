import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../../api/stats.api';
import { QUERY_KEYS } from '../../utils/constants';

export function useExerciseProgress(exerciseId: string | undefined, weeks = 8) {
  return useQuery({
    queryKey: exerciseId
      ? [...QUERY_KEYS.STATS_EXERCISE(exerciseId), weeks]
      : ['stats', 'exercise', 'none'],
    queryFn: () => statsApi.getExerciseProgress(exerciseId!, weeks),
    enabled: !!exerciseId,
  });
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: QUERY_KEYS.STATS_WEEKLY,
    queryFn: () => statsApi.getWeekly(),
  });
}

export function useOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.STATS_OVERVIEW,
    queryFn: () => statsApi.getOverview(),
  });
}

export function useTrainingLoadDashboard(weeks = 6) {
  return useQuery({
    queryKey: [...QUERY_KEYS.STATS_TRAINING_LOAD, weeks],
    queryFn: () => statsApi.getTrainingLoadDashboard(weeks),
  });
}
